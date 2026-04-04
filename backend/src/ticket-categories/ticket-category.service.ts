import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { CreateCategoriaEntradaDto } from './dto/create-categoria-entrada.dto';
import { UpdateCategoriaEntradaDto } from './dto/update-categoria-entrada.dto';
import { TicketCategoryRepository } from './ticket-category.repository';

@Injectable()
export class TicketCategoryService {
  constructor(private readonly ticketCategoryRepository: TicketCategoryRepository) {}

  async create(dto: CreateCategoriaEntradaDto) {
    const nombre = dto.nombre.trim();
    const existing = await this.ticketCategoryRepository.findActiveByNombreInsensitive(nombre);
    if (existing) {
      throw new ConflictException('Ya existe una categoría de boleta con ese nombre');
    }
    return this.ticketCategoryRepository.create({ nombre, descripcion: dto.descripcion });
  }

  async findAll() {
    return this.ticketCategoryRepository.findAllActive();
  }

  async findOne(id: number) {
    const categoria = await this.ticketCategoryRepository.findFirstActiveById(id);
    if (!categoria) {
      throw new NotFoundException(`Categoría de boleta con ID ${id} no encontrada`);
    }
    return categoria;
  }

  async update(id: number, dto: UpdateCategoriaEntradaDto) {
    await this.findOne(id);
    const data: { nombre?: string; descripcion?: string } = {};
    if (dto.nombre !== undefined) {
      const nombre = dto.nombre.trim();
      const existing = await this.ticketCategoryRepository.findOtherActiveByNombreInsensitive(
        nombre,
        id,
      );
      if (existing) {
        throw new ConflictException('Ya existe una categoría de boleta con ese nombre');
      }
      data.nombre = nombre;
    }
    if (dto.descripcion !== undefined) {
      data.descripcion = dto.descripcion;
    }
    return this.ticketCategoryRepository.update(id, data);
  }

  async remove(id: number) {
    await this.findOne(id);
    const inUse = await this.ticketCategoryRepository.countActiveEventoEntradasById(id);
    if (inUse > 0) {
      throw new ConflictException('No se puede eliminar: tiene boletas asociadas');
    }
    return this.ticketCategoryRepository.softDeleteById(id);
  }
}
