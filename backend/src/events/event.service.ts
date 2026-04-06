import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { CategoryRepository } from '../categories/category.repository';
import { TicketCategoryRepository } from '../ticket-categories/ticket-category.repository';
import { CreateEventoDto } from './dto/create-evento.dto';
import { UpdateEventoDto } from './dto/update-evento.dto';
import { TicketEntryItemDto } from './dto/save-ticket-entries.dto';
import { EventRepository } from './event.repository';
import { CacheService } from '../shared/cache.service';

export const TOP_SELLING_CACHE_KEY = 'events:top-selling';
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

  private async ensureCategoryExists(categoriaId: number | null | undefined) {
    if (categoriaId == null) return;
    const cat = await this.categoryRepository.findFirstActiveById(categoriaId);
    if (!cat) {
      throw new BadRequestException(`Categoría con ID ${categoriaId} no encontrada`);
    }
  }

  async create(createEventoDto: CreateEventoDto) {
    await this.ensureCategoryExists(createEventoDto.categoriaId);
    const fecha = createEventoDto.fecha?.trim()
      ? new Date(createEventoDto.fecha)
      : new Date();
    return this.eventRepository.create({
      nombre: createEventoDto.nombre,
      descripcion: createEventoDto.descripcion,
      precio: createEventoDto.precio ?? 0,
      urlImagen: createEventoDto.urlImagen ?? null,
      fecha,
      categoriaId: createEventoDto.categoriaId ?? null,
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
    const evento = await this.eventRepository.findFirstActiveByIdWithInteresadosCount(id);

    if (!evento) {
      throw new NotFoundException(`Evento con ID ${id} no encontrado`);
    }

    return evento;
  }

  async update(id: number, updateEventoDto: UpdateEventoDto) {
    await this.findOne(id);
    await this.ensureCategoryExists(updateEventoDto.categoriaId);

    const data: Prisma.EventoUncheckedUpdateInput = {};

    if (updateEventoDto.nombre !== undefined) {
      data.nombre = updateEventoDto.nombre;
    }
    if (updateEventoDto.descripcion !== undefined) {
      data.descripcion = updateEventoDto.descripcion;
    }
    if (updateEventoDto.precio !== undefined) {
      data.precio = updateEventoDto.precio;
    }
    if (updateEventoDto.urlImagen !== undefined) {
      data.urlImagen = updateEventoDto.urlImagen;
    }
    if (updateEventoDto.fecha !== undefined) {
      data.fecha = new Date(updateEventoDto.fecha);
    }
    if (updateEventoDto.categoriaId !== undefined) {
      data.categoriaId = updateEventoDto.categoriaId;
    }

    return this.eventRepository.update(id, data);
  }

  async remove(id: number) {
    await this.findOne(id);

    return this.eventRepository.softDeleteById(id);
  }

  async findUpcoming(limit: number = 10) {
    const now = new Date();

    return this.eventRepository.findUpcomingActive(now, limit);
  }

  async findFavoritesByUser(usuarioId: number) {
    const favoritos = await this.eventRepository.findUsuarioInteresadosForUserFavorites(usuarioId);

    return favoritos
      .map((fav) => fav.evento)
      .filter((evento): evento is NonNullable<typeof evento> => evento != null);
  }

  async markInterested(eventoId: number, usuarioId: number): Promise<{ interesados: number }> {
    if (!usuarioId) {
      throw new BadRequestException('Usuario no identificado');
    }
    await this.findOne(eventoId);

    try {
      await this.eventRepository.createUsuarioInteresado(usuarioId, eventoId);
    } catch (e: unknown) {
      const isUniqueViolation =
        e && typeof e === 'object' && 'code' in e && (e as { code: string }).code === 'P2002';
      if (!isUniqueViolation) throw e;
    }

    const total = await this.eventRepository.countInteresadosByEventoId(eventoId);
    return { interesados: total };
  }

  async findEntradas(eventoId: number) {
    await this.findOne(eventoId);
    return this.eventRepository.findEntradasByEventoId(eventoId);
  }

  async saveEntradas(eventoId: number, entradas: TicketEntryItemDto[]) {
    await this.findOne(eventoId);

    for (const entrada of entradas) {
      const cat = await this.ticketCategoryRepository.findFirstActiveById(
        entrada.categoriaEntradaId,
      );
      if (!cat) {
        throw new BadRequestException(
          `Categoría de boleta con ID ${entrada.categoriaEntradaId} no encontrada`,
        );
      }

      const existing = await this.eventRepository.findEventoEntradaByEventoAndCategoria(
        eventoId,
        entrada.categoriaEntradaId,
      );
      if (existing) {
        const vendidas = existing.cantidadTotal - existing.cantidadDisponible;
        if (entrada.cantidadTotal < vendidas) {
          throw new BadRequestException(
            `No puedes establecer ${entrada.cantidadTotal} boletas para "${cat.nombre}" porque ya se han vendido ${vendidas}`,
          );
        }
      }
    }

    return this.eventRepository.saveEntradas(eventoId, entradas);
  }

  async getAllEventsSalesSummary() {
    return this.eventRepository.findAllEventsSalesSummary();
  }

  async getTicketSalesReport(eventoId: number) {
    const report = await this.eventRepository.findTicketSalesReport(eventoId);
    if (!report) {
      throw new NotFoundException(`Evento con ID ${eventoId} no encontrado`);
    }
    return report;
  }

  async findTopSelling() {
    const cached = this.cacheService.get(TOP_SELLING_CACHE_KEY, TOP_SELLING_TTL_MS);
    if (cached) {
      this.logger.debug('Top selling desde caché');
      return cached;
    }

    this.logger.log('Repoblando caché de top selling desde DB');
    const result = await this.eventRepository.findTopSelling(3);
    this.cacheService.set(TOP_SELLING_CACHE_KEY, result);
    return result;
  }

  async unmarkInterested(eventoId: number, usuarioId: number): Promise<{ interesados: number }> {
    if (!usuarioId) {
      throw new BadRequestException('Usuario no identificado');
    }
    await this.findOne(eventoId);

    await this.eventRepository.deleteManyUsuarioInteresado(usuarioId, eventoId);

    const total = await this.eventRepository.countInteresadosByEventoId(eventoId);
    return { interesados: total };
  }
}