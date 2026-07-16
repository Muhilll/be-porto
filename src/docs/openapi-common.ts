import { OpenAPIHono, z } from "@hono/zod-openapi";
import type { RouteConfig, RouteHandler } from "@hono/zod-openapi";
import type { SecurityRequirementObject } from "openapi3-ts/oas30";

export const protectedSecurity: SecurityRequirementObject[] = [
  { BearerAuth: [], AppToken: [] },
];

export const timestampSchema = z.string().datetime().openapi({
  example: "2026-04-27T10:00:00.000Z",
});

export const writeResultSchema = z
  .object({
    affectedRows: z.number().int().optional().openapi({
      example: 1,
    }),
    insertId: z.number().int().optional().openapi({
      example: 1,
    }),
    warningStatus: z.number().int().optional().openapi({
      example: 0,
    }),
  })
  .catchall(z.any())
  .openapi("WriteResult");

export const apiErrorResponseSchema = z
  .object({
    success: z.literal(false).openapi({
      example: false,
    }),
    message: z.string().openapi({
      example: "Validation error",
    }),
    errors: z.any().optional().openapi({
      example: {
        formErrors: [],
        fieldErrors: {
          field: ["Required"],
        },
      },
    }),
  })
  .openapi("ApiErrorResponse");

export function createSuccessEnvelopeSchema(
  name: string,
  dataSchema: z.ZodTypeAny,
  messageExample: string,
) {
  return z
    .object({
      success: z.literal(true).openapi({
        example: true,
      }),
      data: dataSchema,
      message: z.string().openapi({
        example: messageExample,
      }),
    })
    .openapi(name);
}

export function createNumericPathParamsSchema(
  name: string,
  example = 1,
) {
  return z.object({
    [name]: z.coerce.number().int().positive().openapi({
      param: {
        name,
        in: "path",
      },
      example,
    }),
  });
}

export function createCoercedIntSchema(example: number) {
  return z.coerce.number().int().openapi({
    example,
  });
}

export function createOptionalCoercedIntSchema(example: number) {
  return z
    .preprocess(
      (value) =>
        value === "" || value === null || typeof value === "undefined"
          ? undefined
          : value,
      z.coerce.number().int().optional(),
    )
    .openapi({
      example,
    });
}

export function createNullableOptionalCoercedIntSchema(
  example: number | null = null,
) {
  return z
    .preprocess(
      (value) =>
        value === "" || typeof value === "undefined" ? null : value,
      z.coerce.number().int().nullable().optional(),
    )
    .openapi({
      example,
    });
}

export function jsonContent(schema: z.ZodTypeAny) {
  return {
    "application/json": {
      schema,
    },
  };
}

export function jsonResponse(schema: z.ZodTypeAny, description: string) {
  return {
    description,
    content: jsonContent(schema),
  };
}

export const errorResponses = {
  400: jsonResponse(apiErrorResponseSchema, "Validation error"),
  401: jsonResponse(apiErrorResponseSchema, "Unauthorized"),
  403: jsonResponse(apiErrorResponseSchema, "Forbidden"),
  404: jsonResponse(apiErrorResponseSchema, "Resource not found"),
  500: jsonResponse(apiErrorResponseSchema, "Internal server error"),
};

export function createOpenApiRouter() {
  return new OpenAPIHono({
    defaultHook: (result, c) => {
      if (result.success === false) {
        return c.json(
          {
            success: false,
            message: "Validation error",
            errors: result.error.flatten(),
          },
          400,
        );
      }
    },
  });
}

export function registerDefaultSecuritySchemes(router: OpenAPIHono) {
  router.openAPIRegistry.registerComponent("securitySchemes", "BearerAuth", {
    type: "http",
    scheme: "bearer",
    bearerFormat: "JWT",
    description: "JWT token from POST /api/users/login",
  });

  router.openAPIRegistry.registerComponent("securitySchemes", "AppToken", {
    type: "apiKey",
    in: "header",
    name: "X-App-Token",
    description: "Application token defined in APP_TOKEN",
  });
}

export function registerOpenApiRoute<R extends RouteConfig>(
  router: OpenAPIHono,
  route: R,
  handler: unknown,
) {
  // Bridge existing controllers to the typed OpenAPI route contract.
  return (router.openapi as (...args: unknown[]) => unknown)(
    route,
    handler as RouteHandler<R>,
  );
}

export function createModuleOpenApiDocument(
  router: OpenAPIHono,
  baseUrl: string,
  title: string,
) {
  return router.getOpenAPIDocument({
    openapi: "3.0.3",
    info: {
      title,
      version: "1.0.0",
    },
    servers: [
      {
        url: baseUrl,
        description: "Current server",
      },
    ],
  });
}
