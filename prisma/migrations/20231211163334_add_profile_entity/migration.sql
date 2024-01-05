/*
  Warnings:

  - A unique constraint covering the columns `[id,login]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateTable
CREATE TABLE "profile" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "dateOfBirth" TIMESTAMP NOT NULL,
    "city" TEXT,
    "aboutMe" TEXT,
    "userId" INTEGER NOT NULL,
    "login" TEXT NOT NULL,

    CONSTRAINT "profile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "profile_userId_login_key" ON "profile"("userId", "login");

-- CreateIndex
CREATE UNIQUE INDEX "users_id_login_key" ON "users"("id", "login");

-- AddForeignKey
ALTER TABLE "profile" ADD CONSTRAINT "profile_userId_login_fkey" FOREIGN KEY ("userId", "login") REFERENCES "users"("id", "login") ON DELETE CASCADE ON UPDATE CASCADE;
