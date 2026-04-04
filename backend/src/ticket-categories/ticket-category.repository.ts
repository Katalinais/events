import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import type { CategoriaEntrada } from '@prisma/client';

@Injectable()
export class TicketCategoryRepository {
  constructor(private readonly prisma: PrismaService) {}

  findActiveByNombreInsensitive(nombre: string): Promise<CategoriaEntrada | null> {
    return this.prisma.categoriaEntrada.findFirst({
      where: { deletedAt: null, nombre: { equals: nombre, mode: 'insensitive' } },
    });
  }

  findOtherActiveByNombreInsensitive(
    nombre: string,
    excludeId: number,
  ): Promise<CategoriaEntrada | null> {
    return this.prisma.categoriaEntrada.findFirst({
      where: {
        deletedAt: null,
        nombre: { equals: nombre, mode: 'insensitive' },
        id: { not: excludeId },
      },
    });
  }

  create(data: { nombre: string; descripcion?: string }): Promise<CategoriaEntrada> {
    return this.prisma.categoriaEntrada.create({ data });
  }

  findAllActive(): Promise<CategoriaEntrada[]> {
    return this.prisma.categoriaEntrada.findMany({
      where: { deletedAt: null },
      orderBy: { nombre: 'asc' },
    });
  }

  findFirstActiveById(id: number): Promise<CategoriaEntrada | null> {
    return this.prisma.categoriaEntrada.findFirst({
      where: { id, deletedAt: null },
    });
  }

  update(
    id: number,
    data: { nombre?: string; descripcion?: string },
  ): Promise<CategoriaEntrada> {
    return this.prisma.categoriaEntrada.update({ where: { id }, data });
  }

  countActiveEventoEntradasById(categoriaEntradaId: number): Promise<number> {
    return this.prisma.eventoEntrada.count({ where: { categoriaEntradaId } });
  }

  softDeleteById(id: number): Promise<CategoriaEntrada> {
    return this.prisma.categoriaEntrada.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
