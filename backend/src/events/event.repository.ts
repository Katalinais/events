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
    const eventoTotals = new Map<number, number>();
    for (const r of results) {
      const entrada = await this.prisma.eventoEntrada.findFirst({
        where: { id: r.eventoEntradaId },
        select: { eventoId: true },
      });
      if (!entrada) continue;
      const prev = eventoTotals.get(entrada.eventoId) ?? 0;
      eventoTotals.set(entrada.eventoId, prev + (r._sum.cantidad ?? 0));
    }

    const sorted = [...eventoTotals.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit);

    const eventos = await Promise.all(
      sorted.map(async ([eventoId, totalVendidas]) => {
        const evento = await this.prisma.evento.findFirst({
          where: { id: eventoId, deletedAt: null, estado: EstadoEvento.ACTIVO },
          include: { _count: { select: { interesados: true } } },
        });
        return evento ? { ...evento, totalVendidas } : null;
      }),
    );

    return eventos.filter((e): e is NonNullable<typeof e> => e !== null);
  }

  async findAllEventsSalesSummary() {
    const eventos = await this.prisma.evento.findMany({
      where: { deletedAt: null },
      orderBy: { fecha: 'desc' },
      select: { id: true, nombre: true },
    });

    const summaries = await Promise.all(
      eventos.map(async (evento) => {
        const entradas = await this.prisma.eventoEntrada.findMany({
          where: { eventoId: evento.id },
          include: { detallesBoleta: { select: { cantidad: true, subtotal: true } } },
        });

        const totalEntradas = entradas.reduce(
          (sum, e) => sum + e.detallesBoleta.reduce((s, d) => s + d.cantidad, 0),
          0,
        );
        const gananciaTotal = entradas.reduce(
          (sum, e) => sum + e.detallesBoleta.reduce((s, d) => s + d.subtotal, 0),
          0,
        );

        return { eventoId: evento.id, eventoNombre: evento.nombre, totalEntradas, gananciaTotal };
      }),
    );

    return summaries;
  }

  async findTicketSalesReport(eventoId: number) {
    const evento = await this.prisma.evento.findFirst({
      where: { id: eventoId, deletedAt: null },
      select: { nombre: true },
    });

    if (!evento) return null;

    const entradas = await this.prisma.eventoEntrada.findMany({
      where: { eventoId },
      include: {
        categoriaEntrada: { select: { nombre: true } },
        detallesBoleta: { select: { cantidad: true, subtotal: true } },
      },
    });

    const lineas = entradas
      .map((entrada) => {
        const cantidadVendida = entrada.detallesBoleta.reduce((sum, d) => sum + d.cantidad, 0);
        const ganancia = entrada.detallesBoleta.reduce((sum, d) => sum + d.subtotal, 0);
        return {
          categoria: entrada.categoriaEntrada.nombre,
          precioUnitario: entrada.precio,
          cantidadVendida,
          ganancia,
        };
      })
      .filter((l) => l.cantidadVendida > 0);

    const totalEntradas = lineas.reduce((sum, l) => sum + l.cantidadVendida, 0);
    const gananciaTotal = lineas.reduce((sum, l) => sum + l.ganancia, 0);

    return { eventoNombre: evento.nombre, lineas, totalEntradas, gananciaTotal };
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

  findEntradasByEventoId(eventoId: number): Promise<EventoEntrada[]> {
    return this.prisma.eventoEntrada.findMany({
      where: { eventoId },
      orderBy: { categoriaEntradaId: 'asc' },
    });
  }

  async saveEntradas(
    eventoId: number,
    entradas: { categoriaEntradaId: number; cantidadTotal: number; precio: number }[],
  ): Promise<EventoEntrada[]> {
    const incomingIds = entradas.map((e) => e.categoriaEntradaId);

    await this.prisma.eventoEntrada.deleteMany({
      where: { eventoId, categoriaEntradaId: { notIn: incomingIds } },
    });

    const results: EventoEntrada[] = [];

    for (const entrada of entradas) {
      const existing = await this.prisma.eventoEntrada.findFirst({
        where: { eventoId, categoriaEntradaId: entrada.categoriaEntradaId },
      });

      if (existing) {
        const diff = entrada.cantidadTotal - existing.cantidadTotal;
        const newDisponible = Math.max(0, existing.cantidadDisponible + diff);
        const updated = await this.prisma.eventoEntrada.update({
          where: { id: existing.id },
          data: {
            cantidadTotal: entrada.cantidadTotal,
            cantidadDisponible: newDisponible,
            precio: entrada.precio,
          },
        });
        results.push(updated);
      } else {
        const created = await this.prisma.eventoEntrada.create({
          data: {
            eventoId,
            categoriaEntradaId: entrada.categoriaEntradaId,
            cantidadTotal: entrada.cantidadTotal,
            cantidadDisponible: entrada.cantidadTotal,
            precio: entrada.precio,
          },
        });
        results.push(created);
      }
    }

    return results;
  }
}