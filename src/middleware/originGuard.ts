import { Context, Next } from "hono";
import { cors } from "hono/cors";

function normalizeOrigin(origin: string) {
  return origin.trim().replace(/\/+$/, "");
}

const allowedOrigins = (process.env.ALLOWED_APP_URL ?? "")
  .split(",")
  .map((origin) => normalizeOrigin(origin))
  .filter(Boolean);

function getRequestOrigin(c: Context) {
  const origin = c.req.header("origin");

  if (origin) {
    return origin;
  }

  const referer = c.req.header("referer");

  if (!referer) {
    return undefined;
  }

  try {
    return normalizeOrigin(new URL(referer).origin);
  } catch {
    return undefined;
  }
}

function getServerOrigin(c: Context) {
  try {
    return normalizeOrigin(new URL(c.req.url).origin);
  } catch {
    return undefined;
  }
}

export const originGuard = async (c: Context, next: Next) => {
  if (allowedOrigins.length === 0) {
    await next();
    return;
  }

  const requestOrigin = getRequestOrigin(c);
  const normalizedRequestOrigin = requestOrigin
    ? normalizeOrigin(requestOrigin)
    : undefined;
  const serverOrigin = getServerOrigin(c);

  if (!normalizedRequestOrigin) {
    await next();
    return;
  }

  // Allow same-origin requests, including docs pages that fetch local assets/specs.
  if (serverOrigin && normalizedRequestOrigin === serverOrigin) {
    await next();
    return;
  }

  if (!allowedOrigins.includes(normalizedRequestOrigin)) {
    return c.json(
      {
        success: false,
        message: "Forbidden origin",
      },
      403,
    );
  }

  await next();
};

export const corsMiddleware = cors({
  origin: (origin) => {
    if (!origin) {
      return "";
    }

    const normalizedOrigin = normalizeOrigin(origin);

    if (allowedOrigins.length === 0) {
      return normalizedOrigin;
    }

    return allowedOrigins.includes(normalizedOrigin) ? normalizedOrigin : "";
  },
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'X-App-Token'],
  credentials: true,
});
