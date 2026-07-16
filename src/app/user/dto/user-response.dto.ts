import { z } from "@hono/zod-openapi";
import { NavigationItem, PublicUser } from "../contract/user.contract";
import { createSuccessEnvelopeSchema, writeResultSchema } from "../../../docs/openapi-common";
import { userSchema, navigationItemSchema } from "../../../docs/openapi-schemas";

export type LoginResponseDto = {
  token: string;
  user: {
    id: number;
    email: string;
    name: string;
    role_id: number;
  };
};

export type UserResponseDto = PublicUser;

export type NavigationResponseDto = NavigationItem[];

export const loginDataSchema = z
  .object({
    token: z.string().openapi({
      example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.example",
    }),
    user: z.object({
      id: z.number().int().openapi({ example: 1 }),
      email: z.string().email().openapi({ example: "admin@example.com" }),
      name: z.string().openapi({ example: "Admin User" }),
      role_id: z.number().int().openapi({ example: 1 }),
    }),
  })
  .openapi("LoginResponse");

export const loginResponseSchema = createSuccessEnvelopeSchema(
  "LoginEnvelopeResponse",
  loginDataSchema,
  "Login successful",
);

export const userListResponseSchema = createSuccessEnvelopeSchema(
  "UserListResponse",
  z.array(userSchema),
  "Users fetched successfully",
);

export const userDetailResponseSchema = createSuccessEnvelopeSchema(
  "UserDetailResponse",
  userSchema,
  "User fetched successfully",
);

export const userMutationResponseSchema = createSuccessEnvelopeSchema(
  "UserMutationResponse",
  writeResultSchema,
  "User created successfully",
);

export const navigationResponseSchema = createSuccessEnvelopeSchema(
  "NavigationResponse",
  z.array(navigationItemSchema),
  "Navigation fetched successfully",
);
