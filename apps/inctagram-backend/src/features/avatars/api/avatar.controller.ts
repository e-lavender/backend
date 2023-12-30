import {
  Controller,
  Header,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import type { Response } from 'express';

@Controller('avatar')
export class AvatarController {
  @Post('upload')
  @Header('Content-Type', 'application/pdf')
  @UseInterceptors(FileInterceptor('avatar'))
  async uploadAvatar(
    @UploadedFile() file: Express.Multer.File,
    @Res() res: Response,
  ) {
    console.log(file);
    /*res.set({
      'Content-Type': 'application/json',
      'Content-Disposition': 'attachment; filename="projects.png"',
    });*/

    return file.buffer.toString();
  }
}
