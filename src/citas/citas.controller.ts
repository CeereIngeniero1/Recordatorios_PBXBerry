import { Body, Controller, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ActualizarEstadoChatbotDto } from './dto/actualizar-estado-chatbot.dto';
import { FiltroFechasDto } from './dto/filtro-fechas.dto';
import { CitasService } from './citas.service';

@Controller('citas')
@UseGuards(JwtAuthGuard)
export class CitasController {
  constructor(private readonly citasService: CitasService) {}

  @Post('confirmacion')
  async getConfirmacionCitas(@Body() body: FiltroFechasDto = {}) {
    const filtros = body;
    return this.citasService.obtenerConfirmacionCitas(filtros);
  }

  @Post('cancelacion')
  async getCancelacionCitas(@Body() body: FiltroFechasDto = {}) {
    const filtros = body;
    return this.citasService.obtenerCancelacionCitas(filtros);
  }

  @Patch('estado-chatbot')
  async actualizarEstadoChatbot(@Body() body: ActualizarEstadoChatbotDto) {
    return this.citasService.actualizarEstadoChatbot(body);
  }
}
