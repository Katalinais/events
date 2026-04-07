import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import type { EventoEntrada, Venta } from '@prisma/client';

@Injectable()
export class TicketRepository {
  constructor(private readonly prisma: PrismaService) {}

  findTicketEntryById(id: number) {
    return this.prisma.eventoEntrada.findFirst({
      where: { id },
      include: { evento: { select: { estado: true } } },
    });
  }

  decrementAvailable(ticketEntryId: number, quantity: number): Promise<EventoEntrada> {
    return this.prisma.eventoEntrada.update({
      where: { id: ticketEntryId },
      data: { cantidadDisponible: { decrement: quantity } },
    });
  }

  createTicketWithDetails(
    userId: number,
    total: number,
    items: { eventEntryId: number; quantity: number; unitPrice: number; subtotal: number }[],
  ): Promise<Venta> {
    return this.prisma.venta.create({
      data: {
        usuarioId: userId,
        total,
        detalles: {
          create: items.map((item) => ({
            eventoEntradaId: item.eventEntryId,
            cantidad: item.quantity,
            precioUnitario: item.unitPrice,
            subtotal: item.subtotal,
          })),
        },
      },
      include: {
        detalles: {
          include: {
            eventoEntrada: {
              include: { categoriaEntrada: true, evento: true },
            },
          },
        },
      },
    });
  }

  findTicketById(id: number) {
    return this.prisma.venta.findFirst({
      where: { id },
      include: {
        detalles: {
          include: {
            eventoEntrada: {
              include: { categoriaEntrada: true, evento: true },
            },
          },
        },
      },
    });
  }

  async getTotalEarnings(): Promise<number> {
    const result = await this.prisma.venta.aggregate({ _sum: { total: true } });
    return result._sum.total ?? 0;
  }

  findTicketsByUser(userId: number) {
    return this.prisma.venta.findMany({
      where: { usuarioId: userId },
      orderBy: { fechaVenta: 'desc' },
      include: {
        detalles: {
          include: {
            eventoEntrada: {
              include: { categoriaEntrada: true, evento: true },
            },
          },
        },
      },
    });
  }
}
