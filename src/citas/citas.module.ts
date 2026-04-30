import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { CitasController } from './citas.controller';
import { CitasService } from './citas.service';

@Module({
  imports: [DatabaseModule],
  controllers: [CitasController],
  providers: [CitasService],
})
export class CitasModule {}
