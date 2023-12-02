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
import { PainterService } from './painter.service';
import { PainterDto, UpdatePainterDto } from './painter.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { Helper } from 'src/utils/file-uploading.utils';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('painter')
export class PainterController {
  PainterService: any;

  constructor(private painterService: PainterService) { }

  //@UseGuards(JwtAuthGuard)
  @Get('get_painter_company_info')
  async companyProgotiList(): Promise<any> {
    let data = this.painterService.getCompanyProgotiInfo();
    return data;
  }

  //@UseGuards(JwtAuthGuard)
  @Get('get_painter_info')
  async painterList(): Promise<any> {
    return this.painterService.getPainterList();    
  }  

  //@UseGuards(JwtAuthGuard)
  @Get('get_painter_dump')
  async painter_dump(@Response({ passthrough: true }) res: Response): Promise<any> {
    let data = this.painterService.getPainterDump(res);
    return data;
    // console.log(data);
  }


  //@UseGuards(JwtAuthGuard)
  @Post('store_painter')
  async create(@Body() painterDto: PainterDto): Promise<any> {
    return this.painterService.storeSinglePainterInfo(painterDto);
  }

  //@UseGuards(JwtAuthGuard)
  @Post('update_painter')
  async update(@Body() updatePainterDto: UpdatePainterDto): Promise<any> {
    return this.painterService.painterEditAction(updatePainterDto);
  }

  //@UseGuards(JwtAuthGuard)
  @Post('upload_bulk_painter')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: Helper.destinationPath,
        filename: Helper.customFileName,
      }),
    }),
  )
  //@UseInterceptors(FileInterceptor('file'))
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    return this.painterService.uploadBulkPainter(file);
  }

  //@UseGuards(JwtAuthGuard)
  @Post('edit_bulk_painter')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: Helper.destinationPath,
        filename: Helper.customFileName,
      }),
    }),
  )
  uploadEditedFile(@UploadedFile() file: Express.Multer.File) {
    return this.painterService.uploadEditedBulkPainter(file);
  }

  //@UseGuards(JwtAuthGuard)
  @Post('delete_bulk_painter')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: Helper.destinationPath,
        filename: Helper.customFileName,
      }),
    }),
  )
  uploadDeleteedFile(@UploadedFile() file: Express.Multer.File) {
    return this.painterService.uploadDeleteBulkPainter(file);
  }

  //@UseGuards(JwtAuthGuard)
  @Get('/delete-painter/:id')
  async delete_users(@Param() params): Promise<any> {
    let deleteUser = this.painterService.deleteSinglePainter(params.id);
    return deleteUser;
  }

  //@UseGuards(JwtAuthGuard)
  @Get('/active-painter/:id')
  async active(@Param() params): Promise<any> {
    let deleteUser = this.painterService.activeSinglePainter(params.id);
    return deleteUser;
  }
}
