import { PrismaClient, TipoUsuario } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const username = 'Katalina';
  const password = 'katalina123';

  const existing = await prisma.usuario.findFirst({
    where: { username },
  });

  if (existing) {
    console.log(`Admin user already exists with username "${username}" (id=${existing.id})`);
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.usuario.create({
    data: {
      nombre: 'Katalina',
      apellido: 'Torres',
      correo: 'katalina.torres@gmail.com',
      username,
      password: hashedPassword,
      tipo: TipoUsuario.ADMINISTRADOR,
    },
  });

  console.log('Admin user created:', {
    id: user.id,
    username: user.username,
    email: user.correo,
    tipo: user.tipo,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

