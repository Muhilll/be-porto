import { eq } from "drizzle-orm";
import { db } from "../../../db";
import { roles, users } from "../../../db/schema";
import { PublicUser, UserWithRelationsRow } from "../contract/user.contract";

const userWithRelationsSelect = {
  id: users.id,
  email: users.email,
  name: users.name,
  role_id: users.role_id,
  created_at: users.created_at,
  updated_at: users.updated_at,
  role_ref_id: roles.id,
  role_code: roles.code,
  role_name: roles.name,
};

function mapUserWithRelations(user: UserWithRelationsRow): PublicUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role_id: user.role_id,
    created_at: user.created_at,
    updated_at: user.updated_at,
    role: {
      id: user.role_ref_id,
      code: user.role_code,
      name: user.role_name,
    },
  };
}

export class UserReadRepository {
  static async getAllUsers() {
    try {
      const result = await db
        .select(userWithRelationsSelect)
        .from(users)
        .innerJoin(roles, eq(users.role_id, roles.id));

      return result.map(mapUserWithRelations);
    } catch (error) {
      throw new Error(`Failed to fetch users: ${error}`);
    }
  }

  static async getUserById(id: number) {
    try {
      const result = await db
        .select(userWithRelationsSelect)
        .from(users)
        .innerJoin(roles, eq(users.role_id, roles.id))
        .where(eq(users.id, id))
        .limit(1);

      return result[0] ? mapUserWithRelations(result[0]) : null;
    } catch (error) {
      throw new Error(`Failed to fetch user: ${error}`);
    }
  }

  static async getUserByEmail(email: string) {
    try {
      const result = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      return result[0] || null;
    } catch (error) {
      throw new Error(`Failed to fetch user: ${error}`);
    }
  }
}
