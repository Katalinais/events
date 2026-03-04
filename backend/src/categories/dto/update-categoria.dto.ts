import { IsString, IsOptional, IsNotEmpty, MaxLength } from 'class-validator';

export class UpdateCategoriaDto {
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  @MaxLength(100)
  nombre?: string;
}
