import { createRoute } from "@hono/zod-openapi";
import {
  apiErrorResponseSchema,
  createNumericPathParamsSchema,
  jsonResponse,
  protectedSecurity,
  errorResponses,
} from "../../../docs/openapi-common";
import {
  createMenuRequestSchema,
  updateMenuRequestSchema,
} from "../dto/menu-request.dto";
import {
  menuListResponseSchema,
  menuDetailResponseSchema,
  menuMutationResponseSchema,
} from "../dto/menu-response.dto";

const tags = ["Menus"];
const menuIdParamsSchema = createNumericPathParamsSchema("id");

export const getAllMenusRoute = createRoute({
  method: "get",
  path: "/",
  tags,
  summary: "Get all menus",
  security: protectedSecurity,
  responses: {
    200: jsonResponse(menuListResponseSchema, "Menus fetched successfully"),
    401: errorResponses[401],
    403: errorResponses[403],
    500: errorResponses[500],
  },
});

export const getMenuByIdRoute = createRoute({
  method: "get",
  path: "/{id}",
  tags,
  summary: "Get menu by id",
  security: protectedSecurity,
  request: {
    params: menuIdParamsSchema,
  },
  responses: {
    200: jsonResponse(menuDetailResponseSchema, "Menu fetched successfully"),
    400: jsonResponse(apiErrorResponseSchema, "Invalid menu id"),
    401: errorResponses[401],
    403: errorResponses[403],
    404: jsonResponse(apiErrorResponseSchema, "Menu not found"),
    500: errorResponses[500],
  },
});

export const createMenuRoute = createRoute({
  method: "post",
  path: "/",
  tags,
  summary: "Create menu",
  security: protectedSecurity,
  request: {
    body: {
      required: true,
      content: {
        "application/json": {
          schema: createMenuRequestSchema,
        },
      },
    },
  },
  responses: {
    201: jsonResponse(menuMutationResponseSchema, "Menu created successfully"),
    ...errorResponses,
  },
});

export const updateMenuRoute = createRoute({
  method: "put",
  path: "/{id}",
  tags,
  summary: "Update menu",
  security: protectedSecurity,
  request: {
    params: menuIdParamsSchema,
    body: {
      required: true,
      content: {
        "application/json": {
          schema: updateMenuRequestSchema,
        },
      },
    },
  },
  responses: {
    200: jsonResponse(menuMutationResponseSchema, "Menu updated successfully"),
    ...errorResponses,
    404: jsonResponse(apiErrorResponseSchema, "Menu not found"),
  },
});

export const deleteMenuRoute = createRoute({
  method: "delete",
  path: "/{id}",
  tags,
  summary: "Delete menu",
  security: protectedSecurity,
  request: {
    params: menuIdParamsSchema,
  },
  responses: {
    200: jsonResponse(menuMutationResponseSchema, "Menu deleted successfully"),
    400: jsonResponse(apiErrorResponseSchema, "Invalid menu id"),
    401: errorResponses[401],
    403: errorResponses[403],
    404: jsonResponse(apiErrorResponseSchema, "Menu not found"),
    500: errorResponses[500],
  },
});
