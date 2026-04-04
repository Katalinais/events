import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import type { Evento, Prisma } from '@prisma/client';

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
      where: { deletedAt: null },
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
}
