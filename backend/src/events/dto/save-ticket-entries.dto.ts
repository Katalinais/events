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
  ticketCategoryId: number;

  @IsInt()
  @Min(1)
  totalQuantity: number;

  @IsNumber()
  @Min(0)
  price: number;
}

export class SaveTicketEntriesDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TicketEntryItemDto)
  entries: TicketEntryItemDto[];
}
