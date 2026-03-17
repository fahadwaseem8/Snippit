CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  is_email_verified INTEGER NOT NULL DEFAULT 0,
  email_confirm_token TEXT,
  email_confirm_expires_at TEXT,
  reset_token TEXT,
  reset_token_expires_at TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sessions (
  token TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

DROP TABLE IF EXISTS request_logs;
CREATE TABLE IF NOT EXISTS request_logs (
  id TEXT PRIMARY KEY, 
  ip_address TEXT NOT NULL,
  user_agent TEXT NOT NULL,
  method TEXT NOT NULL,
  url TEXT NOT NULL,
  headers TEXT NOT NULL DEFAULT '{}',
  query_params TEXT NOT NULL DEFAULT '{}',
  body TEXT,
  response_body TEXT,
  response_status INTEGER,
  response_time INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
DROP TABLE IF EXISTS snippets;
CREATE TABLE IF NOT EXISTS snippets (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'plaintext',
  code TEXT NOT NULL,
  is_favorite INTEGER NOT NULL DEFAULT 0, 
  owner_id TEXT NOT NULL, 
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT snippets_language_check CHECK (language IN (
    'javascript', 'typescript', 'python', 'java', 'csharp', 'cpp', 'c',
    'go', 'rust', 'ruby', 'php', 'swift', 'kotlin', 'scala', 'dart', 'r',
    'sql', 'html', 'css', 'scss', 'sass', 'less', 'json', 'yaml', 'xml',
    'markdown', 'bash', 'shell', 'powershell', 'dockerfile', 'graphql',
    'lua', 'perl', 'elixir', 'clojure', 'haskell', 'ocaml', 'fsharp',
    'vim', 'makefile', 'toml', 'ini', 'plaintext', 'other'
  ))
);
DROP TRIGGER IF EXISTS set_updated_at;
CREATE TRIGGER IF NOT EXISTS set_updated_at
AFTER UPDATE ON snippets
FOR EACH ROW
BEGIN
  UPDATE snippets SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_email_confirm_token ON users(email_confirm_token);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);