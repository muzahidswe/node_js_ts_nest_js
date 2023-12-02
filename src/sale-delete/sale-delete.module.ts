import { Module } from '@nestjs/common';
import { SaleDeleteService } from './sale-delete.service';
import { SaleDeleteController } from './sale-delete.controller';
import { HttpModule } from '@nestjs/axios';
@Module({
  imports: [HttpModule],
  controllers: [SaleDeleteController],
  providers: [SaleDeleteService]
})
export class SaleDeleteModule {}
