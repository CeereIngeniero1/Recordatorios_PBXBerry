import { BadRequestException, Body, Controller, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FiltroFechasDto } from './dto/filtro-fechas.dto';
import { CitasService } from './citas.service';

@Controller('citas')
@UseGuards(JwtAuthGuard)
export class CitasController {
  constructor(private readonly citasService: CitasService) {}

  @Post('confirmacion')
  async getConfirmacionCitas(@Body() body: FiltroFechasDto) {
    const filtros = body ?? {};
    this.validarFormatoFecha(filtros.fechaIni, 'fechaIni');
    this.validarFormatoFecha(filtros.fechaFin, 'fechaFin');
    return this.citasService.obtenerConfirmacionCitas(filtros);
  }

  @Post('cancelacion')
  async getCancelacionCitas(@Body() body: FiltroFechasDto) {
    const filtros = body ?? {};
    this.validarFormatoFecha(filtros.fechaIni, 'fechaIni');
    this.validarFormatoFecha(filtros.fechaFin, 'fechaFin');
    return this.citasService.obtenerCancelacionCitas(filtros);
  }

  private validarFormatoFecha(value: string | undefined, nombreCampo: string): void {
    if (!value) return;
    const formatoValido = /^\d{4}-\d{2}-\d{2}$/.test(value);
    if (!formatoValido) {
      throw new BadRequestException(
        `El parametro ${nombreCampo} debe tener formato YYYY-MM-DD.`,
      );
    }
  }
}
