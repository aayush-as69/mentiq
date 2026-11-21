import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { getSession } from "@/lib/auth";

export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

const buckets = new Map();

/** Small in-memory sliding-window limiter (swap for Redis when running multiple instances). */
export function rateLimit(key, max, windowMs) {
  const now = Date.now();
  const hits = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);
  if (hits.length >= max) {
    throw new ApiError(429, "You're going a bit fast. Please wait a moment and try again.");
  }
  hits.push(now);
  buckets.set(key, hits);
  if (buckets.size > 5000) buckets.clear();
}

function clientIp(request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
}

async function readJson(request) {
  try {
    return await request.json();
  } catch {
    return {};
  }
}

/**
 * Wraps a route handler with auth, role checks, rate limiting, JSON parsing and
 * consistent error responses.  handler({ request, session, params, body }).
 */
export function route(handler, { roles, limit } = {}) {
  return async (request, context) => {
    try {
      let session = null;
      if (roles) {
        session = await getSession();
        if (!session) throw new ApiError(401, "Please sign in to continue.");
        if (!roles.includes(session.role)) throw new ApiError(403, "You don't have access to this resource.");
      }
      if (limit) {
        rateLimit(`${limit.name}:${session?.id ?? clientIp(request)}`, limit.max, limit.windowMs);
      }
      const params = context?.params ? await context.params : {};
      const body = ["POST", "PUT", "PATCH", "DELETE"].includes(request.method) ? await readJson(request) : null;
      const data = await handler({ request, session, params, body });
      return data instanceof Response ? data : NextResponse.json(data ?? { ok: true });
    } catch (error) {
      if (error instanceof ZodError) {
        const issue = error.issues[0];
        const field = issue?.path?.join(".") || "input";
        return NextResponse.json({ error: `Invalid ${field}: ${issue?.message ?? "please check your input"}` }, { status: 400 });
      }
      if (error instanceof ApiError) {
        return NextResponse.json({ error: error.message }, { status: error.status });
      }
      console.error("[api]", request.method, request.url, error);
      return NextResponse.json({ error: "Something went wrong on our side. Please try again." }, { status: 500 });
    }
  };
}
