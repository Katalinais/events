import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class AdminRoleGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request & { user?: { role?: string } }>();
    if (req.user?.role !== 'ADMINISTRADOR') {
      throw new ForbiddenException('Administrators only');
    }
    return true;
  }
}