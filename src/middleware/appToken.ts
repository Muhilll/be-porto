import { Context, Next } from "hono";

/**
 * Middleware untuk mengecek APP_TOKEN
 * Gunakan untuk proteksi critical endpoints atau internal APIs
 */
export const appTokenMiddleware = async (c: Context, next: Next) => {
  const appToken = c.req.header("X-App-Token");
  const expectedToken = process.env.APP_TOKEN;

  if (!appToken) {
    return c.json(
      {
        success: false,
        message: "Unauthorized - Missing X-App-Token header",
      },
      401
    );
  }

  if (appToken !== expectedToken) {
    return c.json(
      {
        success: false,
        message: "Unauthorized - Invalid app token",
      },
      401
    );
  }

  await next();
};

/**
 * Middleware untuk logging request dengan timing
 */
export const loggerMiddleware = async (c: Context, next: Next) => {
  const method = c.req.method;
  const path = c.req.path;
  const start = Date.now();

  console.log(`[${new Date().toISOString()}] ${method} ${path}`);

  await next();

  const duration = Date.now() - start;
  console.log(`OK ${method} ${path} - ${duration}ms`);
};
