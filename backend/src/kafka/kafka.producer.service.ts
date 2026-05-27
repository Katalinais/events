import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Kafka, Producer } from 'kafkajs';

export const PURCHASE_REQUEST_TOPIC = 'queue';
export const PURCHASE_RESULTS_TOPIC = 'purchase-results';

export interface PurchaseRequestMessage {
  action: 'pay';
  ventaId: number;
  userId: string;
  ticketId: string;
  empresa_id: string;
  amount: number;
  card_number: string;
  expiry_month: number;
  expiry_year: number;
  cvv: string;
  network?: string;
  items: { eventEntryId: number; quantity: number; unitPrice: number; subtotal: number }[];
}

export interface PurchaseResultMessage {
  ventaId: number;
  userId: string;
  status: 'paid' | 'rejected';
  items?: { eventEntryId: number; quantity: number; unitPrice: number; subtotal: number }[];
  reason?: string;
}

@Injectable()
export class KafkaProducerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(KafkaProducerService.name);
  private producer: Producer;

  constructor(private readonly config: ConfigService) {
    const brokers = config
      .get<string>('KAFKA_BROKERS', 'localhost:9092')
      .split(',')
      .map((b) => b.trim());

    const kafka = new Kafka({ clientId: 'events-backend', brokers });
    this.producer = kafka.producer();
  }

  async onModuleInit() {
    await this.producer.connect();
    this.logger.log('Kafka producer connected');
  }

  async onModuleDestroy() {
    await this.producer.disconnect();
  }

  async publishPurchaseRequest(message: PurchaseRequestMessage): Promise<void> {
    await this.producer.send({
      topic: PURCHASE_REQUEST_TOPIC,
      messages: [{ key: String(message.ventaId), value: JSON.stringify(message) }],
    });
    this.logger.log(`Purchase request published → ventaId=${message.ventaId} topic=${PURCHASE_REQUEST_TOPIC}`);
  }
}
