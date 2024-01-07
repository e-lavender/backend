import { PrismaService } from '../../../../../../prisma/prisma.service';
import { ResultDTO } from '../../../../../../libs/dtos/resultDTO';
import { InternalCode } from '../../../../../../libs/enums';
import { ProfileQueryRepository } from '../../profile/infrastructure/profile.query.repository';
import { Post } from '@prisma/client';
import { ViewProfileModel } from '../../profile/api/models/view.profile.model';
import { PublicViewPostModel } from '../api/models/public.view.post.model';
import { UsersQueryRepository } from '../../users/infrastructure/users-query.repository';

export class PublicPostQueryRepository {
  constructor(
    private prisma: PrismaService,
    private usersQueryRepository: UsersQueryRepository,
    private profileQueryRepository: ProfileQueryRepository,
  ) {}

  async getPublicPost(id: string): Promise<ResultDTO<PublicViewPostModel>> {
    const post = await this.prisma.post.findUnique({
      where: { id },
    });
    if (!post) return new ResultDTO(InternalCode.NotFound);

    const profile = await this.profileQueryRepository.getProfile(post.userId);

    return new ResultDTO(
      InternalCode.Success,
      this._mapDbToPublicView(post, profile),
    );
  }

  async getLastPublicPosts() {
    const posts = await this.prisma.post.findMany({
      skip: 0,
      take: 4,
      orderBy: {
        createdAt: 'desc',
      },
    });
    if (!posts) return new ResultDTO(InternalCode.NotFound);

    const publicViewPosts = posts.map(async (p) => {
      return {
        userName: await this.prisma.profile.findUnique({
          where: { userId: p.userId },
        }),
        photoUrl: 'post.photoUrl',
        description: p.description,
        comments: [],
      };
    });

    const usersCount = await this.usersQueryRepository.usersCount();

    return new ResultDTO(InternalCode.Success, {
      usersCount: usersCount.payload,
      lastPosts: publicViewPosts,
    });
  }

  _mapDbToPublicView(
    post: Post,
    profile: ResultDTO<ViewProfileModel>,
  ): PublicViewPostModel {
    return {
      userName: profile.payload.userName,
      photoUrl: 'post.photoUrl',
      description: post.description,
      comments: [],
    };
  }
}
