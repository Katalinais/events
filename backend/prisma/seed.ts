import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const USUARIO_INVITADO_CORREO = 'katalina@gmail.com';

async function main() {
  const existing = await prisma.usuario.findUnique({
    where: { correo: USUARIO_INVITADO_CORREO },
  });
  if (existing) {
    console.log('Usuario invitado ya existe:', existing.id);
    return;
  }
  const usuario = await prisma.usuario.create({
    data: {
      nombre: 'Katalina',
      apellido: 'Torres',
      correo: USUARIO_INVITADO_CORREO,
      tipo: 'EXTERNO',
    },
  });
  console.log('Usuario invitado creado:', usuario.id, usuario.correo);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
