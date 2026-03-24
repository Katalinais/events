import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class AdminRoleGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request & { user?: { tipo?: string } }>();
    if (req.user?.tipo !== 'ADMINISTRADOR') {
      throw new ForbiddenException('Solo administradores');
    }
    return true;
  }
}
