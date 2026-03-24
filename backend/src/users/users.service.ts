import { Injectable } from '@nestjs/common';
import { UserRepository } from './user.repository';

@Injectable()
export class UsersService {
  constructor(private readonly userRepository: UserRepository) {}

  async findAll() {
    const rows = await this.userRepository.findManyNonAdminOrderedByCreatedDesc();
    return rows.map((u) => ({
      ...u,
      createdAt: u.createdAt.toISOString(),
    }));
  }
}
