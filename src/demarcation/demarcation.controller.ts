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
import { DemercationService } from './demarcation.service';
import { DemercationDto } from './demarcation.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { Helper } from 'src/utils/file-uploading.utils';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('demarcation')
export class DemarcationController {
    PainterService: any;

    constructor(private demercationService: DemercationService) { }
    //@UseGuards(JwtAuthGuard)
    @Post('upload_bulk_data')
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
        return this.demercationService.updateCluster(file);
    }


}
