/*
  Warnings:

  - You are about to drop the column `login` on the `profile` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId,userName]` on the table `profile` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userName` to the `profile` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "profile" DROP CONSTRAINT "profile_userId_login_fkey";

-- DropIndex
DROP INDEX "profile_userId_login_key";

-- AlterTable
ALTER TABLE "profile" DROP COLUMN "login",
ADD COLUMN     "country" TEXT,
ADD COLUMN     "userName" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "profile_userId_userName_key" ON "profile"("userId", "userName");

-- AddForeignKey
ALTER TABLE "profile" ADD CONSTRAINT "profile_userId_userName_fkey" FOREIGN KEY ("userId", "userName") REFERENCES "users"("id", "login") ON DELETE CASCADE ON UPDATE CASCADE;
