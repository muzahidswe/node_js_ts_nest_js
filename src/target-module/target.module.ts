import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { HelperService } from 'src/core/helper.services';
import { TargetController } from './target.controller';
import { TargetService } from './target.service';

@Module({
  imports: [HttpModule],
  controllers: [TargetController],
  providers: [TargetService]
})
export class TargetModule {}
