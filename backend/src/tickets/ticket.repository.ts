import { Injectable } from '@nestjs/common';
import { EstadoVenta } from '@prisma/client';
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

  // ─── Métodos para el flujo async con Kafka ──────────────────────────────────

  createPendingVenta(userId: number): Promise<Venta> {
    return this.prisma.venta.create({
      data: { usuarioId: userId },
    });
  }

  updateVentaStatus(ventaId: number, status: EstadoVenta): Promise<Venta> {
    return this.prisma.venta.update({
      where: { id: ventaId },
      data: { status },
    });
  }

  completeVenta(
    ventaId: number,
    total: number,
    items: { eventEntryId: number; quantity: number; unitPrice: number; subtotal: number }[],
  ): Promise<Venta> {
    return this.prisma.venta.update({
      where: { id: ventaId },
      data: {
        total,
        status: EstadoVenta.COMPLETADA,
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

  failVenta(ventaId: number, errorMsg: string): Promise<Venta> {
    return this.prisma.venta.update({
      where: { id: ventaId },
      data: { status: EstadoVenta.FALLIDA, errorMsg },
    });
  }

  // ─── Métodos heredados (solo COMPLETADA) ────────────────────────────────────

  findTicketById(id: number) {
    return this.prisma.venta.findFirst({
      where: { id, status: EstadoVenta.COMPLETADA },
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
    const result = await this.prisma.venta.aggregate({
      where: { status: EstadoVenta.COMPLETADA },
      _sum: { total: true },
    });
    return result._sum.total ?? 0;
  }

  findTicketsByUser(userId: number) {
    return this.prisma.venta.findMany({
      where: { usuarioId: userId, status: EstadoVenta.COMPLETADA },
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

  findPurchasesByUserAndEvent(userId: number, eventId: number) {
    return this.prisma.venta.findMany({
      where: {
        usuarioId: userId,
        status: EstadoVenta.COMPLETADA,
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

  async findPurchaseQRsByUserAndEvent(userId: number, eventId: number): Promise<string[]> {
    const ventas = await this.prisma.venta.findMany({
      where: {
        usuarioId: userId,
        status: EstadoVenta.COMPLETADA,
        detalles: { some: { eventoEntrada: { eventoId: eventId } } },
      },
      select: { codigoQR: true },
    });
    return ventas.map((v) => v.codigoQR);
  }

  async findPurchasedEventsByUser(userId: number) {
    const ventas = await this.prisma.venta.findMany({
      where: { usuarioId: userId, status: EstadoVenta.COMPLETADA },
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

  // Método legacy - mantenido por compatibilidad interna (no expuesto en el controller)
  createTicketWithDetails(
    userId: number,
    total: number,
    items: { eventEntryId: number; quantity: number; unitPrice: number; subtotal: number }[],
  ): Promise<Venta> {
    return this.prisma.venta.create({
      data: {
        usuarioId: userId,
        total,
        status: EstadoVenta.COMPLETADA,
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
}
