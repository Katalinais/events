import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { CreateTicketCategoryDto } from './dto/create-ticket-category.dto';
import { UpdateTicketCategoryDto } from './dto/update-ticket-category.dto';
import { TicketCategoryRepository } from './ticket-category.repository';
import { TICKET_CATEGORY_MESSAGES } from '../shared/messages';

@Injectable()
export class TicketCategoryService {
  constructor(private readonly ticketCategoryRepository: TicketCategoryRepository) {}

  async create(dto: CreateTicketCategoryDto) {
    const name = dto.name.trim();
    const existing = await this.ticketCategoryRepository.findActiveByNameInsensitive(name);
    if (existing) {
      throw new ConflictException(TICKET_CATEGORY_MESSAGES.NAME_ALREADY_EXISTS);
    }
    return this.ticketCategoryRepository.create({ nombre: name, descripcion: dto.description });
  }

  async findAll() {
    return this.ticketCategoryRepository.findAllActiveWithSoldCount();
  }

  async findOne(id: number) {
    const category = await this.ticketCategoryRepository.findFirstActiveById(id);
    if (!category) {
      throw new NotFoundException(TICKET_CATEGORY_MESSAGES.NOT_FOUND(id));
    }
    return category;
  }

  async update(id: number, dto: UpdateTicketCategoryDto) {
    await this.findOne(id);
    const data: { nombre?: string; descripcion?: string } = {};
    if (dto.name !== undefined) {
      const name = dto.name.trim();
      const existing = await this.ticketCategoryRepository.findOtherActiveByNameInsensitive(
        name,
        id,
      );
      if (existing) {
        throw new ConflictException(TICKET_CATEGORY_MESSAGES.NAME_ALREADY_EXISTS);
      }
      data.nombre = name;
    }
    if (dto.description !== undefined) {
      data.descripcion = dto.description;
    }
    return this.ticketCategoryRepository.update(id, data);
  }

  async remove(id: number) {
    await this.findOne(id);
    const soldCount = await this.ticketCategoryRepository.countSoldTicketsByCategoryId(id);
    if (soldCount > 0) {
      throw new ConflictException(TICKET_CATEGORY_MESSAGES.CANNOT_DELETE_SOLD(soldCount));
    }
    return this.ticketCategoryRepository.softDeleteById(id);
  }
}
