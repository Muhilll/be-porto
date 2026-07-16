import { Context } from "hono";
import {
  CreateMenuRequestDto,
  UpdateMenuRequestDto,
} from "../dto/menu-request.dto";
import { MenuService } from "../service/menu.service";

export class MenuController {
  static async getAll(c: Context) {
    const menus = await MenuService.getAllMenus();

    return c.json({
      success: true,
      data: menus,
      message: "Menus fetched successfully",
    });
  }

  static async getById(c: Context) {
    const id = Number(c.req.param("id"));
    const menu = await MenuService.getMenuById(id);

    if (!menu) {
      return c.json({ success: false, message: "Menu not found" }, 404);
    }

    return c.json({
      success: true,
      data: menu,
      message: "Menu fetched successfully",
    });
  }

  static async create(c: Context) {
    const body: CreateMenuRequestDto = await c.req.json();
    const result = await MenuService.createMenu(body);

    return c.json(
      {
        success: true,
        data: result,
        message: "Menu created successfully",
      },
      201,
    );
  }

  static async update(c: Context) {
    const id = Number(c.req.param("id"));
    const body: UpdateMenuRequestDto = await c.req.json();
    const updateResult = await MenuService.updateMenu(id, body);

    if (!updateResult) {
      return c.json({ success: false, message: "Menu not found" }, 404);
    }

    return c.json({
      success: true,
      data: updateResult.result,
      message: "Menu updated successfully",
    });
  }

  static async delete(c: Context) {
    const id = Number(c.req.param("id"));
    const deleteResult = await MenuService.deleteMenu(id);

    if (!deleteResult) {
      return c.json({ success: false, message: "Menu not found" }, 404);
    }

    return c.json({
      success: true,
      data: deleteResult.result,
      message: "Menu deleted successfully",
    });
  }
}
