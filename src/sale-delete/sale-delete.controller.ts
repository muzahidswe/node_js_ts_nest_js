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
import { SaleDeleteService } from './sale-delete.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { Helper } from 'src/utils/file-uploading.utils';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { HttpService } from '@nestjs/axios';
const fs = require('fs');

@Controller('sale_delete')
export class SaleDeleteController {
  SaleDeleteService: any;
  constructor(private saleDeleteService: SaleDeleteService,
    private httpService: HttpService) { }

  async call_api_for_image_delete(obj): Promise<any> {
    let url = 'https://apecbuddy.com/app/remove_saleinvoice';
    await this.httpService.post(url, obj)
      .toPromise().then(res => {
        console.log(res.data);
      })
      .catch(err => {
        console.log(err);
      });
  }

  ////@UseGuards(JwtAuthGuard) 
  @Post('delete_bulk_sale')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: Helper.destinationPath,
        filename: Helper.customFileName,
      }),
    }),
  )
  async uploadFile(@UploadedFile() file: Express.Multer.File, @Body() body) {
    let type = body.type
    let salesIdAndInvoiceId = await this.saleDeleteService.uploadBulkSaleOrderID(file, type);
    if (salesIdAndInvoiceId.status !== 0) {
      let invoiceId = salesIdAndInvoiceId['invoice_info_id'];
      let api_object = { invoice_info_id: invoiceId }
      let image_delete = await this.call_api_for_image_delete(api_object);
      //console.log(image_delete)
      if (type == 'sale_order_delete') {
        let image_deletes = 1;
        if (image_deletes === 1) {
          let salesId = salesIdAndInvoiceId['sales_id'];
          return await this.saleDeleteService.deleteSale(salesId, type); // again call function by sales id
        } else {
          const return_message = {
            data: 1,
            msg: 'Opps!!! Somwething went wrong. Operatipon has not done succesfully.',
            success: false,
          };
          return return_message;
        }
      }
    }
  }

  //@UseGuards(JwtAuthGuard)
  @Post('check_bulk_sale')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: Helper.destinationPath,
        filename: Helper.customFileName,
      }),
    }),
  )
  uploadSaleFile(@UploadedFile() file: Express.Multer.File, @Response({ passthrough: true }) res: Response) {
    return this.saleDeleteService.checkBulkSales(res, file);
  }

  @Get('check_sale_delete/:fileId')
  async serviceImage(@Param('fileId') fileId, @Res() res): Promise<any> {
    res.sendFile(fileId, { root: 'upload' });
  }



}
