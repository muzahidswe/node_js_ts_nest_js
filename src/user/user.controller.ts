import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Request,
  Res,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
  Param,
  Delete,
  Req,
  Response,
  UseGuards
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto, UpdateUserDto, CreateLoginUserDto } from './createuser.dto';
import {
  FileFieldsInterceptor,
  FileInterceptor,
  MulterModule,
} from '@nestjs/platform-express';
import { read } from 'xlsx';
import multer, { diskStorage } from 'multer';
import { Helper } from '../utils/file-uploading.utils';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';


@Controller('user')
export class UserController {
  constructor(private UserService: UserService) { }

  //@UseGuards(JwtAuthGuard)
  @Get('get_test_query')
  async make_array(): Promise<any> {
    return this.UserService.makeArrayLikePhp();
  }

  //@UseGuards(JwtAuthGuard)
  @Get('get_user_info')
  async users(): Promise<any> {
    return this.UserService.getUserList();
  }

  //@UseGuards(JwtAuthGuard)
  @Get('get_user_dump')
  async user_dump(@Response({ passthrough: true }) res: Response): Promise<any> {
    return this.UserService.getUserDump(res);
  }

  //@UseGuards(JwtAuthGuard)
  @Get('/delete-user/:id')
  async delete_users(@Param() params): Promise<any> {
    console.log('BE-User',params.id);
    let deleteUser = this.UserService.removeUser(params.id);
    return deleteUser;
  }

  //@UseGuards(JwtAuthGuard)
  @Get('/active-user/:id')
  async active_users(@Param() params): Promise<any> {    
    let deleteUser = this.UserService.activeUser(params.id);
    return deleteUser;
  }

  //@UseGuards(JwtAuthGuard)
  @Get('/update-user-password/:id')
  async update_users_password(@Param() params): Promise<any> {   
    let deleteUser = this.UserService.updateUserPassword(params.id);
    return deleteUser;
  }

  //@UseGuards(JwtAuthGuard)
  @Get('get_places')
  async place_info(): Promise<any> {
    return this.UserService.getPlaces();
  }

  //@UseGuards(JwtAuthGuard)
  @Get('get_apec_national_user_info')
  async apec_user_info(): Promise<any> {
    return this.UserService.getApecNationalUser();
  }

  //@UseGuards(JwtAuthGuard)
  @Get('get_eazzy_national_user_info')
  async eazzy_user_info(): Promise<any> {
    return this.UserService.getEazzyNationalUser();
  }

  //@UseGuards(JwtAuthGuard)
  @Post('get_location_by_cluster_id')
  async get_location_by_cluster_id(@Req() request: Request): Promise<any> {
    return this.UserService.getLocationByCluster(request.body['cluster_id']);
  }

  //@UseGuards(JwtAuthGuard)
  @Get('get_location_info')
  async location(): Promise<any> {
    return this.UserService.getLocationInfo();
  }

  //@UseGuards(JwtAuthGuard)
  @Post('store_user')
  async create(@Body() createUserDto: CreateUserDto): Promise<any> {
    return this.UserService.storeUserInfo(createUserDto);
  }

  //@UseGuards(JwtAuthGuard)
  @Post('update_user')
  async update_user(@Body() updateUserDto: UpdateUserDto): Promise<any> {
    return this.UserService.updateUserInfo(updateUserDto);
  }
  //update_user

  //@UseGuards(JwtAuthGuard)
  @Post('upload_bulk_user')
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
    return this.UserService.uploadBulkUser(file);
  }

  //@UseGuards(JwtAuthGuard)
  @Post('update_bulk_user')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: Helper.destinationPath,
        filename: Helper.customFileName,
      }),
    }),
  )
  //@UseInterceptors(FileInterceptor('file'))
  async uploadEditFile(@UploadedFile() file: Express.Multer.File) {
    return await this.UserService.updateBulkUser(file);
  }

  //@UseGuards(JwtAuthGuard)
  @Post('delete_bulk_user')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: Helper.destinationPath,
        filename: Helper.customFileName,
      }),
    }),
  )
  //@UseInterceptors(FileInterceptor('file'))
  uploadDeleteFile(@UploadedFile() file: Express.Multer.File) {
    return this.UserService.deleteBulkUser(file);
  }

  //@UseGuards(JwtAuthGuard)
  @Post('read_excel_file')
  async upload_users(@Body() createUserDto: CreateUserDto): Promise<any> {
    const readXlsxFile = require('read-excel-file/node');
    readXlsxFile(
      'E:/Apsis/Asian Paints/asian-paints-api/public/users/sample_user.xlsx',
    ).then((rows) => {
      console.log(rows);
    });
  }


  //@UseGuards(JwtAuthGuard)
  @Post('create_login_user')
  async login_users(@Body() createLoginUserDto: CreateLoginUserDto): Promise<any> {
    return this.UserService.createLoginUser(createLoginUserDto);
  }


}
