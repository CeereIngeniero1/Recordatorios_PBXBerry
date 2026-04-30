import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from './auth.service';

type RequestWithUser = Request & { user?: unknown };

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const authHeader = request.headers.authorization;
    const token = this.extractBearerToken(authHeader);
    if (!token) {
      throw new UnauthorizedException('Token JWT requerido.');
    }

    try {
      request.user = await this.authService.verifyToken(token);
      return true;
    } catch {
      throw new UnauthorizedException('Token JWT invalido o expirado.');
    }
  }

  private extractBearerToken(authHeader?: string): string | null {
    if (!authHeader) return null;
    const [type, token] = authHeader.split(' ');
    if (type !== 'Bearer' || !token) return null;
    return token;
  }
}
