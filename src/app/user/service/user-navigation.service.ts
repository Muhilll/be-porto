import { TokenPayload } from "../../../utils/jwt";
import { NavigationResponseDto } from "../dto/user-response.dto";
import { UserNavigationRepository } from "../repository/user-navigation.repository";

export class UserNavigationService {
  static async getNavigation(
    user: TokenPayload | undefined,
  ): Promise<NavigationResponseDto | null> {
    if (!user?.role_id) {
      return null;
    }

    return UserNavigationRepository.getNavigationByRoleId(user.role_id);
  }
}
