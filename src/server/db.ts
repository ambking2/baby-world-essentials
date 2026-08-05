import { schemaStatements } from "./schema";

import type { CloudflareEnv, D1Database } from "@/types/cloudflare";

/**
 * لایه‌ی دیتابیس فروشگاه — سازگار با Cloudflare Workers.
 *
 * دو درایور دارد و بین‌شان به‌صورت خودکار انتخاب می‌کند:
 *
 *   ۱. Cloudflare D1  — وقتی binding با نام DB در دسترس باشد (روی ورکر).
 *   ۲. node:sqlite    — برای اجرای محلی با `npm run dev` و اسکریپت seed.
 *
 * تمام توابع async هستند، چون D1 هیچ API همگامی ندارد. این تنها دلیل تبدیل
 * کل لایه‌ی داده به async بود.
 */

export type SqlValue = string | number | null;
export type SqlInput = string | number | boolean | null | undefined;

export type RunResult = { changes: number; lastInsertRowid: number };

export type Statement = { query: string; params: Array<SqlValue> };

interface Driver {
  all<T>(query: string, params: Array<SqlValue>): Promise<Array<T>>;
  one<T>(query: string, params: Array<SqlValue>): Promise<T | undefined>;
  run(query: string, params: Array<SqlValue>): Promise<RunResult>;
  batch(statements: Array<Statement>): Promise<Array<RunResult>>;
}

/* ------------------------------------------------------------------ */
/* تبدیل مقادیر ورودی                                                 */
/* ------------------------------------------------------------------ */

function normalize(values: Array<SqlInput>): Array<SqlValue> {
  return values.map((value) => {
    if (value === undefined) return null;
    if (typeof value === "boolean") return value ? 1 : 0;
    return value;
  });
}

/* ------------------------------------------------------------------ */
/* درایور Cloudflare D1                                               */
/* ------------------------------------------------------------------ */

function d1Driver(database: D1Database): Driver {
  return {
    async all<T>(query, params) {
      const result = await database
        .prepare(query)
        .bind(...params)
        .all<T>();
      return result.results ?? [];
    },
    async one<T>(query, params) {
      const row = await database
        .prepare(query)
        .bind(...params)
        .first<T>();
      return row ?? undefined;
    },
    async run(query, params) {
      const result = await database
        .prepare(query)
        .bind(...params)
        .run();
      return {
        changes: Number(result.meta?.changes ?? 0),
        lastInsertRowid: Number(result.meta?.last_row_id ?? 0),
      };
    },
    async batch(statements) {
      if (statements.length === 0) return [];
      const prepared = statements.map((statement) =>
        database.prepare(statement.query).bind(...statement.params),
      );
      const results = await database.batch(prepared);
      return results.map((result) => ({
        changes: Number(result.meta?.changes ?? 0),
        lastInsertRowid: Number(result.meta?.last_row_id ?? 0),
      }));
    },
  };
}

/* ------------------------------------------------------------------ */
/* درایور محلی روی node:sqlite                                        */
/* ------------------------------------------------------------------ */

type LocalDatabase = {
  exec(sql: string): void;
  prepare(sql: string): {
    all(...params: Array<SqlValue>): Array<unknown>;
    get(...params: Array<SqlValue>): unknown;
    run(...params: Array<SqlValue>): { changes: number | bigint; lastInsertRowid: number | bigint };
  };
};

let localDatabase: LocalDatabase | null = null;

async function openLocalDatabase(): Promise<LocalDatabase> {
  if (localDatabase) return localDatabase;

  const [{ DatabaseSync }, { mkdirSync }, { dirname, resolve }] = await Promise.all([
    import("node:sqlite"),
    import("node:fs"),
    import("node:path"),
  ]);

  const path = process.env["DATABASE_PATH"] ?? resolve(process.cwd(), "data/store.db");
  mkdirSync(dirname(path), { recursive: true });

  const instance = new DatabaseSync(path) as unknown as LocalDatabase;
  instance.exec("PRAGMA journal_mode = WAL;");
  instance.exec("PRAGMA foreign_keys = ON;");
  instance.exec("PRAGMA busy_timeout = 5000;");
  for (const statement of schemaStatements()) instance.exec(`${statement};`);

  localDatabase = instance;
  return instance;
}

function localDriver(instance: LocalDatabase): Driver {
  return {
    async all<T>(query, params) {
      return instance.prepare(query).all(...params) as Array<T>;
    },
    async one<T>(query, params) {
      return (instance.prepare(query).get(...params) as T | undefined) ?? undefined;
    },
    async run(query, params) {
      const result = instance.prepare(query).run(...params);
      return {
        changes: Number(result.changes),
        lastInsertRowid: Number(result.lastInsertRowid),
      };
    },
    async batch(statements) {
      const results: Array<RunResult> = [];
      instance.exec("BEGIN");
      try {
        for (const statement of statements) {
          const result = instance.prepare(statement.query).run(...statement.params);
          results.push({
            changes: Number(result.changes),
            lastInsertRowid: Number(result.lastInsertRowid),
          });
        }
        instance.exec("COMMIT");
      } catch (error) {
        instance.exec("ROLLBACK");
        throw error;
      }
      return results;
    },
  };
}

/* ------------------------------------------------------------------ */
/* انتخاب درایور                                                      */
/* ------------------------------------------------------------------ */

let cachedEnv: CloudflareEnv | null | undefined;

/** محیط ورکر را می‌خواند؛ بیرون از Cloudflare مقدار null برمی‌گرداند. */
export async function cloudflareEnv(): Promise<CloudflareEnv | null> {
  if (cachedEnv !== undefined) return cachedEnv;
  try {
    // فقط داخل رانتایم Cloudflare قابل resolve است.
    const workers = await import(/* @vite-ignore */ "cloudflare:workers");
    cachedEnv = (workers as { env?: CloudflareEnv }).env ?? null;
  } catch {
    cachedEnv = null;
  }
  return cachedEnv;
}

/** یک متغیر محیطی را از binding ورکر یا process.env می‌خواند. */
export async function envVar(name: string): Promise<string | undefined> {
  const env = await cloudflareEnv();
  const fromWorker = env?.[name];
  if (typeof fromWorker === "string" && fromWorker.length > 0) return fromWorker;
  const fromProcess = typeof process === "undefined" ? undefined : process.env?.[name];
  return fromProcess && fromProcess.length > 0 ? fromProcess : undefined;
}

let driverPromise: Promise<Driver> | null = null;

async function resolveDriver(): Promise<Driver> {
  const env = await cloudflareEnv();
  if (env?.DB) return d1Driver(env.DB);
  return localDriver(await openLocalDatabase());
}

function driver(): Promise<Driver> {
  driverPromise ??= resolveDriver();
  return driverPromise;
}

/* ------------------------------------------------------------------ */
/* API عمومی                                                          */
/* ------------------------------------------------------------------ */

export async function all<T>(query: string, ...params: Array<SqlInput>): Promise<Array<T>> {
  return (await driver()).all<T>(query, normalize(params));
}

export async function one<T>(query: string, ...params: Array<SqlInput>): Promise<T | undefined> {
  return (await driver()).one<T>(query, normalize(params));
}

export async function run(query: string, ...params: Array<SqlInput>): Promise<RunResult> {
  return (await driver()).run(query, normalize(params));
}

export async function count(query: string, ...params: Array<SqlInput>): Promise<number> {
  const row = await one<{ c: number }>(query, ...params);
  return row ? Number(row.c) : 0;
}

/** یک دستور آماده برای batch می‌سازد. */
export function statement(query: string, ...params: Array<SqlInput>): Statement {
  return { query, params: normalize(params) };
}

/**
 * چند دستور نوشتنی را اتمیک اجرا می‌کند.
 *
 * روی D1 با batch() انجام می‌شود که خودش یک تراکنش ضمنی است، و روی محیط محلی
 * با BEGIN/COMMIT. توجه: چون D1 تراکنش تعاملی ندارد، منطقی که لازم دارد بین
 * نوشتن‌ها چیزی بخواند باید خواندن‌ها را قبل از ساختن این لیست انجام دهد.
 */
export async function batch(statements: Array<Statement>): Promise<Array<RunResult>> {
  return (await driver()).batch(statements);
}

/** اسکیما را روی درایور فعال اعمال می‌کند (برای seed و اجرای محلی). */
export async function ensureSchema(): Promise<void> {
  const env = await cloudflareEnv();
  if (!env?.DB) {
    await openLocalDatabase();
    return;
  }
  for (const item of schemaStatements()) {
    await run(item);
  }
}

export function nowIso(): string {
  return new Date().toISOString();
}
