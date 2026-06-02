/*
  Warnings:

  - The primary key for the `Usuario` table will be changed from INT (autoincrement) to TEXT (UUID).
  - The type of `usuarioId` on `UsuarioInteresado` and `Venta` changes from INT to TEXT accordingly.
  - Existing rows will keep their IDs converted to text (e.g. "1", "2"). New rows will receive proper UUIDs.

*/

-- DropForeignKey
ALTER TABLE "UsuarioInteresado" DROP CONSTRAINT "UsuarioInteresado_usuarioId_fkey";

-- DropForeignKey
ALTER TABLE "Venta" DROP CONSTRAINT "Venta_usuarioId_fkey";

-- AlterTable Usuario: change PK from serial INT to UUID TEXT
ALTER TABLE "Usuario" DROP CONSTRAINT "Usuario_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT USING "id"::TEXT,
ALTER COLUMN "id" SET DEFAULT gen_random_uuid(),
ADD CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id");

DROP SEQUENCE IF EXISTS "Usuario_id_seq";

-- AlterTable UsuarioInteresado
ALTER TABLE "UsuarioInteresado" ALTER COLUMN "usuarioId" SET DATA TYPE TEXT USING "usuarioId"::TEXT;

-- AlterTable Venta
ALTER TABLE "Venta" ALTER COLUMN "usuarioId" SET DATA TYPE TEXT USING "usuarioId"::TEXT;

-- AddForeignKey
ALTER TABLE "UsuarioInteresado" ADD CONSTRAINT "UsuarioInteresado_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Venta" ADD CONSTRAINT "Venta_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;
