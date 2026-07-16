import {
  CreateRoleRequestDto,
  UpdateRoleRequestDto,
} from "../dto/role-request.dto";
import { RoleResponseDto } from "../dto/role-response.dto";
import { RoleReadRepository } from "../repository/role-read.repository";
import { RoleWriteRepository } from "../repository/role-write.repository";

export class RoleService {
  static async getAllRoles(): Promise<RoleResponseDto[]> {
    return RoleReadRepository.getAllRoles();
  }

  static async getRoleById(id: number): Promise<RoleResponseDto | null> {
    return RoleReadRepository.getRoleById(id);
  }

  static async createRole(payload: CreateRoleRequestDto) {
    const existingRole = await RoleReadRepository.getRoleByCode(payload.code);

    if (existingRole) {
      return { conflict: true as const };
    }

    const result = await RoleWriteRepository.createRole(payload);
    return { conflict: false as const, result };
  }

  static async updateRole(id: number, payload: UpdateRoleRequestDto) {
    const role = await RoleReadRepository.getRoleById(id);

    if (!role) {
      return null;
    }

    const result = await RoleWriteRepository.updateRole(id, payload);
    return { role, result };
  }

  static async deleteRole(id: number) {
    const role = await RoleReadRepository.getRoleById(id);

    if (!role) {
      return null;
    }

    const result = await RoleWriteRepository.deleteRole(id);
    return { role, result };
  }
}
