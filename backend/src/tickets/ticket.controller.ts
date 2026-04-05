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

  @Get('total-earnings')
  async getTotalEarnings() {
    const total = await this.ticketService.getTotalEarnings();
    return { total };
  }

  @Get('my')
  findMyTickets(@Req() req: Request & { user?: { userId: number } }) {
    const userId = req.user?.userId;
    if (userId == null) {
      throw new BadRequestException('Debes iniciar sesión para ver tus compras');
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
      throw new BadRequestException('Debes iniciar sesión para descargar el PDF');
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