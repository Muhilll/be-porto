import { Context } from "hono";
import { TokenPayload } from "../../../utils/jwt";
import { UserNavigationService } from "../service/user-navigation.service";

export class UserNavigationController {
  static async getNavigation(c: Context) {
    const user = c.get("user") as TokenPayload | undefined;
    const navigation = await UserNavigationService.getNavigation(user);

    if (!navigation) {
      return c.json(
        {
          success: false,
          message: "Unauthorized - User role not found",
        },
        401,
      );
    }

    return c.json({
      success: true,
      data: navigation,
      message: "Navigation fetched successfully",
    });
  }
}
