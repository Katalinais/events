import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { TicketCategoryService } from './ticket-category.service';
import { CreateCategoriaEntradaDto } from './dto/create-categoria-entrada.dto';
import { UpdateCategoriaEntradaDto } from './dto/update-categoria-entrada.dto';

@Controller('ticket-categories')
export class TicketCategoryController {
  constructor(private readonly ticketCategoryService: TicketCategoryService) {}

  @Get()
  findAll() {
    return this.ticketCategoryService.findAll();
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateCategoriaEntradaDto) {
    return this.ticketCategoryService.create(dto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCategoriaEntradaDto,
  ) {
    return this.ticketCategoryService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.ticketCategoryService.remove(id);
  }
}
