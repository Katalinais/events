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
import { diskStorage } from 'multer';
import { extname } from 'path';
import { EventService } from './event.service';
import { CreateEventoDto } from './dto/create-evento.dto';
import { UpdateEventoDto } from './dto/update-evento.dto';
import { SaveTicketEntriesDto } from './dto/save-ticket-entries.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

const IMAGE_MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIMES = /\.(jpe?g|png|gif|webp)$/i;

@Controller('events')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Post('upload-image')
  @UseInterceptors(
    FileInterceptor('imagen', {
      limits: { fileSize: IMAGE_MAX_SIZE },
      fileFilter: (_req, file, cb) => {
        const ext = extname(file.originalname).toLowerCase();
        if (!ALLOWED_MIMES.test(ext) && !file.mimetype?.match(/\/(jpeg|jpg|png|gif|webp)$/)) {
          cb(new BadRequestException('Solo se permiten imágenes (JPEG, PNG, GIF, WebP)'), false);
          return;
        }
        cb(null, true);
      },
      storage: diskStorage({
        destination: './uploads',
        filename: (_req, file, cb) => {
          const ext = extname(file.originalname) || '.jpg';
          cb(null, `evento-${Date.now()}${ext}`);
        },
      }),
    }),
  )
  uploadImagen(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No se envió ninguna imagen');
    }
    return { url: `/uploads/${file.filename}` };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createEventoDto: CreateEventoDto) {
    return this.eventService.create(createEventoDto);
  }

  @Get()
  findAll() {
    return this.eventService.findAll();
  }

  @Get('favorites')
  @UseGuards(JwtAuthGuard)
  findFavorites(@Req() req: Request & { user?: { userId: number } }) {
    const userId = req.user?.userId;
    if (userId == null) {
      throw new BadRequestException('Debes iniciar sesión para ver tus favoritos');
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
      throw new BadRequestException('Debes iniciar sesión para marcar interés');
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
      throw new BadRequestException('Debes iniciar sesión para quitar de favoritos');
    }
    return this.eventService.unmarkInterested(id, userId);
  }

  @Get(':id/entradas')
  findEntradas(@Param('id', ParseIntPipe) id: number) {
    return this.eventService.findEntradas(id);
  }

  @Post(':id/entradas')
  @HttpCode(HttpStatus.OK)
  saveEntradas(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: SaveTicketEntriesDto,
  ) {
    return this.eventService.saveEntradas(id, dto.entradas);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.eventService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateEventoDto: UpdateEventoDto,
  ) {
    return this.eventService.update(id, updateEventoDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.eventService.remove(id);
  }
}
