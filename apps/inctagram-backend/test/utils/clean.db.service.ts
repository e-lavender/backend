import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';

@Injectable()
export class CleanDbService {
  constructor(private prisma: PrismaService) {}

  async cleanDb(): Promise<void> {
    await this.prisma.user.deleteMany();
  }
}
