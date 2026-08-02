import { db } from "@/lib/supabase";
import { hashPassword, verifyPassword } from "@/lib/auth/password";

export interface UserRecord {
  id: string;
  email: string;
  password_hash: string;
  is_email_verified: number;
  email_confirm_token: string | null;
  email_confirm_expires_at: string | null;
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
  const { data, error } = await db
    .from("users")
    .select("*")
    .eq("email", normalizeEmail(email))
    .limit(1)
    .single();

  if (error && error.code !== "PGRST116") { // PGRST116 is no rows returned
    console.error("findUserByEmail error:", error);
  }

  return data || null;
}

export async function findUserByResetToken(
  token: string,
): Promise<UserRecord | null> {
  const { data, error } = await db
    .from("users")
    .select("*")
    .eq("reset_token", token)
    .gt("reset_token_expires_at", new Date().toISOString())
    .limit(1)
    .single();

  if (error && error.code !== "PGRST116") {
    console.error("findUserByResetToken error:", error);
  }

  return data || null;
}

export async function createUser(
  email: string,
  password: string,
): Promise<UserRecord> {
  const passwordHash = await hashPassword(password);
  
  const { data, error } = await db
    .from("users")
    .insert({
      email: normalizeEmail(email),
      password_hash: passwordHash,
      is_email_verified: 0,
    })
    .select("*")
    .single();

  if (error || !data) {
    throw new Error("Failed to create user: " + (error?.message || "unknown"));
  }

  return data;
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

export async function setUserEmailConfirmation(
  userId: string,
  token: string,
  expiresAt: string,
): Promise<void> {
  const { error } = await db
    .from("users")
    .update({
      email_confirm_token: token,
      email_confirm_expires_at: expiresAt,
      updated_at: new Date().toISOString()
    })
    .eq("id", userId);

  if (error) {
    console.error("setUserEmailConfirmation error:", error);
  }
}

export async function findUserByEmailConfirmationToken(
  token: string,
): Promise<UserRecord | null> {
  const { data, error } = await db
    .from("users")
    .select("*")
    .eq("email_confirm_token", token)
    .gt("email_confirm_expires_at", new Date().toISOString())
    .eq("is_email_verified", 0)
    .limit(1)
    .single();

  if (error && error.code !== "PGRST116") {
    console.error("findUserByEmailConfirmationToken error:", error);
  }

  return data || null;
}

export async function markUserEmailAsVerified(userId: string): Promise<void> {
  const { error } = await db
    .from("users")
    .update({
      is_email_verified: 1,
      email_confirm_token: null,
      email_confirm_expires_at: null,
      updated_at: new Date().toISOString()
    })
    .eq("id", userId);
    
  if (error) {
    console.error("markUserEmailAsVerified error:", error);
  }
}

export async function setUserResetToken(
  userId: string,
  token: string,
  expiresAt: string,
): Promise<void> {
  const { error } = await db
    .from("users")
    .update({
      reset_token: token,
      reset_token_expires_at: expiresAt,
      updated_at: new Date().toISOString()
    })
    .eq("id", userId);
    
  if (error) {
    console.error("setUserResetToken error:", error);
  }
}

export async function clearUserResetToken(userId: string): Promise<void> {
  const { error } = await db
    .from("users")
    .update({
      reset_token: null,
      reset_token_expires_at: null,
      updated_at: new Date().toISOString()
    })
    .eq("id", userId);
    
  if (error) {
    console.error("clearUserResetToken error:", error);
  }
}

export async function updateUserPassword(
  userId: string,
  password: string,
): Promise<void> {
  const passwordHash = await hashPassword(password);

  const { error } = await db
    .from("users")
    .update({
      password_hash: passwordHash,
      updated_at: new Date().toISOString()
    })
    .eq("id", userId);
    
  if (error) {
    console.error("updateUserPassword error:", error);
  }
}
