import { createRoute } from "@hono/zod-openapi";
import {
  apiErrorResponseSchema,
  createNumericPathParamsSchema,
  jsonResponse,
  protectedSecurity,
  errorResponses,
} from "../../../docs/openapi-common";
import {
  createRolePermissionRequestSchema,
  updateRolePermissionRequestSchema,
} from "../dto/role-permission-request.dto";
import {
  listResponseSchema,
  detailResponseSchema,
  mutationResponseSchema,
} from "../dto/role-permission-response.dto";

const rolePermissionIdParamsSchema = createNumericPathParamsSchema("id");
const roleIdParamsSchema = createNumericPathParamsSchema("roleId");

export const getAllRolePermissionsRoute = createRoute({
  method: "get",
  path: "/",
  tags: ["Role Permissions"],
  summary: "Get all role permissions",
  security: protectedSecurity,
  responses: {
    200: jsonResponse(listResponseSchema, "Role permissions fetched successfully"),
    401: errorResponses[401],
    403: errorResponses[403],
    500: errorResponses[500],
  },
});

export const getRolePermissionByIdRoute = createRoute({
  method: "get",
  path: "/{id}",
  tags: ["Role Permissions"],
  summary: "Get role permission by id",
  security: protectedSecurity,
  request: { params: rolePermissionIdParamsSchema },
  responses: {
    200: jsonResponse(detailResponseSchema, "Role permission fetched successfully"),
    400: jsonResponse(apiErrorResponseSchema, "Invalid role permission id"),
    401: errorResponses[401],
    403: errorResponses[403],
    404: jsonResponse(apiErrorResponseSchema, "Role permission not found"),
    500: errorResponses[500],
  },
});

export const getRolePermissionsByRoleIdRoute = createRoute({
  method: "get",
  path: "/role/{roleId}",
  tags: ["Role Permissions"],
  summary: "Get role permissions by role id",
  security: protectedSecurity,
  request: { params: roleIdParamsSchema },
  responses: {
    200: jsonResponse(listResponseSchema, "Role permissions fetched successfully"),
    400: jsonResponse(apiErrorResponseSchema, "Invalid role id"),
    401: errorResponses[401],
    403: errorResponses[403],
    500: errorResponses[500],
  },
});

export const createRolePermissionRoute = createRoute({
  method: "post",
  path: "/",
  tags: ["Role Permissions"],
  summary: "Create role permission",
  security: protectedSecurity,
  request: {
    body: {
      required: true,
      content: { "application/json": { schema: createRolePermissionRequestSchema } },
    },
  },
  responses: {
    201: jsonResponse(mutationResponseSchema, "Role permission created successfully"),
    ...errorResponses,
  },
});

export const updateRolePermissionRoute = createRoute({
  method: "put",
  path: "/{id}",
  tags: ["Role Permissions"],
  summary: "Update role permission",
  security: protectedSecurity,
  request: {
    params: rolePermissionIdParamsSchema,
    body: {
      required: true,
      content: { "application/json": { schema: updateRolePermissionRequestSchema } },
    },
  },
  responses: {
    200: jsonResponse(mutationResponseSchema, "Role permission updated successfully"),
    ...errorResponses,
    404: jsonResponse(apiErrorResponseSchema, "Role permission not found"),
  },
});

export const deleteRolePermissionRoute = createRoute({
  method: "delete",
  path: "/{id}",
  tags: ["Role Permissions"],
  summary: "Delete role permission",
  security: protectedSecurity,
  request: { params: rolePermissionIdParamsSchema },
  responses: {
    200: jsonResponse(mutationResponseSchema, "Role permission deleted successfully"),
    400: jsonResponse(apiErrorResponseSchema, "Invalid role permission id"),
    401: errorResponses[401],
    403: errorResponses[403],
    404: jsonResponse(apiErrorResponseSchema, "Role permission not found"),
    500: errorResponses[500],
  },
});
