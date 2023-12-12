import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../../prisma/prisma.service';
import { UpdateProfileModel } from '../api/models/update.profile.model';
import { ResultDTO } from '../../../../../../libs/dtos/resultDTO';
import { InternalCode } from '../../../../../../libs/enums';
import { ViewProfileModel } from '../api/models/view.profile.model';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProfileRepository {
  constructor(private prisma: PrismaService) {}

  async createProfile(
    data: Prisma.ProfileUncheckedCreateInput,
  ): Promise<ResultDTO<null>> {
    await this.prisma.profile.create({
      data: { ...data },
      // select: {},
    });
    return new ResultDTO(InternalCode.Success);
  }

  async updateProfile(
    userId: number,
    inputModel: UpdateProfileModel,
  ): Promise<ResultDTO<ViewProfileModel>> {
    const profile = await this.prisma.profile.update({
      where: { userId },
      data: {
        login: inputModel.login,
        firstName: inputModel.firstName,
        lastName: inputModel.lastName,
        dateOfBirth: inputModel.dateOfBirth,
        city: inputModel.city,
        aboutMe: inputModel.aboutMe,
      },
    });
    return new ResultDTO(InternalCode.Success, {
      login: profile.login,
      firstName: profile.firstName,
      lastName: profile.lastName,
      dateOfBirth: profile.dateOfBirth.toISOString(),
      city: profile.city,
      aboutMe: profile.aboutMe,
    });
  }
}
