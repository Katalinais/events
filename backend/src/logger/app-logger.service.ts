import { Injectable, LoggerService } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as winston from 'winston';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const LokiTransport = require('winston-loki');
import { getTraceId } from './trace.context';

const SENSITIVE_KEYS = ['password', 'token', 'card_number', 'cvv', 'expiry', 'authorization'];

function sanitize(meta: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(meta).map(([k, v]) => [
      k,
      SENSITIVE_KEYS.some((s) => k.toLowerCase().includes(s)) ? '[REDACTED]' : v,
    ]),
  );
}

@Injectable()
export class AppLogger implements LoggerService {
  private readonly logger: winston.Logger;

  constructor(config: ConfigService) {
    const lokiUrl = config.get<string>('LOKI_URL', 'http://localhost:3100');
    const service = config.get<string>('SERVICE_NAME', 'events-backend');

    const jsonFormat = winston.format.combine(
      winston.format.timestamp(),
      winston.format.errors({ stack: true }),
      winston.format.printf(({ timestamp, level, message, context, traceId, ...meta }) => {
        return JSON.stringify({
          timestamp,
          level,
          service,
          traceId: traceId ?? getTraceId(),
          context,
          msg: message,
          ...(Object.keys(meta).length ? sanitize(meta as Record<string, unknown>) : {}),
        });
      }),
    );

    this.logger = winston.createLogger({
      level: config.get<string>('LOG_LEVEL', 'info'),
      transports: [
        new winston.transports.Console({ format: jsonFormat }),
        new LokiTransport({
          host: lokiUrl,
          labels: { service },
          onConnectionError: (err: Error) => console.error('[Loki] Connection error:', err.message),
        }),
      ],
    });
  }

  log(message: string, context?: string) {
    this.logger.info(message, { context, traceId: getTraceId() });
  }

  error(message: string, trace?: string, context?: string) {
    this.logger.error(message, { context, traceId: getTraceId(), trace });
  }

  warn(message: string, context?: string) {
    this.logger.warn(message, { context, traceId: getTraceId() });
  }

  debug(message: string, context?: string) {
    this.logger.debug(message, { context, traceId: getTraceId() });
  }

  info(message: string, meta?: Record<string, unknown>) {
    this.logger.info(message, { traceId: getTraceId(), ...meta });
  }
}
