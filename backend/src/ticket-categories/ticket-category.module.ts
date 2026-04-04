import { Module } from '@nestjs/common';
import { TicketCategoryService } from './ticket-category.service';
import { TicketCategoryController } from './ticket-category.controller';
import { TicketCategoryRepository } from './ticket-category.repository';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  controllers: [TicketCategoryController],
  providers: [TicketCategoryService, TicketCategoryRepository, PrismaService],
  exports: [TicketCategoryService, TicketCategoryRepository],
})
export class TicketCategoryModule {}
