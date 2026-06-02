import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';
import { traceContext } from './trace.context';

@Injectable()
export class TraceMiddleware implements NestMiddleware {
  use(req: Request, _res: Response, next: NextFunction) {
    const traceId = (req.headers['x-trace-id'] as string) ?? randomUUID();
    traceContext.run({ traceId }, () => next());
  }
}
