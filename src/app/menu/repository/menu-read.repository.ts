import { eq, isNull } from "drizzle-orm";
import { db } from "../../../db";
import { menus } from "../../../db/schema";

export class MenuReadRepository {
  static async getAllMenus() {
    try {
      return await db.select().from(menus);
    } catch (error) {
      throw new Error(`Failed to fetch menus: ${error}`);
    }
  }

  static async getMenuById(id: number) {
    try {
      const result = await db
        .select()
        .from(menus)
        .where(eq(menus.id, id))
        .limit(1);

      return result[0] || null;
    } catch (error) {
      throw new Error(`Failed to fetch menu: ${error}`);
    }
  }

  static async getMenusByParentId(parentId: number | null) {
    try {
      if (parentId === null) {
        return await db.select().from(menus).where(isNull(menus.parent_id));
      }

      return await db.select().from(menus).where(eq(menus.parent_id, parentId));
    } catch (error) {
      throw new Error(`Failed to fetch menus: ${error}`);
    }
  }
}
