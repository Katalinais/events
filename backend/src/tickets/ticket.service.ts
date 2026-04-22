import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { EstadoEvento } from '@prisma/client';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { TicketRepository } from './ticket.repository';
import { generateTicketPdf } from '../utils/pdf.util';
import { CacheService } from '../shared/cache.service';
import { TOP_SELLING_CACHE_KEY } from '../events/event.service';

@Injectable()
export class TicketService {
  constructor(
    private readonly ticketRepository: TicketRepository,
    private readonly cacheService: CacheService,
  ) {}

  async create(userId: number, dto: CreateTicketDto) {
    const purchaseItems: {
      eventEntryId: number;
      quantity: number;
      unitPrice: number;
      subtotal: number;
    }[] = [];

    for (const item of dto.items) {
      const entry = await this.ticketRepository.findTicketEntryById(item.eventEntryId);

      if (!entry) {
        throw new BadRequestException(`Ticket entry with ID ${item.eventEntryId} not found`);
      }

      if (entry.evento.estado !== EstadoEvento.ACTIVO) {
        throw new BadRequestException(
          'Cannot purchase tickets for an event that has already ended',
        );
      }

      if (entry.cantidadDisponible < item.quantity) {
        throw new BadRequestException(
          `Not enough tickets available for entry ID ${item.eventEntryId}. Available: ${entry.cantidadDisponible}`,
        );
      }

      const subtotal = entry.precio * item.quantity;
      purchaseItems.push({
        eventEntryId: item.eventEntryId,
        quantity: item.quantity,
        unitPrice: entry.precio,
        subtotal,
      });
    }

    const total = purchaseItems.reduce((sum, i) => sum + i.subtotal, 0);

    for (const item of purchaseItems) {
      await this.ticketRepository.decrementAvailable(item.eventEntryId, item.quantity);
    }

    const result = await this.ticketRepository.createTicketWithDetails(
      userId,
      total,
      purchaseItems,
    );
    this.cacheService.invalidate(TOP_SELLING_CACHE_KEY);
    return result;
  }

  getTotalEarnings(): Promise<number> {
    return this.ticketRepository.getTotalEarnings();
  }

  findByUser(userId: number) {
    return this.ticketRepository.findTicketsByUser(userId);
  }

  async generatePdf(ticketId: number, userId: number): Promise<Buffer> {
    const ticket = await this.ticketRepository.findTicketById(ticketId);

    if (!ticket) {
      throw new NotFoundException(`Purchase with ID ${ticketId} not found`);
    }

    if (ticket.usuarioId !== userId) {
      throw new NotFoundException(`Purchase with ID ${ticketId} not found`);
    }

    return generateTicketPdf({
      qrCode: ticket.codigoQR,
      saleDate: ticket.fechaVenta,
      total: ticket.total,
      details: ticket.detalles.map((d) => ({
        categoryName: d.eventoEntrada.categoriaEntrada.nombre,
        eventName: d.eventoEntrada.evento.nombre,
        quantity: d.cantidad,
        unitPrice: d.precioUnitario,
        subtotal: d.subtotal,
      })),
    });
  }
}
