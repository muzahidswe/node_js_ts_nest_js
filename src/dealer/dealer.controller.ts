import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  Request,
  Res,
  Response,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { DealerService } from './dealer.service';
import { DealerDto, UpdateDealerDto } from './dealer.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { Helper } from 'src/utils/file-uploading.utils';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('dealer')
export class DealerController {
  UserService: any;

  constructor(private dealerService: DealerService) {}
  
  //@UseGuards(JwtAuthGuard)
  @Get('get_dealer_info')
  async dealers(): Promise<any> {
    return this.dealerService.getDealerList();
  }

   //@UseGuards(JwtAuthGuard)
   @Get('get_dealer_dump')
   async dealers_dump(@Response({passthrough: true}) res: Response): Promise<any> {
     return this.dealerService.getDealerDump(res); 
   }

   //@UseGuards(JwtAuthGuard)
   @Get('get_wakeup_dealer_dump')
   async wakeup_dealers_dump(@Response({passthrough: true}) res: Response): Promise<any> {
     return this.dealerService.getWakeUpDealerDump(res); 
   }

  //@UseGuards(JwtAuthGuard)
  @Post('store_dealer')
  async create(@Body() dealerDto: DealerDto): Promise<any> {
    return this.dealerService.storeDealerInfo(dealerDto);
  }

  //@UseGuards(JwtAuthGuard)
  @Post('update_dealer')
  async update(@Body() updateDealerDto: UpdateDealerDto): Promise<any> {
    return this.dealerService.updateDealerInfo(updateDealerDto);
  }

 //@UseGuards(JwtAuthGuard)
  @Post('upload_bulk_dealer')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: Helper.destinationPath,
        filename: Helper.customFileName,
      }),
    }),
  )  
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    return this.dealerService.uploadBulkDealer(file);
  }

  //@UseGuards(JwtAuthGuard)
  @Post('upload_edited_bulk_dealer')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: Helper.destinationPath,
        filename: Helper.customFileName,
      }),
    }),
  )  
  uploadEditedFile(@UploadedFile() file: Express.Multer.File) {
    return this.dealerService.uploadEditedBulkDealer(file);
  }

  //@UseGuards(JwtAuthGuard)
  @Post('upload_delete_bulk_dealer')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: Helper.destinationPath,
        filename: Helper.customFileName,
      }),
    }),
  )  
  uploadDeleteedFile(@UploadedFile() file: Express.Multer.File) {
    return this.dealerService.uploadDeleteBulkDealer(file);
  }
  
  //@UseGuards(JwtAuthGuard)
  @Get('/delete_dealer/:id')
  async delete_users(@Param() params): Promise<any> {
    //console.log('controller',params.id);
    let deleteUser = this.dealerService.deleteDealer(params.id);
    return deleteUser;
  }

  //@UseGuards(JwtAuthGuard)
  @Get('/active_dealer/:id')
  async active_users(@Param() params): Promise<any> {
    //console.log('controller',params.id);
    let deleteUser = this.dealerService.activeDealer(params.id);
    return deleteUser;
  }
}
