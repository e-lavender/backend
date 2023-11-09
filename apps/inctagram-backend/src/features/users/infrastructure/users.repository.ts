import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../../prisma/prisma.service';
import { Prisma, User } from '@prisma/client';
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
    console.log(user);
    return new ResultDTO(InternalCode.Success, {
      userId: user.id,
      code: user.confirmationInfo.confirmationCode,
    });
  }

  async deleteUser(userId: number): Promise<ResultDTO<null>> {
    const res = await this.prisma.user.delete({ where: { id: userId } });

    console.log('-----------Delete User: ', res);

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
    console.log(user);
    if (!user) return new ResultDTO(InternalCode.NotFound);

    return new ResultDTO(InternalCode.Success, user);
  }
}
