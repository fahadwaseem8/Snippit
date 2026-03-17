import { d1Execute, d1Rows, ensureD1Schema } from "@/lib/d1";
import { hashPassword, verifyPassword } from "@/lib/auth/password";

export interface UserRecord {
  id: string;
  email: string;
  password_hash: string;
  reset_token: string | null;
  reset_token_expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function findUserByEmail(
  email: string,
): Promise<UserRecord | null> {
  await ensureD1Schema();

  const rows = await d1Rows<UserRecord>(
    `SELECT * FROM users WHERE email = ? LIMIT 1`,
    [normalizeEmail(email)],
  );

  return rows[0] || null;
}

export async function findUserByResetToken(
  token: string,
): Promise<UserRecord | null> {
  await ensureD1Schema();

  const rows = await d1Rows<UserRecord>(
    `
    SELECT * FROM users
    WHERE reset_token = ?
      AND reset_token_expires_at > ?
    LIMIT 1
    `,
    [token, new Date().toISOString()],
  );

  return rows[0] || null;
}

export async function createUser(
  email: string,
  password: string,
): Promise<UserRecord> {
  await ensureD1Schema();

  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const passwordHash = await hashPassword(password);

  await d1Execute(
    `INSERT INTO users (id, email, password_hash, created_at, updated_at) VALUES (?, ?, ?, ?, ?)`,
    [id, normalizeEmail(email), passwordHash, now, now],
  );

  const created = await d1Rows<UserRecord>(
    `SELECT * FROM users WHERE id = ? LIMIT 1`,
    [id],
  );

  if (!created[0]) {
    throw new Error("Failed to create user");
  }

  return created[0];
}

export async function validateUserCredentials(
  email: string,
  password: string,
): Promise<UserRecord | null> {
  const user = await findUserByEmail(email);

  if (!user) {
    return null;
  }

  const isValid = await verifyPassword(password, user.password_hash);
  return isValid ? user : null;
}

export async function setUserResetToken(
  userId: string,
  token: string,
  expiresAt: string,
): Promise<void> {
  await ensureD1Schema();

  await d1Execute(
    `
    UPDATE users
    SET reset_token = ?, reset_token_expires_at = ?, updated_at = ?
    WHERE id = ?
    `,
    [token, expiresAt, new Date().toISOString(), userId],
  );
}

export async function clearUserResetToken(userId: string): Promise<void> {
  await ensureD1Schema();

  await d1Execute(
    `
    UPDATE users
    SET reset_token = NULL, reset_token_expires_at = NULL, updated_at = ?
    WHERE id = ?
    `,
    [new Date().toISOString(), userId],
  );
}

export async function updateUserPassword(
  userId: string,
  password: string,
): Promise<void> {
  await ensureD1Schema();
  const passwordHash = await hashPassword(password);

  await d1Execute(
    `
    UPDATE users
    SET password_hash = ?, updated_at = ?
    WHERE id = ?
    `,
    [passwordHash, new Date().toISOString(), userId],
  );
}
