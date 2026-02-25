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
    return this.prisma.evento.create({
      data: {
        nombre: createEventoDto.nombre,
        descripcion: createEventoDto.descripcion,
        precio: createEventoDto.precio,
        urlImagen: createEventoDto.urlImagen,
        fecha: new Date(createEventoDto.fecha),
        categoriaId: createEventoDto.categoriaId ?? null,
      },
    });
  }

  async findAll() {
    return this.prisma.evento.findMany({
      where: { deletedAt: null },
      orderBy: {
        fecha: 'asc',
      },
    });
  }

  async findOne(id: number) {
    const evento = await this.prisma.evento.findFirst({
      where: { id, deletedAt: null },
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
        fecha: {
          gte: now,
        },
      },
      orderBy: {
        fecha: 'asc',
      },
      take: limit,
    });
  }
}
