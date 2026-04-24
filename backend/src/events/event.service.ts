import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { EVENT_MESSAGES } from '../shared/messages';
import type { Prisma } from '@prisma/client';
import { CategoryRepository } from '../categories/category.repository';
import { TicketCategoryRepository } from '../ticket-categories/ticket-category.repository';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { TicketEntryItemDto } from './dto/save-ticket-entries.dto';
import { EventRepository } from './event.repository';
import { CacheService } from '../shared/cache.service';
import { CACHE_KEYS } from '../shared/constants';

const TOP_SELLING_TTL_MS = 10 * 60 * 1000;

@Injectable()
export class EventService {
  private readonly logger = new Logger(EventService.name);

  constructor(
    private readonly eventRepository: EventRepository,
    private readonly categoryRepository: CategoryRepository,
    private readonly ticketCategoryRepository: TicketCategoryRepository,
    private readonly cacheService: CacheService,
  ) {}

  private async ensureCategoryExists(categoryId: number | null | undefined) {
    if (categoryId == null) return;
    const cat = await this.categoryRepository.findFirstActiveById(categoryId);
    if (!cat) {
      throw new BadRequestException(EVENT_MESSAGES.CATEGORY_NOT_FOUND(categoryId));
    }
  }

  async create(createEventDto: CreateEventDto) {
    await this.ensureCategoryExists(createEventDto.categoryId);
    const date = createEventDto.date?.trim() ? new Date(createEventDto.date) : new Date();
    return this.eventRepository.create({
      nombre: createEventDto.name,
      descripcion: createEventDto.description,
      precio: createEventDto.price ?? 0,
      urlImagen: createEventDto.imageUrl ?? null,
      fecha: date,
      categoriaId: createEventDto.categoryId ?? null,
    });
  }

  async findAll() {
    return this.eventRepository.findAllActiveWithInteresadosCount();
  }

  async findAllForAdmin() {
    return this.eventRepository.findAllWithInteresadosCount();
  }

  async findCompleted() {
    return this.eventRepository.findAllCompleted();
  }

  async findReportWithInterestedUsers() {
    return this.eventRepository.findReportWithInterestedUsers();
  }

  async findOne(id: number) {
    const event = await this.eventRepository.findFirstActiveByIdWithInteresadosCount(id);

    if (!event) {
      throw new NotFoundException(EVENT_MESSAGES.NOT_FOUND(id));
    }

    return event;
  }

  async update(id: number, updateEventDto: UpdateEventDto) {
    await this.findOne(id);
    await this.ensureCategoryExists(updateEventDto.categoryId);

    const data: Prisma.EventoUncheckedUpdateInput = {};

    if (updateEventDto.name !== undefined) {
      data.nombre = updateEventDto.name;
    }
    if (updateEventDto.description !== undefined) {
      data.descripcion = updateEventDto.description;
    }
    if (updateEventDto.price !== undefined) {
      data.precio = updateEventDto.price;
    }
    if (updateEventDto.imageUrl !== undefined) {
      data.urlImagen = updateEventDto.imageUrl;
    }
    if (updateEventDto.date !== undefined) {
      data.fecha = new Date(updateEventDto.date);
    }
    if (updateEventDto.categoryId !== undefined) {
      data.categoriaId = updateEventDto.categoryId;
    }

    return this.eventRepository.update(id, data);
  }

  async remove(id: number) {
    await this.findOne(id);

    const soldCount = await this.eventRepository.countSoldTicketsByEventId(id);
    if (soldCount > 0) {
      throw new ConflictException(EVENT_MESSAGES.CANNOT_DELETE_SOLD(soldCount));
    }

    return this.eventRepository.softDeleteById(id);
  }

  async findUpcoming(limit: number = 10) {
    const now = new Date();

    return this.eventRepository.findUpcomingActive(now, limit);
  }

  async findFavoritesByUser(userId: number) {
    const favorites = await this.eventRepository.findUsuarioInteresadosForUserFavorites(userId);

    return favorites
      .map((fav) => fav.evento)
      .filter((event): event is NonNullable<typeof event> => event != null);
  }

  async markInterested(eventId: number, userId: number): Promise<{ interesados: number }> {
    if (!userId) {
      throw new BadRequestException(EVENT_MESSAGES.USER_NOT_IDENTIFIED);
    }
    await this.findOne(eventId);

    try {
      await this.eventRepository.createUsuarioInteresado(userId, eventId);
    } catch (e: unknown) {
      const isUniqueViolation =
        e && typeof e === 'object' && 'code' in e && (e as { code: string }).code === 'P2002';
      if (!isUniqueViolation) throw e;
    }

    const total = await this.eventRepository.countInteresadosByEventoId(eventId);
    return { interesados: total };
  }

  async findTicketEntries(eventId: number) {
    await this.findOne(eventId);
    return this.eventRepository.findTicketEntriesByEventId(eventId);
  }

  async saveTicketEntries(eventId: number, entries: TicketEntryItemDto[]) {
    await this.findOne(eventId);

    for (const entry of entries) {
      const cat = await this.ticketCategoryRepository.findFirstActiveById(entry.ticketCategoryId);
      if (!cat) {
        throw new BadRequestException(
          EVENT_MESSAGES.TICKET_CATEGORY_NOT_FOUND(entry.ticketCategoryId),
        );
      }

      const existing = await this.eventRepository.findTicketEntryByEventAndCategory(
        eventId,
        entry.ticketCategoryId,
      );
      if (existing) {
        const soldCount = existing.cantidadTotal - existing.cantidadDisponible;
        if (entry.totalQuantity < soldCount) {
          throw new BadRequestException(
            EVENT_MESSAGES.CANNOT_REDUCE_BELOW_SOLD(entry.totalQuantity, cat.nombre, soldCount),
          );
        }
      }
    }

    return this.eventRepository.saveTicketEntries(eventId, entries);
  }

  async getAllEventsSalesSummary() {
    return this.eventRepository.findAllEventsSalesSummary();
  }

  async getTicketSalesReport(eventId: number) {
    const report = await this.eventRepository.findTicketSalesReport(eventId);
    if (!report) {
      throw new NotFoundException(`Event with ID ${eventId} not found`);
    }
    return report;
  }

  async findTopSelling() {
    const cached = this.cacheService.get(CACHE_KEYS.TOP_SELLING_EVENTS, TOP_SELLING_TTL_MS);
    if (cached) {
      this.logger.debug('Top selling from cache');
      return cached;
    }

    this.logger.log('Repopulating top selling cache from DB');
    const result = await this.eventRepository.findTopSelling(3);
    this.cacheService.set(CACHE_KEYS.TOP_SELLING_EVENTS, result);
    return result;
  }

  async unmarkInterested(eventId: number, userId: number): Promise<{ interesados: number }> {
    if (!userId) {
      throw new BadRequestException(EVENT_MESSAGES.USER_NOT_IDENTIFIED);
    }
    await this.findOne(eventId);

    await this.eventRepository.deleteManyUsuarioInteresado(userId, eventId);

    const total = await this.eventRepository.countInteresadosByEventoId(eventId);
    return { interesados: total };
  }
}
