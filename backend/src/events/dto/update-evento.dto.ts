import { IsString, IsNumber, IsOptional, IsDateString, Min } from 'class-validator';

export class UpdateEventoDto {
  @IsString()
  @IsOptional()
  nombre?: string;

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
  @IsOptional()
  fecha?: string;
}
