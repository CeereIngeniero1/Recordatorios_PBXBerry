import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConnectionPool, config as SqlConfig } from 'mssql';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DatabaseService.name);
  private pool: ConnectionPool | null = null;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit(): Promise<void> {
    const dbConfig = this.buildSqlConfig();
    this.pool = await new ConnectionPool(dbConfig).connect();
    this.logger.log('Conexion a SQL Server establecida correctamente.');
  }

  async onModuleDestroy(): Promise<void> {
    if (!this.pool) return;
    await this.pool.close();
    this.logger.log('Conexion a SQL Server cerrada.');
  }

  getPool(): ConnectionPool {
    if (!this.pool) {
      throw new Error('La conexion a base de datos aun no esta disponible.');
    }
    return this.pool;
  }

  private buildSqlConfig(): SqlConfig {
    const server = this.getRequiredValue('DB_SERVER');
    const database = this.getRequiredValue('DB_DATABASE');
    const user = this.getRequiredValue('DB_USER');
    const password = this.getRequiredValue('DB_PASSWORD');
    const port = Number(this.configService.get<string>('DB_PORT') ?? 1433);
    const encrypt = (this.configService.get<string>('DB_ENCRYPT') ?? 'false') === 'true';
    const trustServerCertificate =
      (this.configService.get<string>('DB_TRUST_CERT') ?? 'true') === 'true';

    return {
      server,
      database,
      user,
      password,
      port,
      options: {
        encrypt,
        trustServerCertificate,
      },
    };
  }

  private getRequiredValue(key: string): string {
    const value = this.configService.get<string>(key);
    if (!value) {
      throw new Error(`La variable de entorno ${key} es obligatoria.`);
    }
    return value;
  }
}
