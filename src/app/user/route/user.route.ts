import { UserAuthController } from "../controller/user-auth.controller";
import { UserNavigationController } from "../controller/user-navigation.controller";
import { UserController } from "../controller/user.controller";
import {
  createModuleOpenApiDocument,
  createOpenApiRouter,
  registerOpenApiRoute,
  registerDefaultSecuritySchemes,
} from "../../../docs/openapi-common";
import {
  createUserRoute,
  deleteUserRoute,
  getAllUsersRoute,
  getCurrentUserNavigationRoute,
  getUserByIdRoute,
  loginUserRoute,
  updateUserRoute,
} from "./user.openapi";

const router = createOpenApiRouter();

registerDefaultSecuritySchemes(router);

registerOpenApiRoute(router, loginUserRoute, UserAuthController.login);
registerOpenApiRoute(router, getAllUsersRoute, UserController.getAll);
registerOpenApiRoute(
  router,
  getCurrentUserNavigationRoute,
  UserNavigationController.getNavigation,
);
registerOpenApiRoute(router, getUserByIdRoute, UserController.getById);
registerOpenApiRoute(router, createUserRoute, UserController.create);
registerOpenApiRoute(router, updateUserRoute, UserController.update);
registerOpenApiRoute(router, deleteUserRoute, UserController.delete);

export function getUserOpenApiDocument(baseUrl: string) {
  return createModuleOpenApiDocument(router, baseUrl, "User API");
}

export default router;
