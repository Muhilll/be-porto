import { RolePermissionController } from "../controller/role-permission.controller";
import {
  createModuleOpenApiDocument,
  createOpenApiRouter,
  registerOpenApiRoute,
  registerDefaultSecuritySchemes,
} from "../../../docs/openapi-common";
import {
  createRolePermissionRoute,
  deleteRolePermissionRoute,
  getAllRolePermissionsRoute,
  getRolePermissionByIdRoute,
  getRolePermissionsByRoleIdRoute,
  updateRolePermissionRoute,
} from "./role-permission.openapi";
import { appTokenMiddleware } from "../../../middleware/appToken";
import { jwtMiddleware } from "../../../middleware/auth";
import { requirePermission } from "../../../middleware/permission";

const router = createOpenApiRouter();

registerDefaultSecuritySchemes(router);

// Apply middleware globally for all routes in this module
router.use("*", jwtMiddleware, appTokenMiddleware, requirePermission());

registerOpenApiRoute(router, getAllRolePermissionsRoute, RolePermissionController.getAll);
registerOpenApiRoute(router, getRolePermissionByIdRoute, RolePermissionController.getById);
registerOpenApiRoute(
  router,
  getRolePermissionsByRoleIdRoute,
  RolePermissionController.getByRoleId,
);
registerOpenApiRoute(router, createRolePermissionRoute, RolePermissionController.create);
registerOpenApiRoute(router, updateRolePermissionRoute, RolePermissionController.update);
registerOpenApiRoute(router, deleteRolePermissionRoute, RolePermissionController.delete);

export function getRolePermissionOpenApiDocument(baseUrl: string) {
  return createModuleOpenApiDocument(router, baseUrl, "Role Permission API");
}

export default router;
