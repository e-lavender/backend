/*
  Warnings:

  - Changed the type of `issuedAt` on the `devices` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "devices" DROP COLUMN "issuedAt",
ADD COLUMN     "issuedAt" TIMESTAMP NOT NULL;
