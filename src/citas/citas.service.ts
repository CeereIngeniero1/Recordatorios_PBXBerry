import { Injectable } from '@nestjs/common';
import { Date } from 'mssql';
import { DatabaseService } from '../database/database.service';
import { FiltroFechasDto } from './dto/filtro-fechas.dto';

@Injectable()
export class CitasService {
  constructor(private readonly databaseService: DatabaseService) {}

  async obtenerConfirmacionCitas(filtros: FiltroFechasDto) {
    return this.obtenerCitasPorVista('[dbo].[Cnsta Confirmación de Citas]', filtros);
  }

  async obtenerCancelacionCitas(filtros: FiltroFechasDto) {
    return this.obtenerCitasPorVista('[dbo].[Cnsta Cancelacion de Citas]', filtros);
  }

  private async obtenerCitasPorVista(vista: string, filtros: FiltroFechasDto) {
    const pool = this.databaseService.getPool();
    const request = pool.request();
    const conditions: string[] = [];

    if (filtros.fechaIni) {
      request.input('fechaIni', Date, filtros.fechaIni);
      conditions.push('CAST([appointment_date] AS DATE) >= @fechaIni');
    }
    if (filtros.fechaFin) {
      request.input('fechaFin', Date, filtros.fechaFin);
      conditions.push('CAST([appointment_date] AS DATE) <= @fechaFin');
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
  }
}
