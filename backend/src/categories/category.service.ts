import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { UpdateCategoriaDto } from './dto/update-categoria.dto';
import { CategoryRepository } from './category.repository';

@Injectable()
export class CategoryService {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async create(createCategoriaDto: CreateCategoriaDto) {
    const nombre = createCategoriaDto.nombre.trim();
    const existing = await this.categoryRepository.findActiveByNombreInsensitive(nombre);
    if (existing) {
      throw new ConflictException('Ya existe una categoría con ese nombre');
    }
    return this.categoryRepository.create(nombre);
  }

  async findAll() {
    return this.categoryRepository.findAllActive();
  }

  async findOne(id: number) {
    const categoria = await this.categoryRepository.findFirstActiveById(id);
    if (!categoria) {
      throw new NotFoundException(`Categoría con ID ${id} no encontrada`);
    }
    return categoria;
  }

  async update(id: number, updateCategoriaDto: UpdateCategoriaDto) {
    await this.findOne(id);
    if (updateCategoriaDto.nombre !== undefined) {
      const nombre = updateCategoriaDto.nombre.trim();
      const existing = await this.categoryRepository.findOtherActiveByNombreInsensitive(
        nombre,
        id,
      );
      if (existing) {
        throw new ConflictException('Ya existe una categoría con ese nombre');
      }
      return this.categoryRepository.update(id, { nombre });
    }
    return this.categoryRepository.update(id, {});
  }

  async remove(id: number) {
    await this.findOne(id);
    const eventsWithCategory = await this.categoryRepository.countActiveEventsByCategoriaId(id);
    if (eventsWithCategory > 0) {
      throw new ConflictException('No se puede eliminar: tiene eventos asociados');
    }
    return this.categoryRepository.softDeleteById(id);
  }
}
