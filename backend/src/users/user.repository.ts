import { Injectable } from '@nestjs/common';
import { TipoUsuario } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  findManyNonAdminOrderedByCreatedDesc() {
    return this.prisma.usuario.findMany({
      where: { tipo: { not: TipoUsuario.ADMINISTRADOR } },
      select: {
        id: true,
        nombre: true,
        apellido: true,
        correo: true,
        username: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
