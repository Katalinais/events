import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { EventModule } from './events/event.module';
import { CategoryModule } from './categories/category.module';
import { TicketCategoryModule } from './ticket-categories/ticket-category.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TicketModule } from './tickets/ticket.module';
import { SalesModule } from './sales/sales.module';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ScheduleModule.forRoot(),
    AuthModule,
    EventModule,
    CategoryModule,
    TicketCategoryModule,
    UsersModule,
    TicketModule,
    SalesModule,
  ],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class AppModule {}
