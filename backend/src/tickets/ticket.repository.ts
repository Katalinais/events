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
    userId: string,
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

  findTicketsByUser(userId: string) {
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

  findPurchasesByUserAndEvent(userId: string, eventId: number) {
    return this.prisma.venta.findMany({
      where: {
        usuarioId: userId,
        detalles: { some: { eventoEntrada: { eventoId: eventId } } },
      },
      orderBy: { fechaVenta: 'asc' },
      include: {
        detalles: {
          where: { eventoEntrada: { eventoId: eventId } },
          include: {
            eventoEntrada: {
              include: { categoriaEntrada: true, evento: true },
            },
          },
        },
      },
    });
  }

  async findPurchaseQRsByUserAndEvent(userId: string, eventId: number): Promise<string[]> {
    const ventas = await this.prisma.venta.findMany({
      where: {
        usuarioId: userId,
        detalles: { some: { eventoEntrada: { eventoId: eventId } } },
      },
      select: { codigoQR: true },
    });
    return ventas.map((v) => v.codigoQR);
  }

  async findPurchasedEventsByUser(userId: string) {
    const ventas = await this.prisma.venta.findMany({
      where: { usuarioId: userId },
      include: {
        detalles: {
          select: {
            cantidad: true,
            eventoEntrada: {
              select: {
                evento: {
                  select: { id: true, nombre: true, fecha: true, urlImagen: true },
                },
              },
            },
          },
        },
      },
    });

    const eventMap = new Map<
      number,
      { id: number; nombre: string; fecha: Date; urlImagen: string | null; totalTickets: number }
    >();

    for (const venta of ventas) {
      for (const detalle of venta.detalles) {
        const evento = detalle.eventoEntrada.evento;
        const prev = eventMap.get(evento.id);
        eventMap.set(evento.id, {
          id: evento.id,
          nombre: evento.nombre,
          fecha: evento.fecha,
          urlImagen: evento.urlImagen,
          totalTickets: (prev?.totalTickets ?? 0) + detalle.cantidad,
        });
      }
    }

    return [...eventMap.values()].sort((a, b) => b.fecha.getTime() - a.fecha.getTime());
  }
}
