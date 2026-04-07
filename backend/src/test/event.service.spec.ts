import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { EventService } from '../events/event.service';
import { EventRepository } from '../events/event.repository';
import { CategoryRepository } from '../categories/category.repository';
import { TicketCategoryRepository } from '../ticket-categories/ticket-category.repository';
import { CacheService } from '../shared/cache.service';

const mockEventRepository = () => ({
  create: jest.fn(),
  findAllActiveWithInteresadosCount: jest.fn(),
  findAllWithInteresadosCount: jest.fn(),
  findAllCompleted: jest.fn(),
  findReportWithInterestedUsers: jest.fn(),
  findFirstActiveByIdWithInteresadosCount: jest.fn(),
  findUpcomingActive: jest.fn(),
  findUsuarioInteresadosForUserFavorites: jest.fn(),
  createUsuarioInteresado: jest.fn(),
  deleteManyUsuarioInteresado: jest.fn(),
  countInteresadosByEventoId: jest.fn(),
  findTicketEntriesByEventId: jest.fn(),
  findTicketEntryByEventAndCategory: jest.fn(),
  saveTicketEntries: jest.fn(),
  findAllEventsSalesSummary: jest.fn(),
  findTicketSalesReport: jest.fn(),
  findTopSelling: jest.fn(),
  update: jest.fn(),
  softDeleteById: jest.fn(),
});

const mockCategoryRepository = () => ({
  findFirstActiveById: jest.fn(),
});

const mockTicketCategoryRepository = () => ({
  findFirstActiveById: jest.fn(),
});

const mockCacheService = () => ({
  get: jest.fn(),
  set: jest.fn(),
  invalidate: jest.fn(),
});

describe('EventService', () => {
  let service: EventService;
  let eventRepo: ReturnType<typeof mockEventRepository>;
  let categoryRepo: ReturnType<typeof mockCategoryRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventService,
        { provide: EventRepository, useFactory: mockEventRepository },
        { provide: CategoryRepository, useFactory: mockCategoryRepository },
        { provide: TicketCategoryRepository, useFactory: mockTicketCategoryRepository },
        { provide: CacheService, useFactory: mockCacheService },
      ],
    }).compile();

    service = module.get<EventService>(EventService);
    eventRepo = module.get(EventRepository);
    categoryRepo = module.get(CategoryRepository);
  });

  describe('findOne', () => {
    it('throws NotFoundException when event does not exist', async () => {
      eventRepo.findFirstActiveByIdWithInteresadosCount.mockResolvedValue(null);

      await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
    });

    it('returns the event when found', async () => {
      const event = { id: 1, nombre: 'Festival', _count: { interesados: 0 } };
      eventRepo.findFirstActiveByIdWithInteresadosCount.mockResolvedValue(event);

      expect(await service.findOne(1)).toEqual(event);
    });
  });

  describe('create', () => {
    it('throws BadRequestException when the given categoryId does not exist', async () => {
      categoryRepo.findFirstActiveById.mockResolvedValue(null);

      await expect(
        service.create({ name: 'Festival', price: 50000, date: '2025-12-01', categoryId: 99 }),
      ).rejects.toThrow(BadRequestException);

      expect(eventRepo.create).not.toHaveBeenCalled();
    });

    it('creates the event when categoryId is valid', async () => {
      categoryRepo.findFirstActiveById.mockResolvedValue({ id: 1, nombre: 'Música' });
      eventRepo.create.mockResolvedValue({ id: 1, nombre: 'Festival' });

      await service.create({ name: 'Festival', price: 50000, date: '2025-12-01', categoryId: 1 });

      expect(eventRepo.create).toHaveBeenCalled();
    });

    it('creates the event without a category when categoryId is not provided', async () => {
      eventRepo.create.mockResolvedValue({ id: 1, nombre: 'Festival' });

      await service.create({ name: 'Festival', price: 50000, date: '2025-12-01' });

      expect(eventRepo.create).toHaveBeenCalled();
      expect(categoryRepo.findFirstActiveById).not.toHaveBeenCalled();
    });
  });

  describe('markInterested', () => {
    it('throws BadRequestException when userId is falsy', async () => {
      await expect(service.markInterested(1, 0)).rejects.toThrow(BadRequestException);
    });
  });
});
