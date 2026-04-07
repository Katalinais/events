import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { CreateTicketCategoryDto } from './dto/create-ticket-category.dto';
import { UpdateTicketCategoryDto } from './dto/update-ticket-category.dto';
import { TicketCategoryRepository } from './ticket-category.repository';

@Injectable()
export class TicketCategoryService {
  constructor(private readonly ticketCategoryRepository: TicketCategoryRepository) {}

  async create(dto: CreateTicketCategoryDto) {
    const name = dto.name.trim();
    const existing = await this.ticketCategoryRepository.findActiveByNameInsensitive(name);
    if (existing) {
      throw new ConflictException('A ticket category with that name already exists');
    }
    return this.ticketCategoryRepository.create({ nombre: name, descripcion: dto.description });
  }

  async findAll() {
    return this.ticketCategoryRepository.findAllActiveWithSoldCount();
  }

  async findOne(id: number) {
    const category = await this.ticketCategoryRepository.findFirstActiveById(id);
    if (!category) {
      throw new NotFoundException(`Ticket category with ID ${id} not found`);
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
        throw new ConflictException('A ticket category with that name already exists');
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
      throw new ConflictException(
        `Cannot delete this category because ${soldCount} ${soldCount === 1 ? 'ticket has' : 'tickets have'} already been sold`,
      );
    }
    return this.ticketCategoryRepository.softDeleteById(id);
  }
}
