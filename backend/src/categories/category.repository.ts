import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import type { Categoria } from '@prisma/client';

@Injectable()
export class CategoryRepository {
  constructor(private readonly prisma: PrismaService) {}

  findActiveByNombreInsensitive(nombre: string): Promise<Categoria | null> {
    return this.prisma.categoria.findFirst({
      where: { deletedAt: null, nombre: { equals: nombre, mode: 'insensitive' } },
    });
  }

  findOtherActiveByNombreInsensitive(
    nombre: string,
    excludeId: number,
  ): Promise<Categoria | null> {
    return this.prisma.categoria.findFirst({
      where: {
        deletedAt: null,
        nombre: { equals: nombre, mode: 'insensitive' },
        id: { not: excludeId },
      },
    });
  }

  create(nombre: string): Promise<Categoria> {
    return this.prisma.categoria.create({
      data: { nombre },
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

  update(id: number, data: { nombre?: string }): Promise<Categoria> {
    return this.prisma.categoria.update({
      where: { id },
      data,
    });
  }

  countActiveEventsByCategoriaId(categoriaId: number): Promise<number> {
    return this.prisma.evento.count({
      where: { categoriaId, deletedAt: null },
    });
  }

  softDeleteById(id: number): Promise<Categoria> {
    return this.prisma.categoria.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
