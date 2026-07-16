import { eq } from "drizzle-orm";
import { db } from "../../../db";
import { menus } from "../../../db/schema";
import {
  CreateMenuRequestDto,
  UpdateMenuRequestDto,
} from "../dto/menu-request.dto";

export class MenuWriteRepository {
  static async createMenu(data: CreateMenuRequestDto) {
    try {
      return await db.insert(menus).values(data);
    } catch (error) {
      throw new Error(`Failed to create menu: ${error}`);
    }
  }

  static async updateMenu(id: number, data: UpdateMenuRequestDto) {
    try {
      return await db
        .update(menus)
        .set({
          ...data,
          updated_at: new Date(),
        })
        .where(eq(menus.id, id));
    } catch (error) {
      throw new Error(`Failed to update menu: ${error}`);
    }
  }

  static async deleteMenu(id: number) {
    try {
      return await db.delete(menus).where(eq(menus.id, id));
    } catch (error) {
      throw new Error(`Failed to delete menu: ${error}`);
    }
  }
}
