import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Request } from 'express';
import { AUTH_MESSAGES } from '../shared/messages';

@Injectable()
export class AdminRoleGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request & { user?: { role?: string } }>();
    if (req.user?.role !== 'ADMINISTRADOR') {
      throw new ForbiddenException(AUTH_MESSAGES.ADMINS_ONLY);
    }
    return true;
  }
}