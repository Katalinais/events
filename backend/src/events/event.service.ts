import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateEventoDto } from './dto/create-evento.dto';
import { UpdateEventoDto } from './dto/update-evento.dto';

@Injectable()
export class EventService {
  constructor(private prisma: PrismaService) {}

  private async ensureCategoryExists(categoriaId: number | null | undefined) {
    if (categoriaId == null) return;
    const cat = await this.prisma.categoria.findFirst({
      where: { id: categoriaId, deletedAt: null },
    });
    if (!cat) {
      throw new BadRequestException(`Categoría con ID ${categoriaId} no encontrada`);
    }
  }

  async create(createEventoDto: CreateEventoDto) {
    await this.ensureCategoryExists(createEventoDto.categoriaId);
    const fecha = createEventoDto.fecha?.trim()
      ? new Date(createEventoDto.fecha)
      : new Date();
    return this.prisma.evento.create({
      data: {
        nombre: createEventoDto.nombre,
        descripcion: createEventoDto.descripcion,
        precio: createEventoDto.precio ?? 0,
        urlImagen: createEventoDto.urlImagen ?? null,
        fecha,
        categoriaId: createEventoDto.categoriaId ?? null,
      },
    });
  }

  async findAll() {
    return this.prisma.evento.findMany({
      where: { deletedAt: null },
      orderBy: { fecha: 'asc' },
      include: { _count: { select: { interesados: true } } },
    });
  }


  async findReportWithInterestedUsers() {
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

  async findOne(id: number) {
    const evento = await this.prisma.evento.findFirst({
      where: { id, deletedAt: null },
      include: { _count: { select: { interesados: true } } },
    });

    if (!evento) {
      throw new NotFoundException(`Evento con ID ${id} no encontrado`);
    }

    return evento;
  }

  async update(id: number, updateEventoDto: UpdateEventoDto) {
    await this.findOne(id);
    await this.ensureCategoryExists(updateEventoDto.categoriaId);

    const data: any = {};

    if (updateEventoDto.nombre !== undefined) {
      data.nombre = updateEventoDto.nombre;
    }
    if (updateEventoDto.descripcion !== undefined) {
      data.descripcion = updateEventoDto.descripcion;
    }
    if (updateEventoDto.precio !== undefined) {
      data.precio = updateEventoDto.precio;
    }
    if (updateEventoDto.urlImagen !== undefined) {
      data.urlImagen = updateEventoDto.urlImagen;
    }
    if (updateEventoDto.fecha !== undefined) {
      data.fecha = new Date(updateEventoDto.fecha);
    }
    if (updateEventoDto.categoriaId !== undefined) {
      data.categoriaId = updateEventoDto.categoriaId;
    }

    return this.prisma.evento.update({
      where: { id },
      data,
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    return this.prisma.evento.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async findUpcoming(limit: number = 10) {
    const now = new Date();

    return this.prisma.evento.findMany({
      where: {
        deletedAt: null,
        fecha: { gte: now },
      },
      orderBy: { fecha: 'asc' },
      take: limit,
      include: { _count: { select: { interesados: true } } },
    });
  }

  async findFavoritesByUser(usuarioId: number) {
    const favoritos = await this.prisma.usuarioInteresado.findMany({
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

    return favoritos
      .map((fav) => fav.evento)
      .filter((evento): evento is NonNullable<typeof evento> => evento != null);
  }

  async markInterested(eventoId: number, usuarioId: number): Promise<{ interesados: number }> {
    if (!usuarioId) {
      throw new BadRequestException('Usuario no identificado');
    }
    await this.findOne(eventoId);

    try {
      await this.prisma.usuarioInteresado.create({
        data: { usuarioId, eventoId },
      });
    } catch (e: unknown) {
      const isUniqueViolation =
        e && typeof e === 'object' && 'code' in e && (e as { code: string }).code === 'P2002';
      if (!isUniqueViolation) throw e;
    }

    const total = await this.prisma.usuarioInteresado.count({
      where: { eventoId },
    });
    return { interesados: total };
  }

  async unmarkInterested(eventoId: number, usuarioId: number): Promise<{ interesados: number }> {
    if (!usuarioId) {
      throw new BadRequestException('Usuario no identificado');
    }
    await this.findOne(eventoId);

    await this.prisma.usuarioInteresado.deleteMany({
      where: { usuarioId, eventoId },
    });

    const total = await this.prisma.usuarioInteresado.count({
      where: { eventoId },
    });
    return { interesados: total };
  }
}
