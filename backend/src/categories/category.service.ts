import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryRepository } from './category.repository';

@Injectable()
export class CategoryService {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async create(dto: CreateCategoryDto) {
    const name = dto.name.trim();
    const existing = await this.categoryRepository.findActiveByNameInsensitive(name);
    if (existing) {
      throw new ConflictException('A category with this name already exists');
    }
    return this.categoryRepository.create(name);
  }

  async findAll() {
    return this.categoryRepository.findAllActive();
  }

  async findOne(id: number) {
    const category = await this.categoryRepository.findFirstActiveById(id);
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    return category;
  }

  async update(id: number, dto: UpdateCategoryDto) {
    await this.findOne(id);
    if (dto.name !== undefined) {
      const name = dto.name.trim();
      const existing = await this.categoryRepository.findOtherActiveByNameInsensitive(name, id);
      if (existing) {
        throw new ConflictException('A category with this name already exists');
      }
      return this.categoryRepository.update(id, { name });
    }
    return this.categoryRepository.update(id, {});
  }

  async remove(id: number) {
    await this.findOne(id);
    const eventsWithCategory = await this.categoryRepository.countActiveEventsByCategoryId(id);
    if (eventsWithCategory > 0) {
      throw new ConflictException('Cannot delete: this category has associated events');
    }
    return this.categoryRepository.softDeleteById(id);
  }
}