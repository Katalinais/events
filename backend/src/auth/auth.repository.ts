import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import type { Prisma, Usuario } from '@prisma/client';

@Injectable()
export class AuthRepository {
  constructor(private readonly prisma: PrismaService) {}

  findUniqueByCorreo(correo: string): Promise<Usuario | null> {
    return this.prisma.usuario.findUnique({
      where: { correo },
    });
  }

  findUniqueByUsername(username: string): Promise<Usuario | null> {
    return this.prisma.usuario.findUnique({
      where: { username },
    });
  }

  create(data: Prisma.UsuarioCreateInput): Promise<Usuario> {
    return this.prisma.usuario.create({ data });
  }
}
