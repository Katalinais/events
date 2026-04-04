import { Injectable, BadRequestException } from '@nestjs/common';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { TicketRepository } from './ticket.repository';

@Injectable()
export class TicketService {
  constructor(private readonly ticketRepository: TicketRepository) {}

  async create(usuarioId: number, dto: CreateTicketDto) {
    const resolvedItems: {
      eventoEntradaId: number;
      cantidad: number;
      precioUnitario: number;
      subtotal: number;
    }[] = [];

    for (const item of dto.items) {
      const entrada = await this.ticketRepository.findEventoEntradaById(item.eventoEntradaId);

      if (!entrada) {
        throw new BadRequestException(
          `Entrada con ID ${item.eventoEntradaId} no encontrada`,
        );
      }

      if (entrada.cantidadDisponible < item.cantidad) {
        throw new BadRequestException(
          `No hay suficientes boletas disponibles para la entrada ID ${item.eventoEntradaId}. Disponibles: ${entrada.cantidadDisponible}`,
        );
      }

      const subtotal = entrada.precio * item.cantidad;
      resolvedItems.push({
        eventoEntradaId: item.eventoEntradaId,
        cantidad: item.cantidad,
        precioUnitario: entrada.precio,
        subtotal,
      });
    }

    const total = resolvedItems.reduce((sum, i) => sum + i.subtotal, 0);

    for (const item of resolvedItems) {
      await this.ticketRepository.decrementDisponible(item.eventoEntradaId, item.cantidad);
    }

    return this.ticketRepository.createTicketWithDetails(usuarioId, total, resolvedItems);
  }

  findByUser(usuarioId: number) {
    return this.ticketRepository.findTicketsByUser(usuarioId);
  }
}
