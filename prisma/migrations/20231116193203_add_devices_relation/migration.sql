-- CreateTable
CREATE TABLE "devices" (
    "ip" TEXT NOT NULL,
    "deviceName" TEXT NOT NULL,
    "issuedAt" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "devices_pkey" PRIMARY KEY ("userId")
);

-- AddForeignKey
ALTER TABLE "devices" ADD CONSTRAINT "devices_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
