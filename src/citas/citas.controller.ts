import { Body, Controller, Patch, Post } from '@nestjs/common';
import { ActualizarEstadoChatbotDto } from './dto/actualizar-estado-chatbot.dto';
import { FiltroFechasDto } from './dto/filtro-fechas.dto';
import { CitasService } from './citas.service';

@Controller('citas')
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
