import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  UseGuards,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { EventService } from './event.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { SaveTicketEntriesDto } from './dto/save-ticket-entries.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UploadService } from '../upload/upload.service';
import { createImageMulterOptions } from '../upload/upload.config';
import { EVENT_MESSAGES } from '../shared/messages';

@Controller('events')
export class EventController {
  constructor(
    private readonly eventService: EventService,
    private readonly uploadService: UploadService,
  ) {}

  @Post('upload-image')
  @UseInterceptors(FileInterceptor('image', createImageMulterOptions({ prefix: 'event' })))
  uploadImage(@UploadedFile() file: Express.Multer.File) {
    this.uploadService.validateFile(file);
    return this.uploadService.buildFileUrl(file.filename);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createEventDto: CreateEventDto) {
    return this.eventService.create(createEventDto);
  }

  @Get()
  findAll() {
    return this.eventService.findAll();
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard)
  findAllForAdmin() {
    return this.eventService.findAllForAdmin();
  }

  @Get('past')
  findPast() {
    return this.eventService.findCompleted();
  }

  @Get('top-selling')
  findTopSelling() {
    return this.eventService.findTopSelling();
  }

  @Get('sales-summary')
  @UseGuards(JwtAuthGuard)
  getAllEventsSalesSummary() {
    return this.eventService.getAllEventsSalesSummary();
  }

  @Get(':id/sales-report')
  @UseGuards(JwtAuthGuard)
  getTicketSalesReport(@Param('id', ParseIntPipe) id: number) {
    return this.eventService.getTicketSalesReport(id);
  }

  @Get('favorites')
  @UseGuards(JwtAuthGuard)
  findFavorites(@Req() req: Request & { user?: { userId: number } }) {
    const userId = req.user?.userId;
    if (userId == null) {
      throw new BadRequestException(EVENT_MESSAGES.LOGIN_REQUIRED_FAVORITES);
    }
    return this.eventService.findFavoritesByUser(userId);
  }

  @Get('report')
  @UseGuards(JwtAuthGuard)
  findReport() {
    return this.eventService.findReportWithInterestedUsers();
  }

  @Get('upcoming')
  findUpcoming(@Query('limit', new ParseIntPipe({ optional: true })) limit?: number) {
    return this.eventService.findUpcoming(limit);
  }

  @Post(':id/interested')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  markInterested(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request & { user?: { userId: number } },
  ) {
    const userId = req.user?.userId;
    if (userId == null) {
      throw new BadRequestException(EVENT_MESSAGES.LOGIN_REQUIRED_INTEREST);
    }
    return this.eventService.markInterested(id, userId);
  }

  @Delete(':id/interested')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  unmarkInterested(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request & { user?: { userId: number } },
  ) {
    const userId = req.user?.userId;
    if (userId == null) {
      throw new BadRequestException(EVENT_MESSAGES.LOGIN_REQUIRED_UNINTEREST);
    }
    return this.eventService.unmarkInterested(id, userId);
  }

  @Get(':id/ticket-entries')
  findTicketEntries(@Param('id', ParseIntPipe) id: number) {
    return this.eventService.findTicketEntries(id);
  }

  @Post(':id/ticket-entries')
  @HttpCode(HttpStatus.OK)
  saveTicketEntries(@Param('id', ParseIntPipe) id: number, @Body() dto: SaveTicketEntriesDto) {
    return this.eventService.saveTicketEntries(id, dto.entries);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.eventService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateEventDto: UpdateEventDto) {
    return this.eventService.update(id, updateEventDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.eventService.remove(id);
  }
}
