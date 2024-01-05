export const CleanDbService = {
  async cleanDb(): Promise<void> {
    return this.PrismaService.user.deleteMany();
  },
};
