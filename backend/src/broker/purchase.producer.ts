import { Injectable, OnModuleDestroy, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Kafka, Producer } from 'kafkajs';

export interface PurchaseEventPayload {
  type: 'success' | 'error';
  text: string;
  userId: number;
}

@Injectable()
export class PurchaseProducer implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PurchaseProducer.name);
  private readonly producer: Producer;

  constructor(private readonly config: ConfigService) {
    const kafka = new Kafka({
      clientId: 'events-backend',
      brokers: [this.config.get<string>('KAFKA_BROKERS', 'localhost:9092')],
    });
    this.producer = kafka.producer();
  }

  async onModuleInit() {
    await this.producer.connect();
    this.logger.log('Kafka producer connected');
  }

  async onModuleDestroy() {
    await this.producer.disconnect();
  }

  async publishPurchaseEvent(payload: PurchaseEventPayload): Promise<void> {
    await this.producer.send({
      topic: 'purchase.events',
      messages: [
        {
          key: String(payload.userId),
          value: JSON.stringify(payload),
        },
      ],
    });
    this.logger.log(`Published purchase event [${payload.type}] for user ${payload.userId}`);
  }
}
