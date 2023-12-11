import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../../prisma/prisma.service';
import { ResultDTO } from '../../../../../../libs/dtos/resultDTO';
import { ViewProfileModel } from '../api/models/view.profile.model';
import { InternalCode } from '../../../../../../libs/enums';
import { Profile } from '@prisma/client';

@Injectable()
export class ProfileQueryRepository {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: number): Promise<ResultDTO<ViewProfileModel>> {
    const profile = await this.prisma.profile.findUnique({
      where: { userId: userId },
    });
    if (!profile) return new ResultDTO(InternalCode.NotFound);

    return new ResultDTO(InternalCode.Success, this._mapDbToView(profile));
  }

  _mapDbToView(profile: Profile): ViewProfileModel {
    return {
      login: profile.login,
      firstName: profile.firstName,
      lastName: profile.lastName,
      dateOfBirth: profile.dateOfBirth.toISOString(),
      city: profile.city,
      aboutMe: profile.aboutMe,
    };
  }
}
