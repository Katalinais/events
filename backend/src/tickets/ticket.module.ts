import { Module } from '@nestjs/common';
import { TicketService } from './ticket.service';
import { TicketController } from './ticket.controller';
import { TicketRepository } from './ticket.repository';
import { TicketConsumerService } from './ticket.consumer.service';
import { AuthModule } from '../auth/auth.module';
import { EventModule } from '../events/event.module';
import { KafkaModule } from '../kafka/kafka.module';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  imports: [AuthModule, EventModule, KafkaModule],
  controllers: [TicketController],
  providers: [TicketService, TicketRepository, TicketConsumerService, PrismaService],
  exports: [TicketService],
})
export class TicketModule {}
