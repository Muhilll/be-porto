import { compare } from "bcryptjs";
import { generateToken } from "../../../utils/jwt";
import { LoginResponseDto } from "../dto/user-response.dto";
import { UserReadRepository } from "../repository/user-read.repository";

export class UserAuthService {
  static async login(
    email: string,
    password: string,
  ): Promise<LoginResponseDto | null> {
    const user = await UserReadRepository.getUserByEmail(email);

    if (!user) {
      return null;
    }

    const isPasswordValid = await compare(password, user.password);

    if (!isPasswordValid) {
      return null;
    }

    const token = generateToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role_id: user.role_id,
    });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role_id: user.role_id,
      },
    };
  }
}
