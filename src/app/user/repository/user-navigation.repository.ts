import { eq } from "drizzle-orm";
import { db } from "../../../db";
import { menus, role_permissions } from "../../../db/schema";
import {
  NavigationItem,
  NavigationPermission,
} from "../contract/user.contract";

type NavigationMenuRow = {
  id: number;
  name: string;
  path: string | null;
  icon: string | null;
  is_visible: boolean | null;
  parent_id: number | null;
};

type NavigationPermissionRow = NavigationMenuRow & {
  can_read: boolean | null;
  can_create: boolean | null;
  can_update: boolean | null;
  can_delete: boolean | null;
  can_report: boolean | null;
};

const navigationPermissionSelect = {
  id: menus.id,
  name: menus.name,
  path: menus.path,
  icon: menus.icon,
  is_visible: menus.is_visible,
  parent_id: menus.parent_id,
  can_read: role_permissions.can_read,
  can_create: role_permissions.can_create,
  can_update: role_permissions.can_update,
  can_delete: role_permissions.can_delete,
  can_report: role_permissions.can_report,
};

function buildNavigationTree(
  accessibleMenus: NavigationPermissionRow[],
  allMenus: NavigationMenuRow[],
): NavigationItem[] {
  if (accessibleMenus.length === 0) {
    return [];
  }

  const allMenuMap = new Map(allMenus.map((menu) => [menu.id, menu]));
  const navigationMap = new Map<number, NavigationItem>();

  const upsertMenu = (
    menu: NavigationMenuRow,
    permissions?: Partial<NavigationPermission>,
  ) => {
    const existing = navigationMap.get(menu.id);

    if (existing) {
      if (permissions) {
        existing.permissions = {
          can_read: existing.permissions.can_read || Boolean(permissions.can_read),
          can_create:
            existing.permissions.can_create || Boolean(permissions.can_create),
          can_update:
            existing.permissions.can_update || Boolean(permissions.can_update),
          can_delete:
            existing.permissions.can_delete || Boolean(permissions.can_delete),
          can_report:
            existing.permissions.can_report || Boolean(permissions.can_report),
        };
      }

      return existing;
    }

    const navigationItem: NavigationItem = {
      id: menu.id,
      name: menu.name,
      path: menu.path,
      icon: menu.icon,
      is_visible: menu.is_visible,
      parent_id: menu.parent_id,
      permissions: {
        can_read: Boolean(permissions?.can_read),
        can_create: Boolean(permissions?.can_create),
        can_update: Boolean(permissions?.can_update),
        can_delete: Boolean(permissions?.can_delete),
        can_report: Boolean(permissions?.can_report),
      },
      children: [],
    };

    navigationMap.set(menu.id, navigationItem);
    return navigationItem;
  };

  for (const item of accessibleMenus) {
    upsertMenu(item, {
      can_read: item.can_read ?? false,
      can_create: item.can_create ?? false,
      can_update: item.can_update ?? false,
      can_delete: item.can_delete ?? false,
      can_report: item.can_report ?? false,
    });

    let currentParentId = item.parent_id;

    while (currentParentId !== null) {
      const parentMenu = allMenuMap.get(currentParentId);

      if (!parentMenu) {
        break;
      }

      upsertMenu(parentMenu);
      currentParentId = parentMenu.parent_id;
    }
  }

  const treeMap = new Map<number, NavigationItem>();
  const roots: NavigationItem[] = [];

  for (const item of navigationMap.values()) {
    treeMap.set(item.id, {
      ...item,
      children: [],
    });
  }

  for (const item of treeMap.values()) {
    if (item.parent_id !== null) {
      const parent = treeMap.get(item.parent_id);

      if (parent) {
        parent.children.push(item);
        continue;
      }
    }

    roots.push(item);
  }

  sortNavigationTree(roots);
  return roots;
}

function sortNavigationTree(items: NavigationItem[]) {
  items.sort((a, b) => a.id - b.id);

  for (const item of items) {
    if (item.children.length > 0) {
      sortNavigationTree(item.children);
    }
  }
}

export class UserNavigationRepository {
  static async getNavigationByRoleId(roleId: number) {
    try {
      const result = await db
        .select(navigationPermissionSelect)
        .from(role_permissions)
        .innerJoin(menus, eq(role_permissions.menu_id, menus.id))
        .where(eq(role_permissions.role_id, roleId));

      const accessibleMenus = result.filter((item) =>
        Boolean(
          item.can_read ||
            item.can_create ||
            item.can_update ||
            item.can_delete ||
            item.can_report,
        ),
      );

      const allMenus = await db.select().from(menus);
      return buildNavigationTree(accessibleMenus, allMenus);
    } catch (error) {
      throw new Error(`Failed to fetch navigation menus: ${error}`);
    }
  }
}
