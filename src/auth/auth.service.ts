import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { DatabaseService } from '../database/database.service';
import { LoginDto } from './dto/login.dto';

type UsuarioSql = {
  idContrasena: number;
  documentoEntidad: string;
  nombreUsuario: string;
  idNivel: number;
  idEstado: number;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async login(credentials: LoginDto) {
    const usuario = await this.validarUsuario(credentials.username, credentials.password);
    const payload = {
      sub: usuario.idContrasena,
      username: usuario.nombreUsuario,
      documentoEntidad: usuario.documentoEntidad,
      idNivel: usuario.idNivel,
      idEstado: usuario.idEstado,
    };

    const secret = this.getJwtSecret();
    const expiresIn = this.configService.get<string>('JWT_EXPIRES_IN') ?? '8h';
    const accessToken = await this.jwtService.signAsync(payload, {
      secret,
      expiresIn: expiresIn as never,
    });

    return { access_token: accessToken, user: payload };
  }

  async verifyToken(token: string) {
    const secret = this.getJwtSecret();
    return this.jwtService.verifyAsync(token, { secret });
  }

  private async validarUsuario(username: string, password: string): Promise<UsuarioSql> {
    const pool = this.databaseService.getPool();
    const result = await pool
      .request()
      .input('username', username)
      .input('password', password)
      .query(`
        SELECT TOP (1)
          [Id Contraseña] AS idContrasena,
          [Documento Entidad] AS documentoEntidad,
          [Nombre de Usuario] AS nombreUsuario,
          [Id Nivel] AS idNivel,
          [Id Estado] AS idEstado
        FROM [dbo].[Contraseña]
        WHERE [Nombre de Usuario] = @username
          AND [Contraseña] = @password
          AND [Id Estado] = 7
      `);

    const usuario = result.recordset[0] as UsuarioSql | undefined;
    if (!usuario) {
      throw new UnauthorizedException('Usuario o contraseña invalida.');
    }
    return usuario;
  }

  private getJwtSecret(): string {
    const secret = this.configService.get<string>('JWT_SECRET');
    if (!secret) {
      throw new Error('La variable de entorno JWT_SECRET es obligatoria.');
    }
    return secret;
  }
}
