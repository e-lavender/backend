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
    // data: Prisma.ProfileCreateInput,
  ): Promise<ResultDTO<null>> {
    await this.prisma.profile.create({
      data: { ...data },
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
        firstName: inputModel.firstName,
        lastName: inputModel.lastName,
        dateOfBirth: inputModel.dateOfBirth,
        city: inputModel.city,
        country: inputModel.country,
        aboutMe: inputModel.aboutMe,
      },
    });

    return new ResultDTO(InternalCode.Success, {
      userName: profile.userName,
      firstName: profile.firstName,
      lastName: profile.lastName,
      dateOfBirth: profile.dateOfBirth
        ? profile.dateOfBirth.toISOString()
        : null,
      city: profile.city,
      country: profile.country,
      aboutMe: profile.aboutMe,
    });
  }
}
