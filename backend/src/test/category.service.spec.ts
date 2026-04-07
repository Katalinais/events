import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { CategoryService } from '../categories/category.service';
import { CategoryRepository } from '../categories/category.repository';

const mockCategoryRepository = () => ({
  findActiveByNameInsensitive: jest.fn(),
  findOtherActiveByNameInsensitive: jest.fn(),
  findFirstActiveById: jest.fn(),
  findAllActive: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  softDeleteById: jest.fn(),
  countActiveEventsByCategoryId: jest.fn(),
});

describe('CategoryService', () => {
  let service: CategoryService;
  let repo: ReturnType<typeof mockCategoryRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoryService,
        { provide: CategoryRepository, useFactory: mockCategoryRepository },
      ],
    }).compile();

    service = module.get<CategoryService>(CategoryService);
    repo = module.get(CategoryRepository);
  });

  describe('create', () => {
    it('throws ConflictException when a category with that name already exists', async () => {
      repo.findActiveByNameInsensitive.mockResolvedValue({ id: 1, nombre: 'Música' });

      await expect(service.create({ name: 'Música' })).rejects.toThrow(ConflictException);
      expect(repo.create).not.toHaveBeenCalled();
    });

    it('creates the category when the name is unique', async () => {
      repo.findActiveByNameInsensitive.mockResolvedValue(null);
      repo.create.mockResolvedValue({ id: 1, nombre: 'Música' });

      await service.create({ name: '  Música  ' });

      expect(repo.create).toHaveBeenCalledWith('Música');
    });
  });

  describe('findOne', () => {
    it('throws NotFoundException when the category does not exist', async () => {
      repo.findFirstActiveById.mockResolvedValue(null);

      await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
    });

    it('returns the category when found', async () => {
      const category = { id: 1, nombre: 'Música' };
      repo.findFirstActiveById.mockResolvedValue(category);

      expect(await service.findOne(1)).toEqual(category);
    });
  });

  describe('update', () => {
    it('throws ConflictException when another category already has the new name', async () => {
      repo.findFirstActiveById.mockResolvedValue({ id: 1, nombre: 'Música' });
      repo.findOtherActiveByNameInsensitive.mockResolvedValue({ id: 2, nombre: 'Teatro' });

      await expect(service.update(1, { name: 'Teatro' })).rejects.toThrow(ConflictException);
      expect(repo.update).not.toHaveBeenCalled();
    });

    it('updates when the new name is unique', async () => {
      repo.findFirstActiveById.mockResolvedValue({ id: 1, nombre: 'Música' });
      repo.findOtherActiveByNameInsensitive.mockResolvedValue(null);
      repo.update.mockResolvedValue({ id: 1, nombre: 'Teatro' });

      await service.update(1, { name: 'Teatro' });

      expect(repo.update).toHaveBeenCalledWith(1, { name: 'Teatro' });
    });
  });

  describe('remove', () => {
    it('throws ConflictException when the category has associated events', async () => {
      repo.findFirstActiveById.mockResolvedValue({ id: 1, nombre: 'Música' });
      repo.countActiveEventsByCategoryId.mockResolvedValue(3);

      await expect(service.remove(1)).rejects.toThrow(ConflictException);
      expect(repo.softDeleteById).not.toHaveBeenCalled();
    });

    it('deletes when the category has no associated events', async () => {
      repo.findFirstActiveById.mockResolvedValue({ id: 1, nombre: 'Música' });
      repo.countActiveEventsByCategoryId.mockResolvedValue(0);
      repo.softDeleteById.mockResolvedValue({ id: 1 });

      await service.remove(1);

      expect(repo.softDeleteById).toHaveBeenCalledWith(1);
    });
  });
});
