import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { TicketCategoryService } from '../ticket-categories/ticket-category.service';
import { TicketCategoryRepository } from '../ticket-categories/ticket-category.repository';

const mockTicketCategoryRepository = () => ({
  findActiveByNameInsensitive: jest.fn(),
  findOtherActiveByNameInsensitive: jest.fn(),
  findFirstActiveById: jest.fn(),
  findAllActiveWithSoldCount: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  softDeleteById: jest.fn(),
  countSoldTicketsByCategoryId: jest.fn(),
});

describe('TicketCategoryService', () => {
  let service: TicketCategoryService;
  let repo: ReturnType<typeof mockTicketCategoryRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TicketCategoryService,
        { provide: TicketCategoryRepository, useFactory: mockTicketCategoryRepository },
      ],
    }).compile();

    service = module.get<TicketCategoryService>(TicketCategoryService);
    repo = module.get(TicketCategoryRepository);
  });

  describe('create', () => {
    it('throws ConflictException when a ticket category with that name already exists', async () => {
      repo.findActiveByNameInsensitive.mockResolvedValue({ id: 1, nombre: 'VIP' });

      await expect(service.create({ name: 'VIP' })).rejects.toThrow(ConflictException);
      expect(repo.create).not.toHaveBeenCalled();
    });

    it('creates ticket category when name is unique', async () => {
      repo.findActiveByNameInsensitive.mockResolvedValue(null);
      repo.create.mockResolvedValue({ id: 1, nombre: 'VIP' });

      await service.create({ name: '  VIP  ' });

      expect(repo.create).toHaveBeenCalledWith({ nombre: 'VIP', descripcion: undefined });
    });

    it('passes description when provided', async () => {
      repo.findActiveByNameInsensitive.mockResolvedValue(null);
      repo.create.mockResolvedValue({ id: 1, nombre: 'VIP', descripcion: 'Acceso preferencial' });

      await service.create({ name: 'VIP', description: 'Acceso preferencial' });

      expect(repo.create).toHaveBeenCalledWith({
        nombre: 'VIP',
        descripcion: 'Acceso preferencial',
      });
    });
  });

  describe('findOne', () => {
    it('throws NotFoundException when ticket category does not exist', async () => {
      repo.findFirstActiveById.mockResolvedValue(null);

      await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
    });

    it('returns ticket category when found', async () => {
      const category = { id: 1, nombre: 'VIP' };
      repo.findFirstActiveById.mockResolvedValue(category);

      expect(await service.findOne(1)).toEqual(category);
    });
  });

  describe('remove', () => {
    it('throws ConflictException when tickets have already been sold', async () => {
      repo.findFirstActiveById.mockResolvedValue({ id: 1, nombre: 'VIP' });
      repo.countSoldTicketsByCategoryId.mockResolvedValue(5);

      await expect(service.remove(1)).rejects.toThrow(ConflictException);
      expect(repo.softDeleteById).not.toHaveBeenCalled();
    });

    it('deletes when no tickets have been sold', async () => {
      repo.findFirstActiveById.mockResolvedValue({ id: 1, nombre: 'VIP' });
      repo.countSoldTicketsByCategoryId.mockResolvedValue(0);
      repo.softDeleteById.mockResolvedValue({ id: 1 });

      await service.remove(1);

      expect(repo.softDeleteById).toHaveBeenCalledWith(1);
    });
  });
});
