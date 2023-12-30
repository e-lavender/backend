import {
  Controller,
  Header,
  Inject,
  Post,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import type { Response } from 'express';
import { ClientProxy } from '@nestjs/microservices';
import { Services } from '../../../../../../libs/enums';
import { JwtAccessAuthGuard } from '../../auth/guards/jwt-access-auth.guard';
import { CurrentUserId } from '../../infrastructure/decorators/params/current-user-id.decorator';

@Controller('avatar')
export class AvatarController {
  constructor(@Inject(Services.FileService) private client: ClientProxy) {}

  @Post('upload')
  @UseGuards(JwtAccessAuthGuard)
  @Header('Content-Type', 'application/pdf')
  @UseInterceptors(FileInterceptor('avatar'))
  async uploadAvatar(
    @CurrentUserId() userId: number,
    @UploadedFile() file: Express.Multer.File,
    @Res() res: Response,
  ) {
    return this.client.send({ cmd: 'save_avatar' }, { file, userId });
  }
}
