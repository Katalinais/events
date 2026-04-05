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