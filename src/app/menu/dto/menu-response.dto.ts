import { z } from "@hono/zod-openapi";
import { MenuEntity } from "../contract/menu.contract";
import { createSuccessEnvelopeSchema, writeResultSchema } from "../../../docs/openapi-common";
import { menuSchema } from "../../../docs/openapi-schemas";

export type MenuResponseDto = MenuEntity;

export const menuListResponseSchema = createSuccessEnvelopeSchema(
  "MenuListResponse",
  z.array(menuSchema),
  "Menus fetched successfully",
);

export const menuDetailResponseSchema = createSuccessEnvelopeSchema(
  "MenuDetailResponse",
  menuSchema,
  "Menu fetched successfully",
);

export const menuMutationResponseSchema = createSuccessEnvelopeSchema(
  "MenuMutationResponse",
  writeResultSchema,
  "Menu created successfully",
);  
