import { IsArray, IsInt, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class TicketItemDto {
  @IsInt()
  eventEntryId: number;

  @IsInt()
  @Min(1)
  quantity: number;
}

export class CreateTicketDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TicketItemDto)
  items: TicketItemDto[];
}
