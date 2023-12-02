import { Module } from '@nestjs/common';
import { PainterController } from './painter.controller';
import { PainterService } from './painter.service';
import { HelperService } from 'src/core/helper.services';

@Module({
  controllers: [PainterController],
  providers: [PainterService, HelperService]
})
export class PainterModule {}
