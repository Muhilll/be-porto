import {
  CreateMenuRequestDto,
  UpdateMenuRequestDto,
} from "../dto/menu-request.dto";
import { MenuResponseDto } from "../dto/menu-response.dto";
import { MenuReadRepository } from "../repository/menu-read.repository";
import { MenuWriteRepository } from "../repository/menu-write.repository";

export class MenuService {
  static async getAllMenus(): Promise<MenuResponseDto[]> {
    return MenuReadRepository.getAllMenus();
  }

  static async getMenuById(id: number): Promise<MenuResponseDto | null> {
    return MenuReadRepository.getMenuById(id);
  }

  static async getMenusByParentId(
    parentId: number | null,
  ): Promise<MenuResponseDto[]> {
    return MenuReadRepository.getMenusByParentId(parentId);
  }

  static async createMenu(payload: CreateMenuRequestDto) {
    return MenuWriteRepository.createMenu(payload);
  }

  static async updateMenu(id: number, payload: UpdateMenuRequestDto) {
    const menu = await MenuReadRepository.getMenuById(id);

    if (!menu) {
      return null;
    }

    const result = await MenuWriteRepository.updateMenu(id, payload);
    return { menu, result };
  }

  static async deleteMenu(id: number) {
    const menu = await MenuReadRepository.getMenuById(id);

    if (!menu) {
      return null;
    }

    const result = await MenuWriteRepository.deleteMenu(id);
    return { menu, result };
  }
}
