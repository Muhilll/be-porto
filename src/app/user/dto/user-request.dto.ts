import { z } from "@hono/zod-openapi";
import { createOptionalCoercedIntSchema } from "../../../docs/openapi-common";

export const loginRequestSchema = z
  .object({
    email: z.string().email().openapi({ example: "admin@example.com" }),
    password: z.string().min(1).openapi({ example: "admin123" }),
  })
  .openapi("LoginRequest");

export const createUserRequestSchema = z
  .object({
    email: z.string().email().openapi({ example: "staff@example.com" }),
    password: z.string().min(1).openapi({ example: "staff123" }),
    name: z.string().min(1).openapi({ example: "Staff User" }),
    role_id: z.coerce.number().int().openapi({ example: 2 }),
  })
  .openapi("CreateUserRequest");

export const updateUserRequestSchema = z
  .object({
    email: z.string().email().optional().openapi({ example: "staff.updated@example.com" }),
    password: z.string().min(1).optional().openapi({ example: "newpassword123" }),
    name: z.string().min(1).optional().openapi({ example: "Staff User Update" }),
    role_id: createOptionalCoercedIntSchema(3),
  })
  .openapi("UpdateUserRequest");

export type LoginRequestDto = z.infer<typeof loginRequestSchema>;
export type CreateUserRequestDto = z.infer<typeof createUserRequestSchema>;
export type UpdateUserRequestDto = z.infer<typeof updateUserRequestSchema>;
