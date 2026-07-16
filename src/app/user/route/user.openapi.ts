import { createRoute } from "@hono/zod-openapi";
import { appTokenMiddleware } from "../../../middleware/appToken";
import { jwtMiddleware } from "../../../middleware/auth";
import { requirePermission } from "../../../middleware/permission";
import {
  apiErrorResponseSchema,
  createNumericPathParamsSchema,
  jsonResponse,
  protectedSecurity,
  errorResponses,
} from "../../../docs/openapi-common";
import {
  loginRequestSchema,
  createUserRequestSchema,
  updateUserRequestSchema,
} from "../dto/user-request.dto";
import {
  loginResponseSchema,
  userListResponseSchema,
  userDetailResponseSchema,
  userMutationResponseSchema,
  navigationResponseSchema,
} from "../dto/user-response.dto";

const userIdParamsSchema = createNumericPathParamsSchema("id");

export const loginUserRoute = createRoute({
  method: "post",
  path: "/login",
  tags: ["Users"],
  summary: "Login user",
  security: [],
  request: {
    body: {
      required: true,
      content: { "application/json": { schema: loginRequestSchema } },
    },
  },
  responses: {
    200: jsonResponse(loginResponseSchema, "Successful login"),
    400: jsonResponse(apiErrorResponseSchema, "Email and password are required"),
    401: jsonResponse(apiErrorResponseSchema, "Invalid email or password"),
    500: errorResponses[500],
  },
});

export const getAllUsersRoute = createRoute({
  method: "get",
  path: "/",
  tags: ["Users"],
  summary: "Get all users",
  security: protectedSecurity,
  middleware: [
    jwtMiddleware,
    appTokenMiddleware,
    requirePermission(),
  ] as const,
  responses: {
    200: jsonResponse(userListResponseSchema, "Users fetched successfully"),
    401: errorResponses[401],
    403: errorResponses[403],
    500: errorResponses[500],
  },
});

export const getCurrentUserNavigationRoute = createRoute({
  method: "get",
  path: "/me/navigation",
  tags: ["Users"],
  summary: "Get current user navigation tree",
  security: protectedSecurity,
  middleware: [jwtMiddleware, appTokenMiddleware] as const,
  responses: {
    200: jsonResponse(navigationResponseSchema, "Navigation fetched successfully"),
    401: jsonResponse(
      apiErrorResponseSchema,
      "Unauthorized - User role not found",
    ),
    500: errorResponses[500],
  },
});

export const getUserByIdRoute = createRoute({
  method: "get",
  path: "/{id}",
  tags: ["Users"],
  summary: "Get user by id",
  security: protectedSecurity,
  middleware: [
    jwtMiddleware,
    appTokenMiddleware,
    requirePermission(),
  ] as const,
  request: {
    params: userIdParamsSchema,
  },
  responses: {
    200: jsonResponse(userDetailResponseSchema, "User fetched successfully"),
    400: jsonResponse(apiErrorResponseSchema, "Invalid user id"),
    401: errorResponses[401],
    403: errorResponses[403],
    404: jsonResponse(apiErrorResponseSchema, "User not found"),
    500: errorResponses[500],
  },
});

export const createUserRoute = createRoute({
  method: "post",
  path: "/",
  tags: ["Users"],
  summary: "Create user",
  security: protectedSecurity,
  middleware: [
    jwtMiddleware,
    appTokenMiddleware,
    requirePermission(),
  ] as const,
  request: {
    body: {
      required: true,
      content: { "application/json": { schema: createUserRequestSchema } },
    },
  },
  responses: {
    201: jsonResponse(userMutationResponseSchema, "User created successfully"),
    ...errorResponses,
    400: jsonResponse(
      apiErrorResponseSchema,
      "Validation error or email already registered",
    ),
  },
});

export const updateUserRoute = createRoute({
  method: "put",
  path: "/{id}",
  tags: ["Users"],
  summary: "Update user",
  security: protectedSecurity,
  middleware: [
    jwtMiddleware,
    appTokenMiddleware,
    requirePermission(),
  ] as const,
  request: {
    params: userIdParamsSchema,
    body: {
      required: true,
      content: { "application/json": { schema: updateUserRequestSchema } },
    },
  },
  responses: {
    200: jsonResponse(userMutationResponseSchema, "User updated successfully"),
    ...errorResponses,
    404: jsonResponse(apiErrorResponseSchema, "User not found"),
  },
});

export const deleteUserRoute = createRoute({
  method: "delete",
  path: "/{id}",
  tags: ["Users"],
  summary: "Delete user",
  security: protectedSecurity,
  middleware: [
    jwtMiddleware,
    appTokenMiddleware,
    requirePermission(),
  ] as const,
  request: {
    params: userIdParamsSchema,
  },
  responses: {
    200: jsonResponse(userMutationResponseSchema, "User deleted successfully"),
    400: jsonResponse(apiErrorResponseSchema, "Invalid user id"),
    401: errorResponses[401],
    403: errorResponses[403],
    404: jsonResponse(apiErrorResponseSchema, "User not found"),
    500: errorResponses[500],
  },
});
