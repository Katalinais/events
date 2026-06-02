import { Injectable, OnModuleDestroy, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Kafka, Consumer } from 'kafkajs';
import { SalesGateway } from '../sales/sales.gateway';

interface PurchaseResultMessage {
  type: 'success' | 'error';
  message: string;
  userId: string;
}

@Injectable()
export class PurchaseConsumer implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PurchaseConsumer.name);
  private readonly consumer: Consumer;

  constructor(
    private readonly config: ConfigService,
    private readonly salesGateway: SalesGateway,
  ) {
    const kafka = new Kafka({
      clientId: 'events-backend-consumer',
      brokers: [this.config.get<string>('KAFKA_BROKERS', 'localhost:9092')],
    });
    this.consumer = kafka.consumer({ groupId: 'events-purchase-result' });
  }

  async onModuleInit() {
    await this.consumer.connect();
    await this.consumer.subscribe({ topic: 'messages-out', fromBeginning: false });

    await this.consumer.run({
      eachMessage: async ({ message }) => {
        if (!message.value) return;

        const payload: PurchaseResultMessage = JSON.parse(message.value.toString());
        this.logger.log(`Received purchase result [${payload.type}] for user ${payload.userId}`);

        this.salesGateway.emitToUser(payload.userId, 'purchase:result', {
          type: payload.type,
          message: payload.message,
        });
      },
    });

    this.logger.log('Kafka consumer subscribed to messages-out');
  }

  async onModuleDestroy() {
    await this.consumer.disconnect();
  }
}
