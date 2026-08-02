import type { NextRequest } from "next/server";
import { db } from "@/lib/supabase";

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
  const token = generateToken();
  const now = new Date();
  const expires = new Date(now);
  expires.setDate(expires.getDate() + SESSION_DURATION_DAYS);

  const { error } = await db
    .from("sessions")
    .insert({
      token,
      user_id: user.id,
      expires_at: expires.toISOString(),
      created_at: now.toISOString(),
    });
    
  if (error) {
    console.error("createSession error:", error);
  }

  return { token, expiresAt: expires.toISOString() };
}

export async function getSessionByToken(
  token: string,
): Promise<SessionResult | null> {
  const { data, error } = await db
    .from("sessions")
    .select("token, expires_at, user_id, users (id, email)")
    .eq("token", token)
    .gt("expires_at", new Date().toISOString())
    .limit(1)
    .single();

  if (error) {
    if (error.code !== "PGRST116") {
      console.error("getSessionByToken error:", error);
    }
    return null;
  }

  if (!data || !data.users) {
    return null;
  }

  // Handle Supabase joining returning array or object
  const user = Array.isArray(data.users) ? data.users[0] : data.users;

  return {
    token: data.token,
    expiresAt: data.expires_at,
    user: {
      id: user.id,
      email: user.email,
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
  await db.from("sessions").delete().eq("token", token);
}

export async function deleteSessionsForUser(userId: string): Promise<void> {
  await db.from("sessions").delete().eq("user_id", userId);
}

export async function pruneExpiredSessions(): Promise<void> {
  await db
    .from("sessions")
    .delete()
    .lte("expires_at", new Date().toISOString());
}
