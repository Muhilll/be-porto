import { hash } from "bcryptjs";
import {
  CreateUserRequestDto,
  UpdateUserRequestDto,
} from "../dto/user-request.dto";
import { UserResponseDto } from "../dto/user-response.dto";
import { UserReadRepository } from "../repository/user-read.repository";
import { UserWriteRepository } from "../repository/user-write.repository";

export class UserService {
  static async getAllUsers(): Promise<UserResponseDto[]> {
    return UserReadRepository.getAllUsers();
  }

  static async getUserById(id: number): Promise<UserResponseDto | null> {
    return UserReadRepository.getUserById(id);
  }

  static async createUser(payload: CreateUserRequestDto) {
    const existingUser = await UserReadRepository.getUserByEmail(payload.email);

    if (existingUser) {
      return { conflict: true as const };
    }

    const hashedPassword = await hash(payload.password, 10);
    const result = await UserWriteRepository.createUser({
      ...payload,
      password: hashedPassword,
    });

    return { conflict: false as const, result };
  }

  static async updateUser(id: number, payload: UpdateUserRequestDto) {
    const user = await UserReadRepository.getUserById(id);

    if (!user) {
      return null;
    }

    const updateData = { ...payload };

    if (payload.password) {
      updateData.password = await hash(payload.password, 10);
    }

    const result = await UserWriteRepository.updateUser(id, updateData);
    return { user, result };
  }

  static async deleteUser(id: number) {
    const user = await UserReadRepository.getUserById(id);

    if (!user) {
      return null;
    }

    const result = await UserWriteRepository.deleteUser(id);
    return { user, result };
  }
}
