import { Context } from "hono";
import {
  CreateUserRequestDto,
  UpdateUserRequestDto,
} from "../dto/user-request.dto";
import { UserService } from "../service/user.service";

export class UserController {
  static async getAll(c: Context) {
    const users = await UserService.getAllUsers();

    return c.json({
      success: true,
      data: users,
      message: "Users fetched successfully",
    });
  }

  static async getById(c: Context) {
    const id = Number(c.req.param("id"));
    const user = await UserService.getUserById(id);

    if (!user) {
      return c.json({ success: false, message: "User not found" }, 404);
    }

    return c.json({
      success: true,
      data: user,
      message: "User fetched successfully",
    });
  }

  static async create(c: Context) {
    const body: CreateUserRequestDto = await c.req.json();
    const createResult = await UserService.createUser(body);

    if (createResult.conflict) {
      return c.json(
        { success: false, message: "Email already registered" },
        400,
      );
    }

    return c.json(
      {
        success: true,
        data: createResult.result,
        message: "User created successfully",
      },
      201,
    );
  }

  static async update(c: Context) {
    const id = Number(c.req.param("id"));
    const body: UpdateUserRequestDto = await c.req.json();
    const updateResult = await UserService.updateUser(id, body);

    if (!updateResult) {
      return c.json({ success: false, message: "User not found" }, 404);
    }

    return c.json({
      success: true,
      data: updateResult.result,
      message: "User updated successfully",
    });
  }

  static async delete(c: Context) {
    const id = Number(c.req.param("id"));
    const deleteResult = await UserService.deleteUser(id);

    if (!deleteResult) {
      return c.json({ success: false, message: "User not found" }, 404);
    }

    return c.json({
      success: true,
      data: deleteResult.result,
      message: "User deleted successfully",
    });
  }
}
