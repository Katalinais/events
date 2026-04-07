import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';

export class CreateTicketCategoryDto {
  @IsString()
  @IsNotEmpty({ message: 'Name is required' })
  @MaxLength(100)
  name: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  description?: string;
}
