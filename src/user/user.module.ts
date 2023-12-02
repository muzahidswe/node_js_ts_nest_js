import { Module } from '@nestjs/common';
import { HelperService } from 'src/core/helper.services';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  controllers: [UserController],
  providers: [UserService, HelperService]
})
export class UserModule {}
