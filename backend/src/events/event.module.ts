import { Module } from '@nestjs/common';
import { EventService } from './event.service';
import { EventController } from './event.controller';
import { EventRepository } from './event.repository';
import { AuthModule } from '../auth/auth.module';
import { CategoryModule } from '../categories/category.module';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  imports: [AuthModule, CategoryModule],
  controllers: [EventController],
  providers: [EventService, EventRepository, PrismaService],
  exports: [EventService],
})
export class EventModule {}
