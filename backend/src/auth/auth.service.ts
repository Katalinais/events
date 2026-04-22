import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { TipoUsuario } from '@prisma/client';
import { AuthRepository } from './auth.repository';
import { AUTH_MESSAGES } from '../shared/messages';

@Injectable()
export class AuthService {
  constructor(
    private readonly authRepository: AuthRepository,
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
      const existingByEmail = await this.authRepository.findUniqueByCorreo(normalizedEmail);
      if (existingByEmail) {
        throw new ConflictException(AUTH_MESSAGES.EMAIL_ALREADY_EXISTS);
      }
    }
    const trimmedUsername = username.trim();
    const existingByUsername = await this.authRepository.findUniqueByUsername(trimmedUsername);
    if (existingByUsername) {
      throw new ConflictException(AUTH_MESSAGES.USERNAME_ALREADY_TAKEN);
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.authRepository.create({
      nombre: firstName.trim(),
      apellido: lastName?.trim() || null,
      correo: normalizedEmail,
      username: trimmedUsername,
      password: hashedPassword,
      tipo: TipoUsuario.EXTERNO,
    });
    const payload = { sub: user.id, email: user.correo ?? '', role: user.tipo };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        name: user.nombre,
        email: user.correo,
        role: user.tipo,
      },
    };
  }

  async login(username: string, password: string) {
    const trimmedUsername = username.trim();
    const user = await this.authRepository.findUniqueByUsername(trimmedUsername);
    if (!user || !user.password) {
      throw new UnauthorizedException(AUTH_MESSAGES.INVALID_CREDENTIALS);
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      throw new UnauthorizedException(AUTH_MESSAGES.INVALID_CREDENTIALS);
    }
    const payload = { sub: user.id, email: user.correo, role: user.tipo };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        name: user.nombre,
        email: user.correo,
        role: user.tipo,
      },
    };
  }
}