-- Ensure username column exists (idempotent: only runs if column is missing)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'Usuario' AND column_name = 'username'
  ) THEN
    ALTER TABLE "Usuario" ADD COLUMN "username" TEXT NOT NULL DEFAULT '';
    ALTER TABLE "Usuario" ALTER COLUMN "username" DROP DEFAULT;
  END IF;
END $$;

-- Ensure correo is nullable (idempotent)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'Usuario' AND column_name = 'correo' AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE "Usuario" ALTER COLUMN "correo" DROP NOT NULL;
  END IF;
END $$;
