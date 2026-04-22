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
import { CreateTicketCategoryDto } from './dto/create-ticket-category.dto';
import { UpdateTicketCategoryDto } from './dto/update-ticket-category.dto';

@Controller('ticket-categories')
export class TicketCategoryController {
  constructor(private readonly ticketCategoryService: TicketCategoryService) {}

  @Get()
  findAll() {
    return this.ticketCategoryService.findAll();
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateTicketCategoryDto) {
    return this.ticketCategoryService.create(dto);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateTicketCategoryDto) {
    return this.ticketCategoryService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.ticketCategoryService.remove(id);
  }
}
