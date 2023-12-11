import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../../prisma/prisma.service';
import { UpdateProfileModel } from '../api/models/update.profile.model';
import { ResultDTO } from '../../../../../../libs/dtos/resultDTO';
import { InternalCode } from '../../../../../../libs/enums';

@Injectable()
export class ProfileRepository {
  constructor(private prisma: PrismaService) {}

  // async createProfile() {
  //   const profile = await this.prisma.profile.create({
  //     data: {},
  //     select: {},
  //   });
  //   return new ResultDTO(InternalCode.Success, {
  //     login: profile.login,
  //     firstName: profile.firstName,
  //     lastName: profile.lastName,
  //     dateOfBirth: profile.dateOfBirth,
  //     city: profile.city,
  //     aboutMe: profile.aboutMe,
  //   });
  // }

  async updateProfile(userId: number, inputModel: UpdateProfileModel) {
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
      dateOfBirth: profile.dateOfBirth,
      city: profile.city,
      aboutMe: profile.aboutMe,
    });
  }
}
