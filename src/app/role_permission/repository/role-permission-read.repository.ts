import { and, eq } from "drizzle-orm";
import { db } from "../../../db";
import { menus, role_permissions, roles } from "../../../db/schema";
import { RolePermissionWithRelationsRow } from "../contract/role-permission.contract";

export class RolePermissionReadRepository {
  static async getAllRolePermissions() {
    try {
      return await db
        .select({
          id: role_permissions.id,
          role_id: role_permissions.role_id,
          menu_id: role_permissions.menu_id,
          can_read: role_permissions.can_read,
          can_create: role_permissions.can_create,
          can_update: role_permissions.can_update,
          can_delete: role_permissions.can_delete,
          can_report: role_permissions.can_report,
          created_at: role_permissions.created_at,
          updated_at: role_permissions.updated_at,
          role_ref_id: roles.id,
          role_code: roles.code,
          role_name: roles.name,
          menu_ref_id: menus.id,
          menu_name: menus.name,
          menu_path: menus.path,
          menu_permission_path: menus.permission_path,
          menu_icon: menus.icon,
          menu_parent_id: menus.parent_id,
        })
        .from(role_permissions)
        .innerJoin(roles, eq(role_permissions.role_id, roles.id))
        .innerJoin(menus, eq(role_permissions.menu_id, menus.id));
    } catch (error) {
      throw new Error(`Failed to fetch role permissions: ${error}`);
    }
  }

  static async getRolePermissionById(id: number) {
    try {
      const result = await db
        .select({
          id: role_permissions.id,
          role_id: role_permissions.role_id,
          menu_id: role_permissions.menu_id,
          can_read: role_permissions.can_read,
          can_create: role_permissions.can_create,
          can_update: role_permissions.can_update,
          can_delete: role_permissions.can_delete,
          can_report: role_permissions.can_report,
          created_at: role_permissions.created_at,
          updated_at: role_permissions.updated_at,
          role_ref_id: roles.id,
          role_code: roles.code,
          role_name: roles.name,
          menu_ref_id: menus.id,
          menu_name: menus.name,
          menu_path: menus.path,
          menu_permission_path: menus.permission_path,
          menu_icon: menus.icon,
          menu_parent_id: menus.parent_id,
        })
        .from(role_permissions)
        .innerJoin(roles, eq(role_permissions.role_id, roles.id))
        .innerJoin(menus, eq(role_permissions.menu_id, menus.id))
        .where(eq(role_permissions.id, id))
        .limit(1);

      return (result[0] || null) as RolePermissionWithRelationsRow | null;
    } catch (error) {
      throw new Error(`Failed to fetch role permission: ${error}`);
    }
  }

  static async getPermissionsByRoleId(roleId: number) {
    try {
      return await db
        .select({
          id: role_permissions.id,
          role_id: role_permissions.role_id,
          menu_id: role_permissions.menu_id,
          can_read: role_permissions.can_read,
          can_create: role_permissions.can_create,
          can_update: role_permissions.can_update,
          can_delete: role_permissions.can_delete,
          can_report: role_permissions.can_report,
          created_at: role_permissions.created_at,
          updated_at: role_permissions.updated_at,
          role_ref_id: roles.id,
          role_code: roles.code,
          role_name: roles.name,
          menu_ref_id: menus.id,
          menu_name: menus.name,
          menu_path: menus.path,
          menu_permission_path: menus.permission_path,
          menu_icon: menus.icon,
          menu_parent_id: menus.parent_id,
        })
        .from(role_permissions)
        .innerJoin(roles, eq(role_permissions.role_id, roles.id))
        .innerJoin(menus, eq(role_permissions.menu_id, menus.id))
        .where(eq(role_permissions.role_id, roleId));
    } catch (error) {
      throw new Error(`Failed to fetch role permissions: ${error}`);
    }
  }

  static async getPermissionByRoleIdAndPermissionPath(
    roleId: number,
    permissionPath: string,
  ) {
    try {
      const result = await db
        .select({
          can_read: role_permissions.can_read,
          can_create: role_permissions.can_create,
          can_update: role_permissions.can_update,
          can_delete: role_permissions.can_delete,
          can_report: role_permissions.can_report,
        })
        .from(role_permissions)
        .innerJoin(menus, eq(role_permissions.menu_id, menus.id))
        .where(
          and(
            eq(role_permissions.role_id, roleId),
            eq(menus.permission_path, permissionPath),
          ),
        );

      if (result.length === 0) {
        return null;
      }

      return result.reduce(
        (acc, item) => ({
          can_read: acc.can_read || Boolean(item.can_read),
          can_create: acc.can_create || Boolean(item.can_create),
          can_update: acc.can_update || Boolean(item.can_update),
          can_delete: acc.can_delete || Boolean(item.can_delete),
          can_report: acc.can_report || Boolean(item.can_report),
        }),
        {
          can_read: false,
          can_create: false,
          can_update: false,
          can_delete: false,
          can_report: false,
        },
      );
    } catch (error) {
      throw new Error(`Failed to fetch role permission: ${error}`);
    }
  }
}
