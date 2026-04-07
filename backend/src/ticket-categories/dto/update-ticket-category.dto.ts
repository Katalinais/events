import { IsString, IsOptional, IsNotEmpty, MaxLength } from 'class-validator';

export class UpdateTicketCategoryDto {
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  @MaxLength(100)
  name?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  description?: string;
}
