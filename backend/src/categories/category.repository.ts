import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import type { Categoria } from '@prisma/client';

@Injectable()
export class CategoryRepository {
  constructor(private readonly prisma: PrismaService) {}

  findActiveByNameInsensitive(name: string): Promise<Categoria | null> {
    return this.prisma.categoria.findFirst({
      where: { deletedAt: null, nombre: { equals: name, mode: 'insensitive' } },
    });
  }

  findOtherActiveByNameInsensitive(name: string, excludeId: number): Promise<Categoria | null> {
    return this.prisma.categoria.findFirst({
      where: {
        deletedAt: null,
        nombre: { equals: name, mode: 'insensitive' },
        id: { not: excludeId },
      },
    });
  }

  create(name: string): Promise<Categoria> {
    return this.prisma.categoria.create({
      data: { nombre: name },
    });
  }

  findAllActive(): Promise<Categoria[]> {
    return this.prisma.categoria.findMany({
      where: { deletedAt: null },
      orderBy: { nombre: 'asc' },
    });
  }

  findFirstActiveById(id: number): Promise<Categoria | null> {
    return this.prisma.categoria.findFirst({
      where: { id, deletedAt: null },
    });
  }

  update(id: number, data: { name?: string }): Promise<Categoria> {
    return this.prisma.categoria.update({
      where: { id },
      data: { nombre: data.name },
    });
  }

  countActiveEventsByCategoryId(categoryId: number): Promise<number> {
    return this.prisma.evento.count({
      where: { categoriaId: categoryId, deletedAt: null },
    });
  }

  softDeleteById(id: number): Promise<Categoria> {
    return this.prisma.categoria.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
