import { Module } from '@nestjs/common';
import { EventService } from './event.service';
import { EventController } from './event.controller';
import { EventRepository } from './event.repository';
import { EventStatusTask } from './event-status.task';
import { AuthModule } from '../auth/auth.module';
import { CategoryModule } from '../categories/category.module';
import { TicketCategoryModule } from '../ticket-categories/ticket-category.module';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  imports: [AuthModule, CategoryModule, TicketCategoryModule],
  controllers: [EventController],
  providers: [EventService, EventRepository, EventStatusTask, PrismaService],
  exports: [EventService],
})
export class EventModule {}