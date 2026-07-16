import { isNotNull, isNull } from "drizzle-orm";
import { db, menus, role_permissions, roles, users } from "./index";
import { hash } from "bcryptjs";

const roleSeedData = [
  { code: "ADMIN", name: "Administrator" },
  { code: "USER", name: "User" },
];

const menuSeedData = [
  {
    name: "Dashboard",
    path: "/dashboard",
    permissionPath: null,
    icon: null,
    parentName: null,
  },
  {
    name: "Master Data",
    path: null,
    permissionPath: null,
    icon: null,
    parentName: null,
  },
  {
    name: "Web Management",
    path: null,
    permissionPath: null,
    icon: null,
    parentName: null,
  },
  {
    name: "Role",
    path: "/master-data/roles",
    permissionPath: "/api/roles",
    icon: null,
    parentName: "Master Data",
  },
  {
    name: "User",
    path: "/master-data/users",
    permissionPath: "/api/users",
    icon: null,
    parentName: "Master Data",
  },
  {
    name: "Menu",
    path: "/web-management/menus",
    permissionPath: "/api/menus",
    icon: null,
    parentName: "Web Management",
  },
  {
    name: "Role Permission",
    path: "/web-management/role-permissions",
    permissionPath: "/api/role-permissions",
    icon: null,
    parentName: "Web Management",
  },

];

async function clearAllTables() {
  await db.delete(role_permissions);
  await db.delete(menus).where(isNotNull(menus.parent_id));
  await db.delete(menus).where(isNull(menus.parent_id));
  await db.delete(users);
  await db.delete(roles);
}

async function seed() {
  try {
    console.log("Starting database seeding...");

    await clearAllTables();

    console.log("Seeding roles...");
    const insertedRoles = await db
      .insert(roles)
      .values(roleSeedData)
      .$returningId();

    console.log("Seeding users...");
    const adminPassword = await hash("password123", 10);
    const userPassword = await hash("password123", 10);

    await db.insert(users).values([
      {
        email: "admin@example.com",
        password: adminPassword,
        name: "Admin User",
        role_id: insertedRoles[0].id,
      },
      {
        email: "user@example.com",
        password: userPassword,
        name: "Regular User",
        role_id: insertedRoles[1].id,
      },
    ]);

    console.log("Seeding parent menus...");
    const parentMenus = menuSeedData.filter((menu) => menu.parentName === null);
    const insertedParentMenus = await db
      .insert(menus)
      .values(
        parentMenus.map((menu) => ({
          name: menu.name,
          path: menu.path!,
          permission_path: menu.permissionPath,
          icon: menu.icon,
          is_visible: (menu as any).isVisible ?? true,
          parent_id: null,
        })),
      )
      .$returningId();

    const parentMenuIdByName = new Map<string, number>();
    parentMenus.forEach((menu, index) => {
      parentMenuIdByName.set(menu.name, insertedParentMenus[index].id);
    });

    console.log("Seeding child menus...");
    const childMenus = menuSeedData.filter((menu) => menu.parentName !== null);
    const insertedChildMenus = await db
      .insert(menus)
      .values(
        childMenus.map((menu) => ({
          name: menu.name,
          path: menu.path,
          permission_path: menu.permissionPath,
          icon: menu.icon,
          is_visible: (menu as any).isVisible ?? true,
          parent_id: parentMenuIdByName.get(menu.parentName as string) ?? null,
        })),
      )
      .$returningId();

    const allInsertedMenuIds = [
      ...insertedParentMenus,
      ...insertedChildMenus,
    ].map((menu) => menu.id);

    console.log("Seeding role permissions...");
    await db.insert(role_permissions).values(
      allInsertedMenuIds.map((menuId) => ({
        role_id: insertedRoles[0].id,
        menu_id: menuId,
        can_read: true,
        can_create: true,
        can_update: true,
        can_delete: true,
        can_report: true,
      })),
    );

    console.log("Database seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
}

seed();
