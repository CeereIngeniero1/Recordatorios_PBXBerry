import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { DatabaseModule } from '../database/database.module';
import { CitasController } from './citas.controller';
import { CitasService } from './citas.service';

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [CitasController],
  providers: [CitasService],
})
export class CitasModule {}
