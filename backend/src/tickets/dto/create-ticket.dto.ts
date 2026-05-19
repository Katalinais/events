import { IsArray, IsInt, IsString, Matches, Max, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class TicketItemDto {
  @IsInt()
  eventEntryId: number;

  @IsInt()
  @Min(1)
  quantity: number;
}

export class PaymentCardDto {
  @IsString()
  @Matches(/^\d{16}$/, { message: 'Card number must be 16 digits' })
  card_number: string;

  @IsInt({ message: 'El mes de vencimiento debe ser un número entero' })
  @Min(1, { message: 'El mes de vencimiento no es válido' })
  @Max(12, { message: 'El mes de vencimiento no es válido' })
  expiry_month: number;

  @IsInt({ message: 'El año de vencimiento debe ser un número entero' })
  @Min(2024, { message: 'El año de vencimiento no es válido' })
  expiry_year: number;

  @IsString()
  @Matches(/^\d{3,4}$/, { message: 'CVV must be 3 or 4 digits' })
  cvv: string;

  @IsString()
  network: string;
}

export class CreateTicketDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TicketItemDto)
  items: TicketItemDto[];

  @ValidateNested()
  @Type(() => PaymentCardDto)
  payment: PaymentCardDto;
}
