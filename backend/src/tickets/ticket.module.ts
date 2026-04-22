import { Module } from '@nestjs/common';
import { TicketService } from './ticket.service';
import { TicketController } from './ticket.controller';
import { TicketRepository } from './ticket.repository';
import { AuthModule } from '../auth/auth.module';
import { EventModule } from '../events/event.module';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  imports: [AuthModule, EventModule],
  controllers: [TicketController],
  providers: [TicketService, TicketRepository, PrismaService],
  exports: [TicketService],
})
export class TicketModule {}
