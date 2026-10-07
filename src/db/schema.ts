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

// Profiles Table (Single row for personal portfolio)
export const profiles = mysqlTable("profiles", {
  id: int().primaryKey().autoincrement(),
  name: varchar({ length: 150 }).notNull(),
  short_name: varchar({ length: 50 }).notNull(),
  role: varchar({ length: 150 }).notNull(),
  roles_list: text(), // JSON array of string[]
  tagline: text(),
  bio: text(),
  location: varchar({ length: 150 }),
  availability: varchar({ length: 50 }).default("available"),
  availability_text: varchar({ length: 255 }),
  avatar_url: text(),
  resume_url: text(),
  email: varchar({ length: 100 }),
  github: varchar({ length: 255 }),
  linkedin: varchar({ length: 255 }),
  whatsapp: varchar({ length: 50 }),
  stats: text(), // JSON array of { label, value, description }[]
  created_at: datetime().default(sql`CURRENT_TIMESTAMP`).notNull(),
  updated_at: datetime().default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// Projects Table
export const projects = mysqlTable("projects", {
  id: int().primaryKey().autoincrement(),
  title: varchar({ length: 255 }).notNull(),
  slug: varchar({ length: 255 }).notNull().unique(),
  category: varchar({ length: 100 }).notNull(), // Full-Stack, Frontend, Backend / API, System / Tools
  short_description: text(),
  full_description: text(),
  image_url: text().notNull(),
  demo_url: text(),
  github_url: text(),
  year: varchar({ length: 10 }).default("2025"),
  featured: boolean().default(false),
  tags: text(), // JSON array of string[]
  metrics: text(), // JSON array of { label, value }[]
  architecture_points: text(), // JSON array of string[]
  sort_order: int().default(0),
  created_at: datetime().default(sql`CURRENT_TIMESTAMP`).notNull(),
  updated_at: datetime().default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// Experiences Table
export const experiences = mysqlTable("experiences", {
  id: int().primaryKey().autoincrement(),
  role: varchar({ length: 150 }).notNull(),
  company: varchar({ length: 150 }).notNull(),
  period: varchar({ length: 100 }).notNull(),
  location: varchar({ length: 150 }),
  company_url: varchar({ length: 255 }),
  description: text(),
  skills: text(), // JSON array of string[]
  sort_order: int().default(0),
  created_at: datetime().default(sql`CURRENT_TIMESTAMP`).notNull(),
  updated_at: datetime().default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// Educations Table
export const educations = mysqlTable("educations", {
  id: int().primaryKey().autoincrement(),
  degree: varchar({ length: 150 }).notNull(),
  institution: varchar({ length: 150 }).notNull(),
  period: varchar({ length: 100 }).notNull(),
  description: text(),
  sort_order: int().default(0),
  created_at: datetime().default(sql`CURRENT_TIMESTAMP`).notNull(),
  updated_at: datetime().default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// Skill Categories Table
export const skill_categories = mysqlTable("skill_categories", {
  id: int().primaryKey().autoincrement(),
  category: varchar({ length: 100 }).notNull(),
  skills: text(), // JSON array of { name: string, level: string, iconName?: string }[]
  sort_order: int().default(0),
  created_at: datetime().default(sql`CURRENT_TIMESTAMP`).notNull(),
  updated_at: datetime().default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// Certificates Table
export const certificates = mysqlTable("certificates", {
  id: int().primaryKey().autoincrement(),
  title: varchar({ length: 255 }).notNull(),
  issuer: varchar({ length: 150 }).notNull(),
  issuer_logo: text(),
  issue_date: varchar({ length: 100 }).notNull(),
  expiry_date: varchar({ length: 100 }),
  credential_id: varchar({ length: 100 }),
  credential_url: text(),
  image: text().notNull(),
  skills: text(), // JSON array of string[]
  sort_order: int().default(0),
  created_at: datetime().default(sql`CURRENT_TIMESTAMP`).notNull(),
  updated_at: datetime().default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// Services Table
export const services = mysqlTable("services", {
  id: int().primaryKey().autoincrement(),
  service_code: varchar({ length: 50 }),
  number: varchar({ length: 10 }).notNull(),
  title: varchar({ length: 255 }).notNull(),
  description: text(),
  icon: varchar({ length: 50 }).default("Layout"),
  features: text(), // JSON array of string[]
  deliverables: text(),
  sort_order: int().default(0),
  created_at: datetime().default(sql`CURRENT_TIMESTAMP`).notNull(),
  updated_at: datetime().default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// Contact Messages Table
export const contact_messages = mysqlTable("contact_messages", {
  id: int().primaryKey().autoincrement(),
  name: varchar({ length: 150 }).notNull(),
  email: varchar({ length: 150 }).notNull(),
  subject: varchar({ length: 255 }),
  message: text().notNull(),
  is_read: boolean().default(false),
  created_at: datetime().default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// Blog / Articles Table
export const blogs = mysqlTable("blogs", {
  id: int().primaryKey().autoincrement(),
  slug: varchar({ length: 255 }).notNull().unique(),
  title: varchar({ length: 255 }).notNull(),
  excerpt: text(),
  content: text().notNull(),
  cover_image: text(),
  published_at: varchar({ length: 100 }),
  read_time: varchar({ length: 50 }),
  category: varchar({ length: 100 }).default("General"),
  tags: text(), // JSON array of string[]
  featured: boolean().default(false),
  is_published: boolean().default(true),
  created_at: datetime().default(sql`CURRENT_TIMESTAMP`).notNull(),
  updated_at: datetime().default(sql`CURRENT_TIMESTAMP`).notNull(),
});




