import { Module } from '@nestjs/common';
import { TicketService } from './ticket.service';
import { TicketController } from './ticket.controller';
import { TicketRepository } from './ticket.repository';
import { AuthModule } from '../auth/auth.module';
import { EventModule } from '../events/event.module';
import { PrismaService } from '../../prisma/prisma.service';
import { PaymentGatewayService } from '../payment/payment-gateway.service';
import { BrokerModule } from '../broker/broker.module';
import { SalesModule } from '../sales/sales.module';

@Module({
  imports: [AuthModule, EventModule, BrokerModule, SalesModule],
  controllers: [TicketController],
  providers: [TicketService, TicketRepository, PrismaService, PaymentGatewayService],
  exports: [TicketService],
})
export class TicketModule {}
