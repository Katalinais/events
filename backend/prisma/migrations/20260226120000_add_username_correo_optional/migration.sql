-- AlterTable
-- Add username column (existing rows get ''; then we drop default so new rows must provide it)
ALTER TABLE "Usuario" ADD COLUMN IF NOT EXISTS "username" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Usuario" ALTER COLUMN "username" DROP DEFAULT;

-- Make correo optional (nullable)
ALTER TABLE "Usuario" ALTER COLUMN "correo" DROP NOT NULL;
