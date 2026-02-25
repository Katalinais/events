import { IsString, IsNotEmpty, IsNumber, IsOptional, IsDateString, Min } from 'class-validator';

export class CreateEventoDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  precio?: number;

  @IsString()
  @IsOptional()
  urlImagen?: string;

  @IsDateString()
  fecha: string;

  @IsNumber()
  @IsOptional()
  categoriaId?: number;
}
