import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EstadoVenta } from '@prisma/client';
import { Consumer, Kafka } from 'kafkajs';
import {
  PURCHASE_RESULTS_TOPIC,
  type PurchaseResultMessage,
} from '../kafka/kafka.producer.service';
import { CacheService } from '../shared/cache.service';
import { CACHE_KEYS } from '../shared/constants';
import { TicketRepository } from './ticket.repository';

@Injectable()
export class TicketConsumerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(TicketConsumerService.name);
  private consumer: Consumer;

  constructor(
    private readonly ticketRepository: TicketRepository,
    private readonly cacheService: CacheService,
    private readonly config: ConfigService,
  ) {
    const brokers = config
      .get<string>('KAFKA_BROKERS', 'localhost:9092')
      .split(',')
      .map((b) => b.trim());

    const kafka = new Kafka({ clientId: 'events-results-consumer', brokers });
    this.consumer = kafka.consumer({ groupId: 'purchase-results-group' });
  }

  async onModuleInit() {
    await this.consumer.connect();
    await this.consumer.subscribe({ topic: PURCHASE_RESULTS_TOPIC, fromBeginning: false });
    await this.consumer.run({
      eachMessage: async ({ message }) => {
        if (!message.value) return;
        const data: PurchaseResultMessage = JSON.parse(message.value.toString());
        await this.handleResult(data);
      },
    });
    this.logger.log(`Kafka consumer listening on topic: ${PURCHASE_RESULTS_TOPIC}`);
  }

  async onModuleDestroy() {
    await this.consumer.disconnect();
  }

  private async handleResult(data: PurchaseResultMessage) {
    const { ventaId, status, items, reason } = data;
    this.logger.log(`Purchase result received → ventaId=${ventaId} status=${status}`);

    if (status === 'paid' && items?.length) {
      try {
        for (const item of items) {
          await this.ticketRepository.decrementAvailable(item.eventEntryId, item.quantity);
        }

        const total = items.reduce((sum, i) => sum + i.subtotal, 0);
        await this.ticketRepository.completeVenta(ventaId, total, items);
        this.cacheService.invalidate(CACHE_KEYS.TOP_SELLING_EVENTS);
        this.logger.log(`Venta ${ventaId} → COMPLETADA (total: ${total})`);
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Error al completar venta';
        this.logger.error(`Error completing ventaId=${ventaId}: ${msg}`);
        await this.ticketRepository.failVenta(ventaId, msg);
      }
    } else {
      await this.ticketRepository.failVenta(ventaId, reason ?? 'Pago rechazado');
      this.logger.warn(`Venta ${ventaId} → FALLIDA: ${reason}`);
    }
  }
}
