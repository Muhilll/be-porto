import { Context, Next } from "hono";
import { verifyToken } from "../utils/jwt";

/**
 * Middleware untuk mengecek JWT token
 * Validasi Bearer token di Authorization header
 * Gunakan di route yang memerlukan autentikasi user
 */
export const jwtMiddleware = async (c: Context, next: Next) => {
  const authorization = c.req.header("Authorization");

  if (!authorization) {
    return c.json(
      {
        success: false,
        message: "Unauthorized - Missing authorization header",
      },
      401
    );
  }

  // Extract token dari "Bearer <token>"
  const token = authorization.startsWith("Bearer ")
    ? authorization.slice(7)
    : authorization;

  if (!token) {
    return c.json(
      {
        success: false,
        message: "Unauthorized - Missing token",
      },
      401
    );
  }

  // Verify token
  const payload = verifyToken(token);

  if (!payload) {
    return c.json(
      {
        success: false,
        message: "Unauthorized - Invalid or expired token",
      },
      401
    );
  }

  // Attach user info ke context
  c.set("user", payload);

  await next();
};

/**
 * Middleware untuk optional JWT verification
 * Jika ada token, verify dan attach user info
 * Jika tidak ada token, tetap lanjut
 */
export const optionalJwtMiddleware = async (c: Context, next: Next) => {
  const authorization = c.req.header("Authorization");

  if (authorization) {
    const token = authorization.startsWith("Bearer ")
      ? authorization.slice(7)
      : authorization;

    if (token) {
      const payload = verifyToken(token);
      if (payload) {
        c.set("user", payload);
      }
    }
  }

  await next();
};

