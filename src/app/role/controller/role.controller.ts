import { Context } from "hono";
import {
  CreateRoleRequestDto,
  UpdateRoleRequestDto,
} from "../dto/role-request.dto";
import { RoleService } from "../service/role.service";

export class RoleController {
  static async getAll(c: Context) {
    const roles = await RoleService.getAllRoles();

    return c.json({
      success: true,
      data: roles,
      message: "Roles fetched successfully",
    });
  }

  static async getById(c: Context) {
    const id = Number(c.req.param("id"));
    const role = await RoleService.getRoleById(id);

    if (!role) {
      return c.json({ success: false, message: "Role not found" }, 404);
    }

    return c.json({
      success: true,
      data: role,
      message: "Role fetched successfully",
    });
  }

  static async create(c: Context) {
    const body: CreateRoleRequestDto = await c.req.json();
    const createResult = await RoleService.createRole(body);

    if (createResult.conflict) {
      return c.json(
        { success: false, message: "Role code already exists" },
        400,
      );
    }

    return c.json(
      {
        success: true,
        data: createResult.result,
        message: "Role created successfully",
      },
      201,
    );
  }

  static async update(c: Context) {
    const id = Number(c.req.param("id"));
    const body: UpdateRoleRequestDto = await c.req.json();
    const updateResult = await RoleService.updateRole(id, body);

    if (!updateResult) {
      return c.json({ success: false, message: "Role not found" }, 404);
    }

    return c.json({
      success: true,
      data: updateResult.result,
      message: "Role updated successfully",
    });
  }

  static async delete(c: Context) {
    const id = Number(c.req.param("id"));
    const deleteResult = await RoleService.deleteRole(id);

    if (!deleteResult) {
      return c.json({ success: false, message: "Role not found" }, 404);
    }

    return c.json({
      success: true,
      data: deleteResult.result,
      message: "Role deleted successfully",
    });
  }
}
