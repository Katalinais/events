import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../users/users.service';
import { UserRepository } from '../users/user.repository';

const mockUserRepository = () => ({
  findManyNonAdminOrderedByCreatedDesc: jest.fn(),
});

describe('UsersService', () => {
  let service: UsersService;
  let repo: ReturnType<typeof mockUserRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService, { provide: UserRepository, useFactory: mockUserRepository }],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repo = module.get(UserRepository);
  });

  describe('findAll', () => {
    it('returns an empty array when there are no users', async () => {
      repo.findManyNonAdminOrderedByCreatedDesc.mockResolvedValue([]);

      expect(await service.findAll()).toEqual([]);
    });

    it('converts createdAt Date to ISO string', async () => {
      const date = new Date('2024-06-15T10:00:00.000Z');
      repo.findManyNonAdminOrderedByCreatedDesc.mockResolvedValue([
        {
          id: 1,
          nombre: 'Ana',
          apellido: 'García',
          correo: 'ana@example.com',
          username: 'ana',
          createdAt: date,
        },
      ]);

      const result = await service.findAll();

      expect(result[0].createdAt).toBe(date.toISOString());
    });

    it('preserves all user fields alongside the converted date', async () => {
      const date = new Date('2024-06-15T10:00:00.000Z');
      const rawUser = {
        id: 1,
        nombre: 'Ana',
        apellido: 'García',
        correo: 'ana@example.com',
        username: 'ana',
        createdAt: date,
      };
      repo.findManyNonAdminOrderedByCreatedDesc.mockResolvedValue([rawUser]);

      const [user] = await service.findAll();

      expect(user.id).toBe(1);
      expect(user.nombre).toBe('Ana');
      expect(user.username).toBe('ana');
    });
  });
});
