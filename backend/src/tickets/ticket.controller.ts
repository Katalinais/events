import {
  Controller,
  Post,
  Get,
  Param,
  ParseIntPipe,
  Body,
  UseGuards,
  Req,
  Res,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { TicketService } from './ticket.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TICKET_MESSAGES } from '../shared/messages';

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
      throw new BadRequestException(TICKET_MESSAGES.LOGIN_REQUIRED_PURCHASE);
    }
    return this.ticketService.create(userId, createTicketDto);
  }

  @Get('total-earnings')
  async getTotalEarnings() {
    const total = await this.ticketService.getTotalEarnings();
    return { total };
  }

  @Get('my')
  findMyTickets(@Req() req: Request & { user?: { userId: number } }) {
    const userId = req.user?.userId;
    if (userId == null) {
      throw new BadRequestException(TICKET_MESSAGES.LOGIN_REQUIRED_MY_TICKETS);
    }
    return this.ticketService.findByUser(userId);
  }

  @Get(':id/pdf')
  async downloadPdf(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request & { user?: { userId: number } },
    @Res() res: Response,
  ) {
    const userId = req.user?.userId;
    if (userId == null) {
      throw new BadRequestException(TICKET_MESSAGES.LOGIN_REQUIRED_PDF);
    }
    const buffer = await this.ticketService.generatePdf(id, userId);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="boletas-${id}.pdf"`,
      'Content-Length': buffer.length,
    });
    res.end(buffer);
  }
}
