import { createRoute } from "@hono/zod-openapi";
import {
  apiErrorResponseSchema,
  createNumericPathParamsSchema,
  jsonResponse,
  protectedSecurity,
  errorResponses,
} from "../../../docs/openapi-common";
import {
  createRoleRequestSchema,
  updateRoleRequestSchema,
} from "../dto/role-request.dto";
import {
  roleListResponseSchema,
  roleDetailResponseSchema,
  roleMutationResponseSchema,
} from "../dto/role-response.dto";

const tags = ["Roles"];
const roleIdParamsSchema = createNumericPathParamsSchema("id");

export const getAllRolesRoute = createRoute({
  method: "get",
  path: "/",
  tags,
  summary: "Get all roles",
  security: protectedSecurity,
  responses: {
    200: jsonResponse(roleListResponseSchema, "Roles fetched successfully"),
    401: errorResponses[401],
    403: errorResponses[403],
    500: errorResponses[500],
  },
});

export const getRoleByIdRoute = createRoute({
  method: "get",
  path: "/{id}",
  tags,
  summary: "Get role by id",
  security: protectedSecurity,
  request: {
    params: roleIdParamsSchema,
  },
  responses: {
    200: jsonResponse(roleDetailResponseSchema, "Role fetched successfully"),
    400: jsonResponse(apiErrorResponseSchema, "Invalid role id"),
    401: errorResponses[401],
    403: errorResponses[403],
    404: jsonResponse(apiErrorResponseSchema, "Role not found"),
    500: errorResponses[500],
  },
});

export const createRoleRoute = createRoute({
  method: "post",
  path: "/",
  tags,
  summary: "Create role",
  security: protectedSecurity,
  request: {
    body: {
      required: true,
      content: {
        "application/json": {
          schema: createRoleRequestSchema,
        },
      },
    },
  },
  responses: {
    201: jsonResponse(roleMutationResponseSchema, "Role created successfully"),
    ...errorResponses,
  },
});

export const updateRoleRoute = createRoute({
  method: "put",
  path: "/{id}",
  tags,
  summary: "Update role",
  security: protectedSecurity,
  request: {
    params: roleIdParamsSchema,
    body: {
      required: true,
      content: {
        "application/json": {
          schema: updateRoleRequestSchema,
        },
      },
    },
  },
  responses: {
    200: jsonResponse(roleMutationResponseSchema, "Role updated successfully"),
    ...errorResponses,
    404: jsonResponse(apiErrorResponseSchema, "Role not found"),
  },
});

export const deleteRoleRoute = createRoute({
  method: "delete",
  path: "/{id}",
  tags,
  summary: "Delete role",
  security: protectedSecurity,
  request: {
    params: roleIdParamsSchema,
  },
  responses: {
    200: jsonResponse(roleMutationResponseSchema, "Role deleted successfully"),
    400: jsonResponse(apiErrorResponseSchema, "Invalid role id"),
    401: errorResponses[401],
    403: errorResponses[403],
    404: jsonResponse(apiErrorResponseSchema, "Role not found"),
    500: errorResponses[500],
  },
});
