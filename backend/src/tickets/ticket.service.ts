import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { TICKET_MESSAGES } from '../shared/messages';
import { EstadoEvento } from '@prisma/client';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { TicketRepository } from './ticket.repository';
import { generateTicketPdf } from '../utils/pdf.util';
import { CacheService } from '../shared/cache.service';
import { CACHE_KEYS } from '../shared/constants';

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
        throw new BadRequestException(TICKET_MESSAGES.ENTRY_NOT_FOUND(item.eventEntryId));
      }

      if (entry.evento.estado !== EstadoEvento.ACTIVO) {
        throw new BadRequestException(TICKET_MESSAGES.EVENT_ALREADY_ENDED);
      }

      if (entry.cantidadDisponible < item.quantity) {
        throw new BadRequestException(
          TICKET_MESSAGES.NOT_ENOUGH_AVAILABLE(item.eventEntryId, entry.cantidadDisponible),
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
    this.cacheService.invalidate(CACHE_KEYS.TOP_SELLING_EVENTS);
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
      throw new NotFoundException(TICKET_MESSAGES.PURCHASE_NOT_FOUND(ticketId));
    }

    if (ticket.usuarioId !== userId) {
      throw new NotFoundException(TICKET_MESSAGES.PURCHASE_NOT_FOUND(ticketId));
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
