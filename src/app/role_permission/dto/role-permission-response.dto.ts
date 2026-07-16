import { z } from "@hono/zod-openapi";
import { RolePermissionEntity } from "../contract/role-permission.contract";
import { createSuccessEnvelopeSchema, writeResultSchema } from "../../../docs/openapi-common";
import { rolePermissionSchema } from "../../../docs/openapi-schemas";

export type RolePermissionResponseDto = RolePermissionEntity & {
  role: {
    id: number;
    code: string;
    name: string;
  };
  menu: {
    id: number;
    name: string;
    path: string;
    permission_path: string | null;
    icon: string | null;
    parent_id: number | null;
  };
};

export const listResponseSchema = createSuccessEnvelopeSchema(
  "RolePermissionListResponse",
  z.array(rolePermissionSchema),
  "Role permissions fetched successfully",
);

export const detailResponseSchema = createSuccessEnvelopeSchema(
  "RolePermissionDetailResponse",
  rolePermissionSchema,
  "Role permission fetched successfully",
);

export const mutationResponseSchema = createSuccessEnvelopeSchema(
  "RolePermissionMutationResponse",
  writeResultSchema,
  "Role permission created successfully",
);
