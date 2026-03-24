import { Injectable } from '@nestjs/common';
import { TipoUsuario } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const rows = await this.prisma.usuario.findMany({
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
    return rows.map((u) => ({
      ...u,
      createdAt: u.createdAt.toISOString(),
    }));
  }

}

