import { IsString, IsOptional, IsNotEmpty, MaxLength } from 'class-validator';

export class UpdateCategoriaEntradaDto {
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  @MaxLength(100)
  nombre?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  descripcion?: string;
}
