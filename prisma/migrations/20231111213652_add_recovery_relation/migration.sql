-- CreateTable
CREATE TABLE "users_password_recovery" (
    "recoveryCode" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "expirationDate" TIMESTAMP NOT NULL,
    "isConfirmed" BOOLEAN DEFAULT false,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "users_password_recovery_pkey" PRIMARY KEY ("userId")
);

-- AddForeignKey
ALTER TABLE "users_password_recovery" ADD CONSTRAINT "users_password_recovery_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
