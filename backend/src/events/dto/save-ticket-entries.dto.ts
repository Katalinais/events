import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsNumber,
  Min,
  ValidateNested,
} from 'class-validator';

export class TicketEntryItemDto {
  @IsInt()
  categoriaEntradaId: number;

  @IsInt()
  @Min(1)
  cantidadTotal: number;

  @IsNumber()
  @Min(0)
  precio: number;
}

export class SaveTicketEntriesDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TicketEntryItemDto)
  entradas: TicketEntryItemDto[];
}
