import { RoleController } from "../controller/role.controller";
import {
  createModuleOpenApiDocument,
  createOpenApiRouter,
  registerOpenApiRoute,
  registerDefaultSecuritySchemes,
} from "../../../docs/openapi-common";
import {
  createRoleRoute,
  deleteRoleRoute,
  getAllRolesRoute,
  getRoleByIdRoute,
  updateRoleRoute,
} from "./role.openapi";
import { appTokenMiddleware } from "../../../middleware/appToken";
import { jwtMiddleware } from "../../../middleware/auth";
import { requirePermission } from "../../../middleware/permission";

const router = createOpenApiRouter();

registerDefaultSecuritySchemes(router);

// Apply middleware globally for all routes in this module
router.use("*", jwtMiddleware, appTokenMiddleware, requirePermission());

registerOpenApiRoute(router, getAllRolesRoute, RoleController.getAll);
registerOpenApiRoute(router, getRoleByIdRoute, RoleController.getById);
registerOpenApiRoute(router, createRoleRoute, RoleController.create);
registerOpenApiRoute(router, updateRoleRoute, RoleController.update);
registerOpenApiRoute(router, deleteRoleRoute, RoleController.delete);

export function getRoleOpenApiDocument(baseUrl: string) {
  return createModuleOpenApiDocument(router, baseUrl, "Role API");
}

export default router;
