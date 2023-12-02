import { Module } from '@nestjs/common';
import { HelperService } from 'src/core/helper.services';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';

@Module({
  controllers: [ProductController],
  providers: [ProductService, HelperService]
  
})
export class ProductModule {}
