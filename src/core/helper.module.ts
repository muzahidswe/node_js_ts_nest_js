import { Module } from '@nestjs/common';

import { HelperService } from './helper.services';

@Module({
  controllers: [],
  providers: [HelperService]
})
export class HelperModule {}
