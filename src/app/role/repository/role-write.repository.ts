import { eq } from "drizzle-orm";
import { db } from "../../../db";
import { roles } from "../../../db/schema";
import {
  CreateRoleRequestDto,
  UpdateRoleRequestDto,
} from "../dto/role-request.dto";

export class RoleWriteRepository {
  static async createRole(data: CreateRoleRequestDto) {
    try {
      return await db.insert(roles).values(data);
    } catch (error) {
      throw new Error(`Failed to create role: ${error}`);
    }
  }

  static async updateRole(id: number, data: UpdateRoleRequestDto) {
    try {
      return await db
        .update(roles)
        .set({
          ...data,
          updated_at: new Date(),
        })
        .where(eq(roles.id, id));
    } catch (error) {
      throw new Error(`Failed to update role: ${error}`);
    }
  }

  static async deleteRole(id: number) {
    try {
      return await db.delete(roles).where(eq(roles.id, id));
    } catch (error) {
      throw new Error(`Failed to delete role: ${error}`);
    }
  }
}
