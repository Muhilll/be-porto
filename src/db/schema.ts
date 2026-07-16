import {
  int,
  varchar,
  datetime,
  boolean,
  mysqlTable,
  foreignKey,
  text,
  decimal,
  date,
  time,
  mysqlEnum,
} from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm/sql/sql";

export const menus = mysqlTable(
  "menus",
  {
    id: int().primaryKey().autoincrement(),
    name: varchar({ length: 100 }).notNull(),
    path: varchar({ length: 255 }),
    permission_path: varchar({ length: 255 }),
    icon: varchar({ length: 255 }),
    is_visible: boolean().default(false),
    parent_id: int(),
    created_at: datetime().default(sql`CURRENT_TIMESTAMP`).notNull(),
    updated_at: datetime().default(sql`CURRENT_TIMESTAMP`).notNull(),
  },
  (table) => ({
    parent_fk: foreignKey({
      columns: [table.parent_id],
      foreignColumns: [table.id],
    }),
  })
);

// Roles Table
export const roles = mysqlTable("roles", {
  id: int().primaryKey().autoincrement(),
  code: varchar({ length: 50 }).notNull().unique(),
  name: varchar({ length: 100 }).notNull(),
  created_at: datetime().default(sql`CURRENT_TIMESTAMP`).notNull(),
  updated_at: datetime().default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// Users Table
export const users = mysqlTable(
  "users",
  {
    id: int().primaryKey().autoincrement(),
    email: varchar({ length: 100 }).notNull().unique(),
    password: varchar({ length: 255 }).notNull(),
    name: varchar({ length: 100 }).notNull(),
    role_id: int().notNull(),
    created_at: datetime().default(sql`CURRENT_TIMESTAMP`).notNull(),
    updated_at: datetime().default(sql`CURRENT_TIMESTAMP`).notNull(),
  },
  (table) => ({
    role_fk: foreignKey({
      columns: [table.role_id],
      foreignColumns: [roles.id],
    }),
  })
);

// Role Permissions Table
export const role_permissions = mysqlTable(
  "role_permissions",
  {
    id: int().primaryKey().autoincrement(),
    role_id: int().notNull(),
    menu_id: int().notNull(),
    can_read: boolean().default(false),
    can_create: boolean().default(false),
    can_update: boolean().default(false),
    can_delete: boolean().default(false),
    can_report: boolean().default(false),
    created_at: datetime().default(sql`CURRENT_TIMESTAMP`).notNull(),
    updated_at: datetime().default(sql`CURRENT_TIMESTAMP`).notNull(),
  },
  (table) => ({
    role_fk: foreignKey({
      columns: [table.role_id],
      foreignColumns: [roles.id],
    }),
    menu_fk: foreignKey({
      columns: [table.menu_id],
      foreignColumns: [menus.id],
    }),
  })
);


