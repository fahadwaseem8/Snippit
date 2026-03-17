import { getCloudflareContext } from "@opennextjs/cloudflare";

type D1Param = string | number | null;

interface D1Meta {
  changes?: number;
  last_row_id?: number;
}

interface D1QueryResult<T = Record<string, unknown>> {
  results?: T[];
  meta?: D1Meta;
}

interface D1PreparedStatement {
  bind(...values: D1Param[]): D1PreparedStatement;
  all<T = Record<string, unknown>>(): Promise<D1QueryResult<T>>;
  run(): Promise<D1QueryResult>;
}

interface D1ColumnInfo {
  name: string;
}

interface D1Binding {
  prepare(query: string): D1PreparedStatement;
}

async function getDatabase(): Promise<D1Binding> {
  const { env } = await getCloudflareContext();
  const db = (env as { DB?: D1Binding }).DB;

  if (!db) {
    throw new Error(
      "Missing D1 binding 'DB'. Add the d1_databases binding in wrangler.jsonc.",
    );
  }

  return db;
}

export async function d1Rows<T = Record<string, unknown>>(
  sql: string,
  params: D1Param[] = [],
): Promise<T[]> {
  const db = await getDatabase();
  const statement = db.prepare(sql);
  const boundStatement = params.length ? statement.bind(...params) : statement;
  const result = await boundStatement.all<T>();
  return result.results || [];
}

export async function d1Execute(
  sql: string,
  params: D1Param[] = [],
): Promise<{ changes: number; lastRowId: number }> {
  const db = await getDatabase();
  const statement = db.prepare(sql);
  const boundStatement = params.length ? statement.bind(...params) : statement;
  const result = await boundStatement.run();
  return {
    changes: result.meta?.changes || 0,
    lastRowId: result.meta?.last_row_id || 0,
  };
}

let schemaInitPromise: Promise<void> | null = null;

export function ensureD1Schema(): Promise<void> {
  if (!schemaInitPromise) {
    schemaInitPromise = initializeSchema();
  }

  return schemaInitPromise;
}

async function initializeSchema(): Promise<void> {
  const statements = [
    `
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      reset_token TEXT,
      reset_token_expires_at TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
    `,
    `
    CREATE TABLE IF NOT EXISTS sessions (
      token TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    )
    `,
    `
    CREATE TABLE IF NOT EXISTS snippets (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      language TEXT NOT NULL DEFAULT 'plaintext',
      code TEXT NOT NULL,
      is_favorite INTEGER NOT NULL DEFAULT 0,
      owner_id TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY(owner_id) REFERENCES users(id) ON DELETE CASCADE
    )
    `,
    `
    CREATE TABLE IF NOT EXISTS request_logs (
      id TEXT PRIMARY KEY,
      ip_address TEXT NOT NULL,
      user_agent TEXT NOT NULL,
      method TEXT NOT NULL,
      url TEXT NOT NULL,
      headers TEXT NOT NULL,
      query_params TEXT NOT NULL,
      body TEXT,
      response_body TEXT,
      response_status INTEGER,
      response_time INTEGER,
      created_at TEXT NOT NULL
    )
    `,
    `CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`,
    `CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id)`,
    `CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at)`,
    `CREATE INDEX IF NOT EXISTS idx_snippets_owner_id ON snippets(owner_id)`,
    `CREATE INDEX IF NOT EXISTS idx_snippets_updated_at ON snippets(updated_at DESC)`,
    `CREATE INDEX IF NOT EXISTS idx_snippets_favorites ON snippets(owner_id, is_favorite)`,
    `CREATE INDEX IF NOT EXISTS idx_request_logs_created_at ON request_logs(created_at DESC)`,
  ];

  for (const sql of statements) {
    await d1Execute(sql);
  }

  const userColumns = await d1Rows<D1ColumnInfo>(`PRAGMA table_info(users)`);
  const columnNames = new Set(userColumns.map((column) => column.name));

  if (!columnNames.has("is_email_verified")) {
    await d1Execute(
      `ALTER TABLE users ADD COLUMN is_email_verified INTEGER NOT NULL DEFAULT 0`,
    );
  }

  if (!columnNames.has("email_confirm_token")) {
    await d1Execute(`ALTER TABLE users ADD COLUMN email_confirm_token TEXT`);
  }

  if (!columnNames.has("email_confirm_expires_at")) {
    await d1Execute(`ALTER TABLE users ADD COLUMN email_confirm_expires_at TEXT`);
  }

  await d1Execute(
    `CREATE INDEX IF NOT EXISTS idx_users_email_confirm_token ON users(email_confirm_token)`,
  );
}
