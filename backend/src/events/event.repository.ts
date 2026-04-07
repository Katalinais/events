import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import type { Evento, EventoEntrada, Prisma } from '@prisma/client';
import { EstadoEvento } from '@prisma/client';

@Injectable()
export class EventRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: {
    nombre: string;
    descripcion?: string | null;
    precio: number;
    urlImagen?: string | null;
    fecha: Date;
    categoriaId?: number | null;
  }): Promise<Evento> {
    return this.prisma.evento.create({ data });
  }

  async findTopSelling(limit: number) {
    const results = await this.prisma.detalleBoleta.groupBy({
      by: ['eventoEntradaId'],
      _sum: { cantidad: true },
      orderBy: { _sum: { cantidad: 'desc' } },
    });

    // Resolve eventoId for each eventoEntradaId and aggregate by event
    const eventTotals = new Map<number, number>();
    for (const r of results) {
      const entry = await this.prisma.eventoEntrada.findFirst({
        where: { id: r.eventoEntradaId },
        select: { eventoId: true },
      });
      if (!entry) continue;
      const prev = eventTotals.get(entry.eventoId) ?? 0;
      eventTotals.set(entry.eventoId, prev + (r._sum.cantidad ?? 0));
    }

    const sorted = [...eventTotals.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit);

    const events = await Promise.all(
      sorted.map(async ([eventId, totalSold]) => {
        const event = await this.prisma.evento.findFirst({
          where: { id: eventId, deletedAt: null, estado: EstadoEvento.ACTIVO },
          include: { _count: { select: { interesados: true } } },
        });
        return event ? { ...event, totalSold } : null;
      }),
    );

    return events.filter((e): e is NonNullable<typeof e> => e !== null);
  }

  async findAllEventsSalesSummary() {
    const events = await this.prisma.evento.findMany({
      where: { deletedAt: null },
      orderBy: { fecha: 'desc' },
      select: { id: true, nombre: true },
    });

    const summaries = await Promise.all(
      events.map(async (event) => {
        const entries = await this.prisma.eventoEntrada.findMany({
          where: { eventoId: event.id },
          include: { detallesBoleta: { select: { cantidad: true, subtotal: true } } },
        });

        const totalTickets = entries.reduce(
          (sum, e) => sum + e.detallesBoleta.reduce((s, d) => s + d.cantidad, 0),
          0,
        );
        const totalRevenue = entries.reduce(
          (sum, e) => sum + e.detallesBoleta.reduce((s, d) => s + d.subtotal, 0),
          0,
        );

        return { eventId: event.id, eventName: event.nombre, totalTickets, totalRevenue };
      }),
    );

    return summaries;
  }

  async findTicketSalesReport(eventId: number) {
    const event = await this.prisma.evento.findFirst({
      where: { id: eventId, deletedAt: null },
      select: { nombre: true },
    });

    if (!event) return null;

    const entries = await this.prisma.eventoEntrada.findMany({
      where: { eventoId: eventId },
      include: {
        categoriaEntrada: { select: { nombre: true } },
        detallesBoleta: { select: { cantidad: true, subtotal: true } },
      },
    });

    const lines = entries
      .map((entry) => {
        const soldCount = entry.detallesBoleta.reduce((sum, d) => sum + d.cantidad, 0);
        const revenue = entry.detallesBoleta.reduce((sum, d) => sum + d.subtotal, 0);
        return {
          category: entry.categoriaEntrada.nombre,
          unitPrice: entry.precio,
          soldCount,
          revenue,
        };
      })
      .filter((l) => l.soldCount > 0);

    const totalTickets = lines.reduce((sum, l) => sum + l.soldCount, 0);
    const totalRevenue = lines.reduce((sum, l) => sum + l.revenue, 0);

    return { eventName: event.nombre, lines, totalTickets, totalRevenue };
  }

  findAllCompleted() {
    return this.prisma.evento.findMany({
      where: { deletedAt: null, estado: EstadoEvento.COMPLETADO },
      orderBy: { fecha: 'desc' },
      include: { _count: { select: { interesados: true } } },
    });
  }

  findAllWithInteresadosCount() {
    return this.prisma.evento.findMany({
      where: { deletedAt: null },
      orderBy: { fecha: 'asc' },
      include: { _count: { select: { interesados: true } } },
    });
  }

  findAllActiveWithInteresadosCount() {
    return this.prisma.evento.findMany({
      where: { deletedAt: null, estado: EstadoEvento.ACTIVO },
      orderBy: { fecha: 'asc' },
      include: { _count: { select: { interesados: true } } },
    });
  }

  findReportWithInterestedUsers() {
    return this.prisma.evento.findMany({
      where: { deletedAt: null },
      orderBy: { fecha: 'asc' },
      include: {
        _count: { select: { interesados: true } },
        interesados: {
          include: {
            usuario: {
              select: { id: true, nombre: true, username: true, correo: true },
            },
          },
        },
      },
    });
  }

  findFirstActiveByIdWithInteresadosCount(id: number) {
    return this.prisma.evento.findFirst({
      where: { id, deletedAt: null },
      include: { _count: { select: { interesados: true } } },
    });
  }

  update(id: number, data: Prisma.EventoUncheckedUpdateInput): Promise<Evento> {
    return this.prisma.evento.update({
      where: { id },
      data,
    });
  }

  softDeleteById(id: number): Promise<Evento> {
    return this.prisma.evento.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  findUpcomingActive(since: Date, limit: number) {
    return this.prisma.evento.findMany({
      where: {
        deletedAt: null,
        estado: EstadoEvento.ACTIVO,
        fecha: { gte: since },
      },
      orderBy: { fecha: 'asc' },
      take: limit,
      include: { _count: { select: { interesados: true } } },
    });
  }

  findUsuarioInteresadosForUserFavorites(usuarioId: number) {
    return this.prisma.usuarioInteresado.findMany({
      where: {
        usuarioId,
        evento: {
          deletedAt: null,
        },
      },
      orderBy: { createdAt: 'desc' },
      include: {
        evento: {
          include: { _count: { select: { interesados: true } } },
        },
      },
    });
  }

  createUsuarioInteresado(usuarioId: number, eventoId: number) {
    return this.prisma.usuarioInteresado.create({
      data: { usuarioId, eventoId },
    });
  }

  countInteresadosByEventoId(eventoId: number): Promise<number> {
    return this.prisma.usuarioInteresado.count({
      where: { eventoId },
    });
  }

  deleteManyUsuarioInteresado(usuarioId: number, eventoId: number) {
    return this.prisma.usuarioInteresado.deleteMany({
      where: { usuarioId, eventoId },
    });
  }

  markEventsAsCompleted(before: Date): Promise<{ count: number }> {
    return this.prisma.evento.updateMany({
      where: {
        deletedAt: null,
        estado: EstadoEvento.ACTIVO,
        fecha: { lt: before },
      },
      data: { estado: EstadoEvento.COMPLETADO },
    });
  }

  findTicketEntryByEventAndCategory(
    eventId: number,
    ticketCategoryId: number,
  ): Promise<EventoEntrada | null> {
    return this.prisma.eventoEntrada.findFirst({
      where: { eventoId: eventId, categoriaEntradaId: ticketCategoryId },
    });
  }

  findTicketEntriesByEventId(eventId: number): Promise<EventoEntrada[]> {
    return this.prisma.eventoEntrada.findMany({
      where: { eventoId: eventId },
      orderBy: { categoriaEntradaId: 'asc' },
    });
  }

  async saveTicketEntries(
    eventId: number,
    entries: { ticketCategoryId: number; totalQuantity: number; price: number }[],
  ): Promise<EventoEntrada[]> {
    const incomingIds = entries.map((e) => e.ticketCategoryId);

    await this.prisma.eventoEntrada.deleteMany({
      where: { eventoId: eventId, categoriaEntradaId: { notIn: incomingIds } },
    });

    const results: EventoEntrada[] = [];

    for (const entry of entries) {
      const existing = await this.prisma.eventoEntrada.findFirst({
        where: { eventoId: eventId, categoriaEntradaId: entry.ticketCategoryId },
      });

      if (existing) {
        const diff = entry.totalQuantity - existing.cantidadTotal;
        const newAvailable = Math.max(0, existing.cantidadDisponible + diff);
        const updated = await this.prisma.eventoEntrada.update({
          where: { id: existing.id },
          data: {
            cantidadTotal: entry.totalQuantity,
            cantidadDisponible: newAvailable,
            precio: entry.price,
          },
        });
        results.push(updated);
      } else {
        const created = await this.prisma.eventoEntrada.create({
          data: {
            eventoId: eventId,
            categoriaEntradaId: entry.ticketCategoryId,
            cantidadTotal: entry.totalQuantity,
            cantidadDisponible: entry.totalQuantity,
            precio: entry.price,
          },
        });
        results.push(created);
      }
    }

    return results;
  }
}
