import { Context } from "hono";
import {
  CreateRolePermissionRequestDto,
  UpdateRolePermissionRequestDto,
} from "../dto/role-permission-request.dto";
import { RolePermissionService } from "../service/role-permission.service";

export class RolePermissionController {
  static async getAll(c: Context) {
    const rolePermissions = await RolePermissionService.getAllRolePermissions();

    return c.json({
      success: true,
      data: rolePermissions,
      message: "Role permissions fetched successfully",
    });
  }

  static async getById(c: Context) {
    const id = Number(c.req.param("id"));
    const rolePermission = await RolePermissionService.getRolePermissionById(id);

    if (!rolePermission) {
      return c.json(
        { success: false, message: "Role permission not found" },
        404,
      );
    }

    return c.json({
      success: true,
      data: rolePermission,
      message: "Role permission fetched successfully",
    });
  }

  static async getByRoleId(c: Context) {
    const roleId = Number(c.req.param("roleId"));
    const permissions = await RolePermissionService.getPermissionsByRoleId(roleId);

    return c.json({
      success: true,
      data: permissions,
      message: "Role permissions fetched successfully",
    });
  }

  static async create(c: Context) {
    const body: CreateRolePermissionRequestDto = await c.req.json();
    const result = await RolePermissionService.createRolePermission(body);

    return c.json(
      {
        success: true,
        data: result,
        message: "Role permission created successfully",
      },
      201,
    );
  }

  static async update(c: Context) {
    const id = Number(c.req.param("id"));
    const body: UpdateRolePermissionRequestDto = await c.req.json();
    const updateResult = await RolePermissionService.updateRolePermission(id, body);

    if (!updateResult) {
      return c.json(
        { success: false, message: "Role permission not found" },
        404,
      );
    }

    return c.json({
      success: true,
      data: updateResult.result,
      message: "Role permission updated successfully",
    });
  }

  static async delete(c: Context) {
    const id = Number(c.req.param("id"));
    const deleteResult = await RolePermissionService.deleteRolePermission(id);

    if (!deleteResult) {
      return c.json(
        { success: false, message: "Role permission not found" },
        404,
      );
    }

    return c.json({
      success: true,
      data: deleteResult.result,
      message: "Role permission deleted successfully",
    });
  }
}
