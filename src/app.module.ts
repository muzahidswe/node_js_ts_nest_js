import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { NestjsKnexModule } from 'nestjs-knexjs';
import { UserController } from './user/user.controller';
import { UserModule } from './user/user.module';
import { UserService } from './user/user.service';
import { DealerController } from './dealer/dealer.controller';
import { DealerModule } from './dealer/dealer.module';
import { DealerService } from './dealer/dealer.service';
import { PainterController } from './painter/painter.controller';
import { PainterModule } from './painter/painter.module';
import { PainterService } from './painter/painter.service';
import { TestModule } from './test/test.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { HelperModule } from './core/helper.module';
import { HelperService } from './core/helper.services';
import { SaleDeleteModule } from './sale-delete/sale-delete.module';
import { TargetModule } from './target-module/target.module';
import { DemarcationModule } from './demarcation/demarcation.module';
import { DemarcationController } from './demarcation/demarcation.controller';
import { DemercationService } from './demarcation/demarcation.service';
import { ProductController } from './product/product.controller';
import { ProductModule } from './product/product.module';
import { ProductService } from './product/product.service';

require('dotenv').config();

@Module({
  imports: [NestjsKnexModule.register({
    client: process.env.DB_CLIENT,
    connection: {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    },
  }), UserModule, DealerModule, PainterModule, TestModule, AuthModule, UsersModule, HelperModule, SaleDeleteModule,
    TargetModule, DemarcationModule, ProductModule],
  controllers: [AppController, UserController, DealerController, PainterController, DemarcationController, ProductController],
  providers: [AppService, UserService, DealerService, PainterService, HelperService, DemercationService,ProductService],
})
export class AppModule { }
