import { PrismaService } from '../../../../../../prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { ResultDTO } from '../../../../../../libs/dtos/resultDTO';
import { InternalCode } from '../../../../../../libs/enums';
import { ViewPostModel } from '../api/models/view.post.model';
import { Post } from '@prisma/client';

@Injectable()
export class PostQueryRepository {
  constructor(private prisma: PrismaService) {}

  async getPost(id: string): Promise<ResultDTO<Post>> {
    const post = await this.prisma.post.findUnique({
      where: { id },
    });
    if (!post) return new ResultDTO(InternalCode.NotFound);

    return new ResultDTO(InternalCode.Success, post);
  }

  async getPosts(userId: number): Promise<ResultDTO<ViewPostModel[]>> {
    const posts = await this.prisma.post.findMany({
      where: { userId },
    });
    if (!posts) return new ResultDTO(InternalCode.NotFound);

    const viewPosts = posts.map((p: Post) => this._mapDbToView(p));
    return new ResultDTO(InternalCode.Success, viewPosts);
  }

  _mapDbToView(post: Post): ViewPostModel {
    return {
      description: post.description,
      createdAt: post.createdAt.toISOString(),
    };
  }
}
