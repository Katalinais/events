import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateEventoDto } from './dto/create-evento.dto';
import { UpdateEventoDto } from './dto/update-evento.dto';

@Injectable()
export class EventService {
  constructor(private prisma: PrismaService) {}

  async create(createEventoDto: CreateEventoDto) {
    return this.prisma.evento.create({
      data: {
        nombre: createEventoDto.nombre,
        descripcion: createEventoDto.descripcion,
        precio: createEventoDto.precio,
        urlImagen: createEventoDto.urlImagen,
        fecha: new Date(createEventoDto.fecha),
        categoriaId: null,
      },
    });
  }

  async findAll() {
    return this.prisma.evento.findMany({
      orderBy: {
        fecha: 'asc',
      },
    });
  }

  async findOne(id: number) {
    const evento = await this.prisma.evento.findUnique({
      where: { id },
    });

    if (!evento) {
      throw new NotFoundException(`Evento con ID ${id} no encontrado`);
    }

    return evento;
  }

  async update(id: number, updateEventoDto: UpdateEventoDto) {
    await this.findOne(id);

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

    return this.prisma.evento.update({
      where: { id },
      data,
    });
  }

  async remove(id: number) {
    // Verificar que el evento existe
    await this.findOne(id);

    return this.prisma.evento.delete({
      where: { id },
    });
  }

  async findUpcoming(limit: number = 10) {
    const now = new Date();

    return this.prisma.evento.findMany({
      where: {
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
