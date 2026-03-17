import type { NextRequest } from "next/server";
import { d1Execute, d1Rows, ensureD1Schema } from "@/lib/d1";

export const SESSION_COOKIE_NAME = "snippit_session";
const SESSION_DURATION_DAYS = 30;

export interface SessionUser {
  id: string;
  email: string;
}

export interface SessionResult {
  token: string;
  expiresAt: string;
  user: SessionUser;
}

export function buildSessionCookieOptions(expiresAt: string) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(expiresAt),
  };
}

function generateToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  let binary = "";

  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

export async function createSession(
  user: SessionUser,
): Promise<{ token: string; expiresAt: string }> {
  await ensureD1Schema();

  const token = generateToken();
  const now = new Date();
  const expires = new Date(now);
  expires.setDate(expires.getDate() + SESSION_DURATION_DAYS);

  await d1Execute(
    `INSERT INTO sessions (token, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)`,
    [token, user.id, expires.toISOString(), now.toISOString()],
  );

  return { token, expiresAt: expires.toISOString() };
}

export async function getSessionByToken(
  token: string,
): Promise<SessionResult | null> {
  await ensureD1Schema();

  const rows = await d1Rows<{
    token: string;
    expires_at: string;
    user_id: string;
    email: string;
  }>(
    `
    SELECT s.token, s.expires_at, u.id as user_id, u.email
    FROM sessions s
    INNER JOIN users u ON u.id = s.user_id
    WHERE s.token = ?
      AND s.expires_at > ?
    LIMIT 1
    `,
    [token, new Date().toISOString()],
  );

  const row = rows[0];

  if (!row) {
    return null;
  }

  return {
    token: row.token,
    expiresAt: row.expires_at,
    user: {
      id: row.user_id,
      email: row.email,
    },
  };
}

export async function getSessionFromRequest(
  request: NextRequest,
): Promise<SessionResult | null> {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  return getSessionByToken(token);
}

export async function deleteSession(token: string): Promise<void> {
  await ensureD1Schema();
  await d1Execute(`DELETE FROM sessions WHERE token = ?`, [token]);
}

export async function deleteSessionsForUser(userId: string): Promise<void> {
  await ensureD1Schema();
  await d1Execute(`DELETE FROM sessions WHERE user_id = ?`, [userId]);
}

export async function pruneExpiredSessions(): Promise<void> {
  await ensureD1Schema();
  await d1Execute(`DELETE FROM sessions WHERE expires_at <= ?`, [
    new Date().toISOString(),
  ]);
}
