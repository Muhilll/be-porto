import { RolePermissionWithRelationsRow } from "../contract/role-permission.contract";
import {
  CreateRolePermissionRequestDto,
  UpdateRolePermissionRequestDto,
} from "../dto/role-permission-request.dto";
import { RolePermissionResponseDto } from "../dto/role-permission-response.dto";
import { RolePermissionReadRepository } from "../repository/role-permission-read.repository";
import { RolePermissionWriteRepository } from "../repository/role-permission-write.repository";

export class RolePermissionService {
  private static mapRolePermission(
    rolePermission: RolePermissionWithRelationsRow,
  ): RolePermissionResponseDto {
    return {
      id: rolePermission.id,
      role_id: rolePermission.role_id,
      menu_id: rolePermission.menu_id,
      can_read: Boolean(rolePermission.can_read),
      can_create: Boolean(rolePermission.can_create),
      can_update: Boolean(rolePermission.can_update),
      can_delete: Boolean(rolePermission.can_delete),
      can_report: Boolean(rolePermission.can_report),
      created_at: rolePermission.created_at,
      updated_at: rolePermission.updated_at,
      role: {
        id: rolePermission.role_ref_id,
        code: rolePermission.role_code,
        name: rolePermission.role_name,
      },
      menu: {
        id: rolePermission.menu_ref_id,
        name: rolePermission.menu_name,
        path: rolePermission.menu_path,
        permission_path: rolePermission.menu_permission_path,
        icon: rolePermission.menu_icon,
        parent_id: rolePermission.menu_parent_id,
      },
    };
  }

  static async getAllRolePermissions(): Promise<RolePermissionResponseDto[]> {
    const result = await RolePermissionReadRepository.getAllRolePermissions();
    return result.map((item) =>
      RolePermissionService.mapRolePermission(item),
    );
  }

  static async getRolePermissionById(
    id: number,
  ): Promise<RolePermissionResponseDto | null> {
    const result = await RolePermissionReadRepository.getRolePermissionById(id);

    if (!result) {
      return null;
    }

    return RolePermissionService.mapRolePermission(result);
  }

  static async getPermissionsByRoleId(
    roleId: number,
  ): Promise<RolePermissionResponseDto[]> {
    const result = await RolePermissionReadRepository.getPermissionsByRoleId(
      roleId,
    );

    return result.map((item) =>
      RolePermissionService.mapRolePermission(item),
    );
  }

  static async createRolePermission(payload: CreateRolePermissionRequestDto) {
    return RolePermissionWriteRepository.createRolePermission(payload);
  }

  static async updateRolePermission(
    id: number,
    payload: UpdateRolePermissionRequestDto,
  ) {
    const rolePermission =
      await RolePermissionReadRepository.getRolePermissionById(id);

    if (!rolePermission) {
      return null;
    }

    const result = await RolePermissionWriteRepository.updateRolePermission(
      id,
      payload,
    );

    return { rolePermission, result };
  }

  static async deleteRolePermission(id: number) {
    const rolePermission =
      await RolePermissionReadRepository.getRolePermissionById(id);

    if (!rolePermission) {
      return null;
    }

    const result = await RolePermissionWriteRepository.deleteRolePermission(id);
    return { rolePermission, result };
  }
}
