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
import { TargetService } from './target.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { Helper } from 'src/utils/file-uploading.utils';

@Controller('target')
export class TargetController {
  TargetService: any;
  constructor(private targetService: TargetService) { }

  @Get('get_target_info')
  async target_list(): Promise<any> {
    return this.targetService.getTargetList();
  }

   //@UseGuards(JwtAuthGuard)
   @Get('/target_list_by_month_year/:year_month')
   async target_list_by_month_year(@Param() params): Promise<any> {
     //console.log('controller',params.id);
     let targetList = this.targetService.getTargetListByYearMonth(params.year_month);
     return targetList;
   }

  ////@UseGuards(JwtAuthGuard) 
  @Post('upload_target_file')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: Helper.destinationPath,
        filename: Helper.customFileName,
      }),
    }),
  )
  uploadFile(@UploadedFile() file: Express.Multer.File, @Body() body) {
    let type = body.type
    return this.targetService.uploadTargetFile(file, type);

  }


}
