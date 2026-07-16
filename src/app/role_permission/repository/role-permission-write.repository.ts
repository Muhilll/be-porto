import { eq } from "drizzle-orm";
import { db } from "../../../db";
import { role_permissions } from "../../../db/schema";
import {
  CreateRolePermissionRequestDto,
  UpdateRolePermissionRequestDto,
} from "../dto/role-permission-request.dto";

export class RolePermissionWriteRepository {
  static async createRolePermission(data: CreateRolePermissionRequestDto) {
    try {
      return await db.insert(role_permissions).values(data);
    } catch (error) {
      throw new Error(`Failed to create role permission: ${error}`);
    }
  }

  static async updateRolePermission(
    id: number,
    data: UpdateRolePermissionRequestDto,
  ) {
    try {
      return await db
        .update(role_permissions)
        .set({
          ...data,
          updated_at: new Date(),
        })
        .where(eq(role_permissions.id, id));
    } catch (error) {
      throw new Error(`Failed to update role permission: ${error}`);
    }
  }

  static async deleteRolePermission(id: number) {
    try {
      return await db.delete(role_permissions).where(eq(role_permissions.id, id));
    } catch (error) {
      throw new Error(`Failed to delete role permission: ${error}`);
    }
  }
}
