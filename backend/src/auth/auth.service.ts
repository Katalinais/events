import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(
    firstName: string,
    lastName: string | undefined,
    email: string | undefined,
    username: string,
    password: string,
  ) {
    const normalizedEmail = email?.trim().toLowerCase() || null;
    if (normalizedEmail) {
      const existingByEmail = await this.prisma.usuario.findUnique({
        where: { correo: normalizedEmail },
      });
      if (existingByEmail) {
        throw new ConflictException('An account with this email already exists');
      }
    }
    const trimmedUsername = username.trim();
    const existingByUsername = await this.prisma.usuario.findFirst({
      where: { username: trimmedUsername },
    });
    if (existingByUsername) {
      throw new ConflictException('This username is already taken');
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.prisma.usuario.create({
      data: {
        nombre: firstName.trim(),
        apellido: lastName?.trim() || null,
        correo: normalizedEmail,
        username: trimmedUsername,
        password: hashedPassword,
        tipo: 'EXTERNO',
      },
    });
    const payload = { sub: user.id, correo: user.correo ?? '', tipo: user.tipo };
    return {
      access_token: this.jwtService.sign(payload),
      usuario: {
        id: user.id,
        nombre: user.nombre,
        correo: user.correo,
        tipo: user.tipo,
      },
    };
  }

  async login(username: string, password: string) {
    const trimmedUsername = username.trim();
    const usuario = await this.prisma.usuario.findFirst({
      where: { username: trimmedUsername },
    });
    if (!usuario || !usuario.password) {
      throw new UnauthorizedException('Usuario o contraseña incorrectos');
    }
    const valid = await bcrypt.compare(password, usuario.password);
    if (!valid) {
      throw new UnauthorizedException('Usuario o contraseña incorrectos');
    }
    const payload = { sub: usuario.id, correo: usuario.correo, tipo: usuario.tipo };
    return {
      access_token: this.jwtService.sign(payload),
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        correo: usuario.correo,
        tipo: usuario.tipo,
      },
    };
  }
}
