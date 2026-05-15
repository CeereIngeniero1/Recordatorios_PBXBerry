import { IsEnum, IsInt, Min } from 'class-validator';

export enum EstadoChatbotCita {
  PENDIENTE = 'pendiente',
  CONFIRMADA = 'confirmada',
  CANCELADA = 'cancelada',
}

export class ActualizarEstadoChatbotDto {
  @IsInt()
  @Min(1)
  consecutivo: number;

  @IsEnum(EstadoChatbotCita, {
    message: 'estado debe ser pendiente, confirmada o cancelada.',
  })
  estado: EstadoChatbotCita;
}
