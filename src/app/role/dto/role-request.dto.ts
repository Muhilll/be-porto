import { z } from "@hono/zod-openapi";

export const createRoleRequestSchema = z
  .object({
    code: z.string().min(1).openapi({ example: "SUPERVISOR" }),
    name: z.string().min(1).openapi({ example: "Supervisor" }),
  })
  .openapi("CreateRoleRequest");

export const updateRoleRequestSchema = z
  .object({
    code: z.string().min(1).optional().openapi({ example: "SUPERVISOR" }),
    name: z.string().min(1).optional().openapi({ example: "Supervisor Area" }),
  })
  .openapi("UpdateRoleRequest");

export type CreateRoleRequestDto = z.infer<typeof createRoleRequestSchema>;
export type UpdateRoleRequestDto = z.infer<typeof updateRoleRequestSchema>;
