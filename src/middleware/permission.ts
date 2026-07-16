import { Context, Next } from "hono";
import { RolePermissionReadRepository } from "../app/role_permission/repository/role-permission-read.repository";

export type PermissionAction =
  | "can_read"
  | "can_create"
  | "can_update"
  | "can_delete"
  | "can_report";

type AuthUser = {
  id: number;
  email: string;
  name: string;
  role_id: number;
};

const methodToPermissionAction: Record<string, PermissionAction> = {
  GET: "can_read",
  POST: "can_create",
  PUT: "can_update",
  PATCH: "can_update",
  DELETE: "can_delete",
};

function resolvePermissionPath(requestPath: string): string | null {
  const segments = requestPath.split("/").filter(Boolean);

  if (segments.length === 0) {
    return null;
  }

  if (segments[0] === "api") {
    if (segments.length < 2) {
      return null;
    }

    return `/${segments[0]}/${segments[1]}`;
  }

  return `/${segments[0]}`;
}

export const requirePermission =
  (action?: PermissionAction) =>
  async (c: Context, next: Next) => {
    try {
      const user = c.get("user") as AuthUser | undefined;

      if (!user?.role_id) {
        return c.json(
          {
            success: false,
            message: "Unauthorized - User role not found",
          },
          401,
        );
      }

      const resolvedAction = action ?? methodToPermissionAction[c.req.method];
      const permissionPath = resolvePermissionPath(c.req.path);

      if (!resolvedAction) {
        return c.json(
          {
            success: false,
            message: `Permission action not configured for method ${c.req.method}`,
          },
          500,
        );
      }

      if (!permissionPath) {
        return c.json(
          {
            success: false,
            message: `Permission path could not be resolved from ${c.req.path}`,
          },
          500,
        );
      }

      const permission =
        await RolePermissionReadRepository.getPermissionByRoleIdAndPermissionPath(
          user.role_id,
          permissionPath,
        );

      if (!permission || !Boolean(permission[resolvedAction])) {
        return c.json(
          {
            success: false,
            message: "Forbidden - You do not have permission to access this resource",
          },
          403,
        );
      }

      await next();
    } catch (error) {
      return c.json(
        {
          success: false,
          message:
            error instanceof Error ? error.message : "Internal server error",
        },
        500,
      );
    }
  };
