import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { EventRepository } from './event.repository';

@Injectable()
export class EventStatusTask implements OnModuleInit {
  private readonly logger = new Logger(EventStatusTask.name);

  constructor(private readonly eventRepository: EventRepository) {}

  async onModuleInit() {
    this.logger.log('Verificando eventos vencidos al iniciar...');
    await this.markCompletedEvents();
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async markCompletedEvents() {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(23, 59, 59, 999);

    const { count } = await this.eventRepository.markEventsAsCompleted(yesterday);

    if (count > 0) {
      this.logger.log(`${count} evento(s) marcado(s) como COMPLETADO`);
    } else {
      this.logger.debug('Sin eventos para marcar como completados');
    }
  }
}
