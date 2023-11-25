-- AlterTable
ALTER TABLE "users_email_confirmation" ALTER COLUMN "confirmationCode" SET DEFAULT uuid_generate_v4();
