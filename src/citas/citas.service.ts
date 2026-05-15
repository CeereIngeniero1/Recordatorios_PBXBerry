import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Date, Int } from 'mssql';
import { DatabaseService } from '../database/database.service';
import {
  ActualizarEstadoChatbotDto,
  EstadoChatbotCita,
} from './dto/actualizar-estado-chatbot.dto';
import { FiltroFechasDto } from './dto/filtro-fechas.dto';

const ESTADO_CHATBOT_POR_CITA: Record<EstadoChatbotCita, number> = {
  [EstadoChatbotCita.PENDIENTE]: 1,
  [EstadoChatbotCita.CONFIRMADA]: 2,
  [EstadoChatbotCita.CANCELADA]: 3,
};

@Injectable()
export class CitasService {
  private readonly logger = new Logger(CitasService.name);

  constructor(private readonly databaseService: DatabaseService) {}

  async obtenerConfirmacionCitas(filtros: FiltroFechasDto) {
    return this.obtenerCitasPorVista('[dbo].[Cnsta Confirmación de Citas]', filtros);
  }

  async obtenerCancelacionCitas(filtros: FiltroFechasDto) {
    return this.obtenerCitasPorVista('[dbo].[Cnsta Cancelacion de Citas]', filtros);
  }

  async actualizarEstadoChatbot(dto: ActualizarEstadoChatbotDto) {
    const idEstadoChatbot = ESTADO_CHATBOT_POR_CITA[dto.estado];

    try {
      const pool = this.databaseService.getPool();
      const result = await pool
        .request()
        .input('consecutivo', Int, dto.consecutivo)
        .input('idEstadoChatbot', Int, idEstadoChatbot)
        .query(`
          UPDATE dbo.CompromisoVI
          SET [Id Estado Chatbot] = @idEstadoChatbot
          WHERE [Id CompromisoVI] = @consecutivo
        `);

      if (result.rowsAffected[0] === 0) {
        throw new NotFoundException(
          `No se encontro la cita con consecutivo ${dto.consecutivo}.`,
        );
      }

      return {
        consecutivo: dto.consecutivo,
        estado: dto.estado,
        idEstadoChatbot,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Error actualizando estado chatbot para consecutivo ${dto.consecutivo}.`,
        error as Error,
      );
      throw new InternalServerErrorException(
        'No fue posible actualizar el estado de la cita.',
      );
    }
  }

  private async obtenerCitasPorVista(vista: string, filtros: FiltroFechasDto) {
    try {
      const pool = this.databaseService.getPool();
      const request = pool.request();
      const conditions: string[] = [];

      if (filtros.fechaIni) {
        request.input('fechaIni', Date, filtros.fechaIni);
        conditions.push('CAST([Fecha Inicio CompromisoVI] AS DATE) >= @fechaIni');
      }
      if (filtros.fechaFin) {
        request.input('fechaFin', Date, filtros.fechaFin);
        conditions.push('CAST([Fecha Inicio CompromisoVI] AS DATE) <= @fechaFin');
      }

      const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
      const result = await request.query(`
        SELECT
          [phone],
          [contacname],
          [consecutivo],
          CONVERT(VARCHAR(16), [appointment_date], 120) AS [appointment_date],
          [vlrcopago],
          [responsible_name],
          [specialty_name],
          [address],
          [send_type]
        FROM ${vista}
        ${whereClause}
        ORDER BY [appointment_date] DESC
      `);
      return result.recordset;
    } catch (error) {
      this.logger.error(`Error consultando vista ${vista}.`, error as Error);
      throw new InternalServerErrorException('No fue posible consultar la informacion de citas.');
    }
  }
}
