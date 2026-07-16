import { eq } from "drizzle-orm";
import { db } from "../../../db";
import { users } from "../../../db/schema";
import {
  CreateUserRequestDto,
  UpdateUserRequestDto,
} from "../dto/user-request.dto";

export class UserWriteRepository {
  static async createUser(userData: CreateUserRequestDto) {
    try {
      return await db.insert(users).values({
        ...userData,
      });
    } catch (error) {
      throw new Error(`Failed to create user: ${error}`);
    }
  }

  static async updateUser(id: number, userData: UpdateUserRequestDto) {
    try {
      return await db
        .update(users)
        .set({
          ...userData,
          updated_at: new Date(),
        })
        .where(eq(users.id, id));
    } catch (error) {
      throw new Error(`Failed to update user: ${error}`);
    }
  }

  static async deleteUser(id: number) {
    try {
      return await db.delete(users).where(eq(users.id, id));
    } catch (error) {
      throw new Error(`Failed to delete user: ${error}`);
    }
  }
}
