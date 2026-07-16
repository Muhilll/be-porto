import { z } from "@hono/zod-openapi";
import { createCoercedIntSchema, createOptionalCoercedIntSchema } from "../../../docs/openapi-common";

export const createRolePermissionRequestSchema = z
  .object({
    role_id: createCoercedIntSchema(1),
    menu_id: createCoercedIntSchema(2),
    can_read: z.boolean().optional().openapi({ example: true }),
    can_create: z.boolean().optional().openapi({ example: true }),
    can_update: z.boolean().optional().openapi({ example: true }),
    can_delete: z.boolean().optional().openapi({ example: false }),
    can_report: z.boolean().optional().openapi({ example: false }),
  })
  .openapi("CreateRolePermissionRequest");

export const updateRolePermissionRequestSchema = z
  .object({
    role_id: createOptionalCoercedIntSchema(2),
    menu_id: createOptionalCoercedIntSchema(5),
    can_read: z.boolean().optional().openapi({ example: true }),
    can_create: z.boolean().optional().openapi({ example: false }),
    can_update: z.boolean().optional().openapi({ example: false }),
    can_delete: z.boolean().optional().openapi({ example: false }),
    can_report: z.boolean().optional().openapi({ example: false }),
  })
  .openapi("UpdateRolePermissionRequest");

export type CreateRolePermissionRequestDto = z.infer<typeof createRolePermissionRequestSchema>;
export type UpdateRolePermissionRequestDto = z.infer<typeof updateRolePermissionRequestSchema>;
