import { z } from "@hono/zod-openapi";
import { RoleEntity } from "../contract/role.contract";
import { createSuccessEnvelopeSchema, writeResultSchema } from "../../../docs/openapi-common";
import { roleSchema } from "../../../docs/openapi-schemas";

export type RoleResponseDto = RoleEntity;

export const roleListResponseSchema = createSuccessEnvelopeSchema(
  "RoleListResponse",
  z.array(roleSchema),
  "Roles fetched successfully",
);

export const roleDetailResponseSchema = createSuccessEnvelopeSchema(
  "RoleDetailResponse",
  roleSchema,
  "Role fetched successfully",
);

export const roleMutationResponseSchema = createSuccessEnvelopeSchema(
  "RoleMutationResponse",
  writeResultSchema,
  "Role created successfully",
);
