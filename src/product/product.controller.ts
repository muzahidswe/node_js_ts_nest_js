import { Body, Controller, Get, Param, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { ProductService } from './product.service';
import { CategoryDto } from './product.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { Helper } from 'src/utils/file-uploading.utils';

@Controller('product')
export class ProductController {
  ProductService: any;
  constructor(private productService: ProductService) { }

  //@UseGuards(JwtAuthGuard)
  @Get('get_category_list')
  async categoryList(): Promise<any> {
    let data = this.productService.getCategoryList();
    return data;
  }

  //@UseGuards(JwtAuthGuard)
  @Post('store_category')
  async create(@Body() categoryDto: CategoryDto): Promise<any> {
    return this.productService.storeCategory(categoryDto);
  }

  //@UseGuards(JwtAuthGuard)
  @Get('get_sub-category_list')
  async subCategoryList(): Promise<any> {
    let data = this.productService.getSubCategoryList();
    return data;
  }

  //@UseGuards(JwtAuthGuard)
  @Post('store_sub_category')
  async sub_category(@Body() categoryDto: CategoryDto): Promise<any> {
    return this.productService.storeSubCategory(categoryDto);
  }

  //@UseGuards(JwtAuthGuard)
  @Get('get_product_list')
  async productList(): Promise<any> {
    let data = this.productService.getProductList();
    return data;
  }

  //@UseGuards(JwtAuthGuard)
  @Post('upload_bulk_product')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: Helper.destinationPath,
        filename: Helper.customFileName,
      }),
    }),
  )
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    return this.productService.uploadBulkProduct(file);
  }

  //@UseGuards(JwtAuthGuard)
  @Post('upload_bulk_price')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: Helper.destinationPath,
        filename: Helper.customFileName,
      }),
    }),
  )
  updateFile(@UploadedFile() file: Express.Multer.File) {
    return this.productService.uploadBulkPrice(file);
  }

  //@UseGuards(JwtAuthGuard)
  @Post('store_product')
  async store_product(@Body() categoryDto: CategoryDto): Promise<any> {
    return this.productService.productAction(categoryDto);
  }

  //@UseGuards(JwtAuthGuard)
  @Post('update_product')
  async update_product(@Body() categoryDto: CategoryDto): Promise<any> {
    return this.productService.productEditAction(categoryDto);
  }

  //@UseGuards(JwtAuthGuard)
  @Get('/delete-single_product/:id')
  async delete_users(@Param() params): Promise<any> {
    //console.log('BE-User', params.id);
    let deleteUser = this.productService.deleteProduct(params.id);
    return deleteUser;

  }


  //@UseGuards(JwtAuthGuard)
  @Get('/active-single-product/:id')
  async active_product(@Param() params): Promise<any> {
    //console.log('controller', params.id);
    let deleteUser = this.productService.activeProduct(params.id);
    return deleteUser;
  }


}
