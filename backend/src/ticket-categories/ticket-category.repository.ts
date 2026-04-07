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

  async countSoldTicketsByCategoriaId(categoriaEntradaId: number): Promise<number> {
    const result = await this.prisma.detalleBoleta.aggregate({
      where: { eventoEntrada: { categoriaEntradaId } },
      _sum: { cantidad: true },
    });
    return result._sum.cantidad ?? 0;
  }

  async findAllActiveWithSoldCount() {
    const categories = await this.prisma.categoriaEntrada.findMany({
      where: { deletedAt: null },
      orderBy: { nombre: 'asc' },
    });

    const soldGroups = await this.prisma.detalleBoleta.groupBy({
      by: ['eventoEntradaId'],
      _sum: { cantidad: true },
    });

    const eventoEntradas = await this.prisma.eventoEntrada.findMany({
      where: { categoriaEntradaId: { in: categories.map((c) => c.id) } },
      select: { id: true, categoriaEntradaId: true },
    });

    const entradaToCategory = new Map(eventoEntradas.map((e) => [e.id, e.categoriaEntradaId]));
    const soldByCategory = new Map<number, number>();
    for (const g of soldGroups) {
      const catId = entradaToCategory.get(g.eventoEntradaId);
      if (catId !== undefined) {
        soldByCategory.set(catId, (soldByCategory.get(catId) ?? 0) + (g._sum.cantidad ?? 0));
      }
    }

    return categories.map((cat) => ({ ...cat, soldCount: soldByCategory.get(cat.id) ?? 0 }));
  }

  softDeleteById(id: number): Promise<CategoriaEntrada> {
    return this.prisma.categoriaEntrada.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
