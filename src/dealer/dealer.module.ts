import { Module } from '@nestjs/common';
import { DealerController } from './dealer.controller';
import { HelperService } from 'src/core/helper.services';
import { DealerService } from './dealer.service';

@Module({
  controllers: [DealerController],
  providers: [DealerService, HelperService]
})
export class DealerModule {}
