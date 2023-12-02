import { PartialType } from '@nestjs/swagger';
import { CreateSaleDeleteDto } from './create-sale-delete.dto';

export class UpdateSaleDeleteDto extends PartialType(CreateSaleDeleteDto) {}
