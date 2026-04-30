import { IsOptional, Matches } from 'class-validator';

export class FiltroFechasDto {
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'fechaIni debe tener formato YYYY-MM-DD.',
  })
  fechaIni?: string;

  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'fechaFin debe tener formato YYYY-MM-DD.',
  })
  fechaFin?: string;
}
