import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../../prisma/prisma.service';
import {
  Prisma,
  User,
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

  async findUserByConfirmCode(code: string): Promise<ResultDTO<User>> {
    const user = await this.prisma.user.findFirst({
      where: {
        confirmationInfo: {
          confirmationCode: code,
        },
      },
    });

    if (!user) return new ResultDTO(InternalCode.NotFound);

    return new ResultDTO(InternalCode.Success, user);
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

  async deleteUser(userId: number): Promise<ResultDTO<null>> {
    const res = await this.prisma.user.delete({ where: { id: userId } });

    console.log('-----------Delete User: ', res);

    return new ResultDTO(InternalCode.Success);
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

  async findByCredentials(loginOrEmail: string): Promise<ResultDTO<User>> {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          {
            login: loginOrEmail,
          },
          {
            email: loginOrEmail,
          },
        ],
      },
    });

    if (!user) return new ResultDTO(InternalCode.NotFound);

    return new ResultDTO(InternalCode.Success, user);
  }
}
