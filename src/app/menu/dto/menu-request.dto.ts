import { z } from "@hono/zod-openapi";
import { createNullableOptionalCoercedIntSchema } from "../../../docs/openapi-common";

export const createMenuRequestSchema = z
  .object({
    name: z.string().min(1).max(100).openapi({ example: "Reports" }),
    path: z.string().max(255).optional().nullable().openapi({ example: "/reports" }),
    permission_path: z.string().max(255).optional().nullable().openapi({ example: "/api/reports" }),
    icon: z.string().max(255).optional().nullable().openapi({ example: "ph-chart-bar" }),
    is_visible: z.boolean().optional().default(false),
    parent_id: z.number().int().optional().nullable().openapi({ example: null }),
  })
  .openapi("CreateMenuRequest");

export const updateMenuRequestSchema = z
  .object({
    name: z.string().min(1).optional().openapi({ example: "Report Detail" }),
    path: z.string().min(1).optional().openapi({ example: "/reports/detail" }),
    permission_path: z.string().nullable().optional().openapi({ example: "/api/reports" }),
    icon: z.string().nullable().optional().openapi({ example: "ph-list" }),
    parent_id: createNullableOptionalCoercedIntSchema(2),
  })
  .openapi("UpdateMenuRequest");

export type CreateMenuRequestDto = z.infer<typeof createMenuRequestSchema>;
export type UpdateMenuRequestDto = z.infer<typeof updateMenuRequestSchema>;
