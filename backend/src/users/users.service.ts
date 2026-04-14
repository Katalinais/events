import { Injectable } from '@nestjs/common';
import { UserRepository } from './user.repository';

@Injectable()
export class UsersService {
  constructor(private readonly userRepository: UserRepository) {}

  async findAll() {
    const users = await this.userRepository.findManyNonAdminOrderedByCreatedDesc();
    return users.map((u) => ({
      ...u,
      createdAt: u.createdAt.toISOString(),
    }));
  }
}