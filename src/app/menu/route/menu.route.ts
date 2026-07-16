import { MenuController } from "../controller/menu.controller";
import {
  createModuleOpenApiDocument,
  createOpenApiRouter,
  registerOpenApiRoute,
  registerDefaultSecuritySchemes,
} from "../../../docs/openapi-common";
import {
  createMenuRoute,
  deleteMenuRoute,
  getAllMenusRoute,
  getMenuByIdRoute,
  updateMenuRoute,
} from "./menu.openapi";
import { appTokenMiddleware } from "../../../middleware/appToken";
import { jwtMiddleware } from "../../../middleware/auth";
import { requirePermission } from "../../../middleware/permission";

const router = createOpenApiRouter();

registerDefaultSecuritySchemes(router);

// Apply middleware globally for all routes in this module
router.use("*", jwtMiddleware, appTokenMiddleware, requirePermission());

registerOpenApiRoute(router, getAllMenusRoute, MenuController.getAll);
registerOpenApiRoute(router, getMenuByIdRoute, MenuController.getById);
registerOpenApiRoute(router, createMenuRoute, MenuController.create);
registerOpenApiRoute(router, updateMenuRoute, MenuController.update);
registerOpenApiRoute(router, deleteMenuRoute, MenuController.delete);

export function getMenuOpenApiDocument(baseUrl: string) {
  return createModuleOpenApiDocument(router, baseUrl, "Menu API");
}

export default router;
