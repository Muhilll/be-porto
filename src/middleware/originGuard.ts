import { Context, Next } from "hono";
import { cors } from "hono/cors";

function normalizeOrigin(origin: string) {
  return origin.trim().replace(/^["']|["']$/g, "").replace(/\/+$/, "").toLowerCase();
}

function getAllowedOrigins(): string[] {
  const envVal = process.env.ALLOWED_APP_URL ?? "";
  return envVal
    .split(",")
    .map((origin) => normalizeOrigin(origin))
    .filter(Boolean);
}

export function isOriginAllowed(origin: string | undefined): boolean {
  if (!origin) return false;
  const normalized = normalizeOrigin(origin);
  const allowed = getAllowedOrigins();

  // If ALLOWED_APP_URL is empty or includes wildcard '*', allow all
  if (allowed.length === 0 || allowed.includes("*")) {
    return true;
  }

  // Automatically allow vercel.app domains and localhost for seamless deployment
  try {
    const hostname = new URL(normalized).hostname;
    if (hostname.endsWith(".vercel.app") || hostname === "localhost" || hostname === "127.0.0.1") {
      return true;
    }
  } catch {
    // ignore parsing errors
  }

  return allowed.some((item) => {
    if (item === "*") return true;

    // Wildcard subdomain matching (e.g. *.vercel.app)
    if (item.startsWith("*.")) {
      const domainSuffix = item.slice(2);
      try {
        const host = new URL(normalized).hostname;
        return host === domainSuffix || host.endsWith("." + domainSuffix);
      } catch {
        return normalized.endsWith(domainSuffix);
      }
    }

    return normalized === item;
  });
}

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
  const requestOrigin = getRequestOrigin(c);
  if (!requestOrigin) {
    await next();
    return;
  }

  const normalizedRequestOrigin = normalizeOrigin(requestOrigin);
  const serverOrigin = getServerOrigin(c);

  // Allow same-origin requests, including docs pages that fetch local assets/specs.
  if (serverOrigin && normalizedRequestOrigin === serverOrigin) {
    await next();
    return;
  }

  if (!isOriginAllowed(normalizedRequestOrigin)) {
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

    if (isOriginAllowed(origin)) {
      return origin;
    }

    return "";
  },
  allowMethods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowHeaders: ["Content-Type", "Authorization", "X-App-Token"],
  credentials: true,
});
