import { Injectable } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { mapUser } from '../utils/user.mapper';

@Injectable()
export class UsersService {
  constructor(private readonly userRepository: UserRepository) {}

  async findAll() {
    const users = await this.userRepository.findManyNonAdminOrderedByCreatedDesc();
    return users.map(mapUser);
  }
}