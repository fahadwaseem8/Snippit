CREATE TABLE IF NOT EXISTS request_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), 
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS snippets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'plaintext',
  code TEXT NOT NULL,
  is_favorite SMALLINT NOT NULL DEFAULT 0, 
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, 
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT snippets_language_check CHECK (language IN (
    'javascript', 'typescript', 'python', 'java', 'csharp', 'cpp', 'c',
    'go', 'rust', 'ruby', 'php', 'swift', 'kotlin', 'scala', 'dart', 'r',
    'sql', 'html', 'css', 'scss', 'sass', 'less', 'json', 'yaml', 'xml',
    'markdown', 'bash', 'shell', 'powershell', 'dockerfile', 'graphql',
    'lua', 'perl', 'elixir', 'clojure', 'haskell', 'ocaml', 'fsharp',
    'vim', 'makefile', 'toml', 'ini', 'plaintext', 'other'
  ))
);

-- Note: Postgres does not automatically update 'updated_at' like SQLite does via trigger.
-- We must handle updated_at in the application layer OR create a Postgres trigger function.
-- Let's create a trigger function for Snippets updated_at
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_snippets_modtime
BEFORE UPDATE ON snippets
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

CREATE INDEX IF NOT EXISTS idx_snippets_owner_id ON snippets(owner_id);
CREATE INDEX IF NOT EXISTS idx_snippets_updated_at ON snippets(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_snippets_favorites ON snippets(owner_id, is_favorite);
CREATE INDEX IF NOT EXISTS idx_request_logs_created_at ON request_logs(created_at DESC);
