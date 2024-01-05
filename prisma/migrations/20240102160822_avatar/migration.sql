-- CreateTable
CREATE TABLE "avatars" (
    "userId" INTEGER NOT NULL,
    "fileId" TEXT NOT NULL,
    "key" TEXT NOT NULL,

    CONSTRAINT "avatars_pkey" PRIMARY KEY ("userId")
);

-- CreateIndex
CREATE UNIQUE INDEX "avatars_userId_fileId_key_key" ON "avatars"("userId", "fileId", "key");

-- AddForeignKey
ALTER TABLE "avatars" ADD CONSTRAINT "avatars_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
