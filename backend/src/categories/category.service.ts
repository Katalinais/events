import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { UpdateCategoriaDto } from './dto/update-categoria.dto';

@Injectable()
export class CategoryService {
  constructor(private prisma: PrismaService) {}

  async create(createCategoriaDto: CreateCategoriaDto) {
    const existing = await this.prisma.categoria.findFirst({
      where: { deletedAt: null, nombre: { equals: createCategoriaDto.nombre, mode: 'insensitive' } },
    });
    if (existing) {
      throw new ConflictException('Ya existe una categoría con ese nombre');
    }
    return this.prisma.categoria.create({
      data: { nombre: createCategoriaDto.nombre.trim() },
    });
  }

  async findAll() {
    return this.prisma.categoria.findMany({
      where: { deletedAt: null },
      orderBy: { nombre: 'asc' },
    });
  }

  async findOne(id: number) {
    const categoria = await this.prisma.categoria.findFirst({
      where: { id, deletedAt: null },
    });
    if (!categoria) {
      throw new NotFoundException(`Categoría con ID ${id} no encontrada`);
    }
    return categoria;
  }

  async update(id: number, updateCategoriaDto: UpdateCategoriaDto) {
    await this.findOne(id);
    if (updateCategoriaDto.nombre !== undefined) {
      const existing = await this.prisma.categoria.findFirst({
        where: {
          deletedAt: null,
          nombre: { equals: updateCategoriaDto.nombre.trim(), mode: 'insensitive' },
          id: { not: id },
        },
      });
      if (existing) {
        throw new ConflictException('Ya existe una categoría con ese nombre');
      }
    }
    return this.prisma.categoria.update({
      where: { id },
      data: updateCategoriaDto.nombre !== undefined ? { nombre: updateCategoriaDto.nombre.trim() } : {},
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    const eventsWithCategory = await this.prisma.evento.count({
      where: { categoriaId: id, deletedAt: null },
    });
    if (eventsWithCategory > 0) {
      throw new ConflictException('No se puede eliminar: tiene eventos asociados');
    }
    return this.prisma.categoria.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
