import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../../prisma/prisma.service';
import { ResultDTO } from '../../../../../../libs/dtos/resultDTO';
import { InternalCode } from '../../../../../../libs/enums';
import { Device } from '@prisma/client';

@Injectable()
export class DevicesRepository {
  constructor(private prisma: PrismaService) {}

  async findDevice(deviceId: string): Promise<ResultDTO<Device>> {
    const device = await this.prisma.device.findUnique({
      where: { id: deviceId },
    });
    if (!device) return new ResultDTO(InternalCode.NotFound);

    return new ResultDTO(InternalCode.Success, device);
  }

  async updateTime(deviceId: string, issuedAt: Date): Promise<ResultDTO<null>> {
    await this.prisma.device.update({
      where: { id: deviceId },
      data: {
        issuedAt,
      },
    });

    return new ResultDTO(InternalCode.Success);
  }

  async delete(deviceId: string): Promise<ResultDTO<null>> {
    const res = await this.prisma.device.delete({ where: { id: deviceId } });
    if (!res) return new ResultDTO(InternalCode.NotFound);

    return new ResultDTO(InternalCode.Success);
  }

  async create(
    userId: number,
    ip: string,
    deviceName: string,
    issuedAt: Date,
  ): Promise<ResultDTO<{ deviceId: string }>> {
    const res = await this.prisma.device.create({
      data: {
        userId,
        ip,
        deviceName,
        issuedAt,
      },
    });

    return new ResultDTO(InternalCode.Success, { deviceId: res.id });
  }
}
