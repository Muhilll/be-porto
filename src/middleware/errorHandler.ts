import { Context, ErrorHandler, NotFoundHandler } from "hono";
import { HTTPException } from "hono/http-exception";

export const notFoundHandler: NotFoundHandler = (c: Context) => {
  return c.json(
    {
      success: false,
      message: `Route not found: ${c.req.path}`,
    },
    404,
  );
};

export const errorHandler: ErrorHandler = (err: Error, c: Context) => {
  console.error("[Error Handler]", err);

  if (err instanceof HTTPException) {
    // Get the custom response if available, otherwise just use the status code and message
    return c.json(
      {
        success: false,
        message: err.message,
      },
      err.status,
    );
  }

  // Generic fallback for unhandled errors
  return c.json(
    {
      success: false,
      message:
        process.env.NODE_ENV === "production"
          ? "Internal server error"
          : err.message || "Internal server error",
      // Include stack trace only in development
      stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
    },
    500,
  );
};
