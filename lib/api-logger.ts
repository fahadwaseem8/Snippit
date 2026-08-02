import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/supabase";

interface LogData {
  ip_address: string;
  user_agent: string;
  method: string;
  url: string;
  headers: Record<string, string>;
  query_params: Record<string, string | string[]>;
  body?: unknown;
  response_body?: unknown;
  response_status: number;
  response_time: number;
}

interface APILoggingOptions {
  sensitiveFields?: string[];
}

const DEFAULT_SENSITIVE_FIELDS = [
  "password",
  "newpassword",
  "confirmpassword",
  "token",
  "reset_token",
  "email_confirm_token",
  "session",
  "sessiontoken",
  "authorization",
  "cookie",
  "password_hash",
  "resetlink",
  "confirmationlink",
];

function isSensitiveKey(key: string, sensitiveFields: Set<string>): boolean {
  return sensitiveFields.has(key.toLowerCase());
}

function sanitizeUnknown(
  value: unknown,
  sensitiveFields: Set<string>,
): unknown {
  if (value === null || value === undefined) {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeUnknown(item, sensitiveFields));
  }

  if (typeof value === "object") {
    const source = value as Record<string, unknown>;
    const sanitized: Record<string, unknown> = {};

    for (const [key, item] of Object.entries(source)) {
      if (isSensitiveKey(key, sensitiveFields)) {
        sanitized[key] = "[REDACTED]";
      } else {
        sanitized[key] = sanitizeUnknown(item, sensitiveFields);
      }
    }

    return sanitized;
  }

  return value;
}

function sanitizeQueryParams(
  queryParams: Record<string, string | string[]>,
  sensitiveFields: Set<string>,
): Record<string, string | string[]> {
  const sanitized: Record<string, string | string[]> = {};

  for (const [key, value] of Object.entries(queryParams)) {
    if (isSensitiveKey(key, sensitiveFields)) {
      sanitized[key] = "[REDACTED]";
      continue;
    }

    sanitized[key] = value;
  }

  return sanitized;
}

export async function logRequest(data: LogData) {
  try {
    const { error } = await db.from("request_logs").insert({
      ip_address: data.ip_address,
      user_agent: data.user_agent,
      method: data.method,
      url: data.url,
      headers: JSON.stringify(data.headers || {}),
      query_params: JSON.stringify(data.query_params || {}),
      body: data.body === undefined ? null : JSON.stringify(data.body),
      response_body:
        data.response_body === undefined
          ? null
          : JSON.stringify(data.response_body),
      response_status: data.response_status,
      response_time: data.response_time,
      created_at: new Date().toISOString(),
    });

    if (error) {
      console.error("Error inserting request log into Supabase:", error);
    }
  } catch (error) {
    console.error("Error logging request:", error);
  }
}

export function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIP = request.headers.get("x-real-ip");

  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  if (realIP) {
    return realIP;
  }

  return "unknown";
}

export function extractHeaders(request: NextRequest): Record<string, string> {
  const headers: Record<string, string> = {};
  request.headers.forEach((value, key) => {
    // Skip sensitive headers
    if (!["authorization", "cookie"].includes(key.toLowerCase())) {
      headers[key] = value;
    }
  });
  return headers;
}

export function extractQueryParams(
  request: NextRequest,
): Record<string, string | string[]> {
  const params: Record<string, string | string[]> = {};
  const searchParams = request.nextUrl.searchParams;

  searchParams.forEach((value, key) => {
    const existing = params[key];
    if (existing) {
      params[key] = Array.isArray(existing)
        ? [...existing, value]
        : [existing, value];
    } else {
      params[key] = value;
    }
  });

  return params;
}

export async function withAPILogging(
  request: NextRequest,
  handler: () => Promise<NextResponse>,
  options: APILoggingOptions = {},
): Promise<NextResponse> {
  const startTime = Date.now();
  const sensitiveFields = new Set<string>([
    ...DEFAULT_SENSITIVE_FIELDS,
    ...(options.sensitiveFields || []),
  ]);

  // Extract request data
  const ip = getClientIP(request);
  const userAgent = request.headers.get("user-agent") || "unknown";
  const method = request.method;
  const url = request.nextUrl.pathname;
  const headers = extractHeaders(request);
  const queryParams = sanitizeQueryParams(
    extractQueryParams(request),
    sensitiveFields,
  );

  let body: unknown;
  try {
    if (request.method !== "GET" && request.method !== "HEAD") {
      const clonedRequest = request.clone();
      body = await clonedRequest.json();
    }
  } catch {
    body = null;
  }

  const sanitizedBody = sanitizeUnknown(body, sensitiveFields);

  // Execute the actual handler
  let response: NextResponse;
  let responseBody: unknown;
  let responseStatus: number;

  try {
    response = await handler();
    responseStatus = response.status;

    // Try to extract response body
    try {
      const clonedResponse = response.clone();
      const text = await clonedResponse.text();
      if (text) {
        responseBody = JSON.parse(text);
      }
    } catch {
      responseBody = null;
    }
  } catch (error) {
    responseStatus = 500;
    responseBody = { error: "Internal server error" };
    console.error("Handler error:", error);
    response = NextResponse.json(responseBody, { status: responseStatus });
  }

  const sanitizedResponseBody = sanitizeUnknown(responseBody, sensitiveFields);

  const responseTime = Date.now() - startTime;

  // Await log insert so serverless runtimes do not drop writes after response return.
  await logRequest({
    ip_address: ip,
    user_agent: userAgent,
    method,
    url,
    headers,
    query_params: queryParams,
    body: sanitizedBody,
    response_body: sanitizedResponseBody,
    response_status: responseStatus,
    response_time: responseTime,
  });

  return response;
}
