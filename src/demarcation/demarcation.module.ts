import { Module } from '@nestjs/common';
import { DemarcationController } from './demarcation.controller';
import { DemercationService } from './demarcation.service';
import { HelperService } from 'src/core/helper.services';

@Module({
  controllers: [DemarcationController],
  providers: [DemercationService, HelperService]
})
export class DemarcationModule {}
