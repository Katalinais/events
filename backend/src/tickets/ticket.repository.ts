import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import type { EventoEntrada, Venta } from '@prisma/client';

@Injectable()
export class TicketRepository {
  constructor(private readonly prisma: PrismaService) {}

  findEventoEntradaById(id: number) {
    return this.prisma.eventoEntrada.findFirst({
      where: { id },
      include: { evento: { select: { estado: true } } },
    });
  }

  decrementDisponible(eventoEntradaId: number, cantidad: number): Promise<EventoEntrada> {
    return this.prisma.eventoEntrada.update({
      where: { id: eventoEntradaId },
      data: { cantidadDisponible: { decrement: cantidad } },
    });
  }

  createTicketWithDetails(
    usuarioId: number,
    total: number,
    items: { eventoEntradaId: number; cantidad: number; precioUnitario: number; subtotal: number }[],
  ): Promise<Venta> {
    return this.prisma.venta.create({
      data: {
        usuarioId,
        total,
        detalles: {
          create: items.map((item) => ({
            eventoEntradaId: item.eventoEntradaId,
            cantidad: item.cantidad,
            precioUnitario: item.precioUnitario,
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

  findTicketsByUser(usuarioId: number) {
    return this.prisma.venta.findMany({
      where: { usuarioId },
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