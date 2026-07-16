import { eq } from "drizzle-orm";
import { db } from "../../../db";
import { roles } from "../../../db/schema";

export class RoleReadRepository {
  static async getAllRoles() {
    try {
      return await db.select().from(roles);
    } catch (error) {
      throw new Error(`Failed to fetch roles: ${error}`);
    }
  }

  static async getRoleById(id: number) {
    try {
      const result = await db
        .select()
        .from(roles)
        .where(eq(roles.id, id))
        .limit(1);

      return result[0] || null;
    } catch (error) {
      throw new Error(`Failed to fetch role: ${error}`);
    }
  }

  static async getRoleByCode(code: string) {
    try {
      const result = await db
        .select()
        .from(roles)
        .where(eq(roles.code, code))
        .limit(1);

      return result[0] || null;
    } catch (error) {
      throw new Error(`Failed to fetch role: ${error}`);
    }
  }
}
