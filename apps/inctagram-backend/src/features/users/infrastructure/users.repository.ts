import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../../prisma/prisma.service';
import {
  Prisma,
  UserEmailConfirmation,
  UserPasswordRecovery,
} from '@prisma/client';
import { ResultDTO } from '../../../../../../libs/dtos/resultDTO';
import { InternalCode } from '../../../../../../libs/enums';

@Injectable()
export class UsersRepository {
  constructor(private prisma: PrismaService) {}

  async createUser(
    data: Omit<Prisma.UserCreateInput, 'createdAt'>,
    expirationDate: Date,
  ): Promise<ResultDTO<{ userId: number; code: string }>> {
    const user = await this.prisma.user.create({
      data: {
        ...data,
        confirmationInfo: {
          create: {
            expirationDate,
          },
        },
      },
      select: {
        id: true,
        confirmationInfo: { select: { confirmationCode: true } },
      },
    });

    return new ResultDTO(InternalCode.Success, {
      userId: user.id,
      code: user.confirmationInfo.confirmationCode,
    });
  }

  async createOrUpdateRecoveryData(
    userId: number,
    expirationDate: Date,
    newCode: string,
  ): Promise<ResultDTO<UserPasswordRecovery>> {
    const recoveryData = await this.prisma.userPasswordRecovery.upsert({
      where: { userId },
      update: { expirationDate, recoveryCode: newCode },
      create: {
        expirationDate,
        userId,
      },
    });

    return new ResultDTO(InternalCode.Success, recoveryData);
  }

  async findConfirmData(
    code: string,
  ): Promise<ResultDTO<UserEmailConfirmation>> {
    const confirmData = await this.prisma.userEmailConfirmation.findFirst({
      where: { confirmationCode: code },
    });
    console.log({ exp_date_after_db: confirmData.expirationDate });

    if (!confirmData) return new ResultDTO(InternalCode.NotFound);

    return new ResultDTO(InternalCode.Success, confirmData);
  }

  async findRecoveryData(
    code: string,
  ): Promise<ResultDTO<UserPasswordRecovery>> {
    const recoveryData = await this.prisma.userPasswordRecovery.findFirst({
      where: { recoveryCode: code },
    });

    if (!recoveryData) return new ResultDTO(InternalCode.NotFound);

    return new ResultDTO(InternalCode.Success, recoveryData);
  }

  async updateConfirmData(
    userId: number,
    expirationDate: Date,
    code: string,
  ): Promise<ResultDTO<{ code: string }>> {
    const res = await this.prisma.userEmailConfirmation.update({
      where: { userId },
      data: {
        expirationDate,
        confirmationCode: code,
      },
    });

    return new ResultDTO(InternalCode.Success, { code: res.confirmationCode });
  }

  async confirmEmail(userId: number): Promise<ResultDTO<null>> {
    await this.prisma.userEmailConfirmation.update({
      where: {
        userId,
      },
      data: {
        isConfirmed: true,
      },
    });

    return new ResultDTO(InternalCode.Success);
  }

  async confirmRecoveryPassword(
    userId: number,
  ): Promise<ResultDTO<{ code: string }>> {
    const res = await this.prisma.userPasswordRecovery.update({
      where: {
        userId,
      },
      data: {
        isConfirmed: true,
      },
      select: {
        recoveryCode: true,
      },
    });

    return new ResultDTO(InternalCode.Success, { code: res.recoveryCode });
  }

  async updatePassword(
    userId: number,
    passwordHash: string,
  ): Promise<ResultDTO<null>> {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash,
      },
    });

    return new ResultDTO(InternalCode.Success);
  }

  async updateUserName(id: number, userName: string) {
    await this.prisma.user.update({
      where: { id },
      data: { login: userName },
    });

    return new ResultDTO(InternalCode.Success);
  }

  async deleteUser(userId: number): Promise<ResultDTO<null>> {
    await this.prisma.user.delete({ where: { id: userId } });

    return new ResultDTO(InternalCode.Success);
  }
}
