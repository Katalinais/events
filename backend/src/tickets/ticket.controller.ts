import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { Request } from 'express';
import { TicketService } from './ticket.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('tickets')
@UseGuards(JwtAuthGuard)
export class TicketController {
  constructor(private readonly ticketService: TicketService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body() createTicketDto: CreateTicketDto,
    @Req() req: Request & { user?: { userId: number } },
  ) {
    const userId = req.user?.userId;
    if (userId == null) {
      throw new BadRequestException('Debes iniciar sesión para comprar boletas');
    }
    return this.ticketService.create(userId, createTicketDto);
  }

  @Get('my')
  findMyTickets(@Req() req: Request & { user?: { userId: number } }) {
    const userId = req.user?.userId;
    if (userId == null) {
      throw new BadRequestException('Debes iniciar sesión para ver tus compras');
    }
    return this.ticketService.findByUser(userId);
  }
}
