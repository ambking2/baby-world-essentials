-- نگهداری آپلودها در D1 برای اجرای رایگان روی Cloudflare (بدون R2).

CREATE TABLE IF NOT EXISTS uploads (
  key TEXT PRIMARY KEY,
  mime_type TEXT NOT NULL,
  content BLOB NOT NULL,
  created_at TEXT NOT NULL
);
