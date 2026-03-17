import { NextRequest, NextResponse } from "next/server";
import { d1Execute, ensureD1Schema } from "@/lib/d1";

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

export async function logRequest(data: LogData) {
  try {
    await ensureD1Schema();

    await d1Execute(
      `
      INSERT INTO request_logs (
        id,
        ip_address,
        user_agent,
        method,
        url,
        headers,
        query_params,
        body,
        response_body,
        response_status,
        response_time,
        created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        crypto.randomUUID(),
        data.ip_address,
        data.user_agent,
        data.method,
        data.url,
        JSON.stringify(data.headers || {}),
        JSON.stringify(data.query_params || {}),
        data.body === undefined ? null : JSON.stringify(data.body),
        data.response_body === undefined
          ? null
          : JSON.stringify(data.response_body),
        data.response_status,
        data.response_time,
        new Date().toISOString(),
      ],
    );
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
): Promise<NextResponse> {
  const startTime = Date.now();

  // Extract request data
  const ip = getClientIP(request);
  const userAgent = request.headers.get("user-agent") || "unknown";
  const method = request.method;
  const url = request.nextUrl.pathname;
  const headers = extractHeaders(request);
  const queryParams = extractQueryParams(request);

  let body: unknown;
  try {
    if (request.method !== "GET" && request.method !== "HEAD") {
      const clonedRequest = request.clone();
      body = await clonedRequest.json();
    }
  } catch {
    body = null;
  }

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

  const responseTime = Date.now() - startTime;

  // Await log insert so serverless runtimes do not drop writes after response return.
  await logRequest({
    ip_address: ip,
    user_agent: userAgent,
    method,
    url,
    headers,
    query_params: queryParams,
    body,
    response_body: responseBody,
    response_status: responseStatus,
    response_time: responseTime,
  });

  return response;
}
