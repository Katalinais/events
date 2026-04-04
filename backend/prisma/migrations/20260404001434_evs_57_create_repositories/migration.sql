/*
  Warnings:

  - A unique constraint covering the columns `[username]` on the table `Usuario` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "EstadoEvento" AS ENUM ('ACTIVO', 'COMPLETADO', 'CANCELADO');

-- AlterTable
ALTER TABLE "Evento" ADD COLUMN     "estado" "EstadoEvento" NOT NULL DEFAULT 'ACTIVO';

-- CreateTable
CREATE TABLE "CategoriaEntrada" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "CategoriaEntrada_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventoEntrada" (
    "id" SERIAL NOT NULL,
    "eventoId" INTEGER NOT NULL,
    "categoriaEntradaId" INTEGER NOT NULL,
    "cantidadTotal" INTEGER NOT NULL,
    "cantidadDisponible" INTEGER NOT NULL,
    "precio" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventoEntrada_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Venta" (
    "id" SERIAL NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "codigoQR" TEXT NOT NULL,
    "total" DOUBLE PRECISION NOT NULL,
    "fechaVenta" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Venta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DetalleBoleta" (
    "id" SERIAL NOT NULL,
    "ventaId" INTEGER NOT NULL,
    "eventoEntradaId" INTEGER NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "precioUnitario" DOUBLE PRECISION NOT NULL,
    "subtotal" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DetalleBoleta_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CategoriaEntrada_nombre_key" ON "CategoriaEntrada"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "EventoEntrada_eventoId_categoriaEntradaId_key" ON "EventoEntrada"("eventoId", "categoriaEntradaId");

-- CreateIndex
CREATE UNIQUE INDEX "Venta_codigoQR_key" ON "Venta"("codigoQR");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_username_key" ON "Usuario"("username");

-- AddForeignKey
ALTER TABLE "EventoEntrada" ADD CONSTRAINT "EventoEntrada_eventoId_fkey" FOREIGN KEY ("eventoId") REFERENCES "Evento"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventoEntrada" ADD CONSTRAINT "EventoEntrada_categoriaEntradaId_fkey" FOREIGN KEY ("categoriaEntradaId") REFERENCES "CategoriaEntrada"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Venta" ADD CONSTRAINT "Venta_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DetalleBoleta" ADD CONSTRAINT "DetalleBoleta_ventaId_fkey" FOREIGN KEY ("ventaId") REFERENCES "Venta"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DetalleBoleta" ADD CONSTRAINT "DetalleBoleta_eventoEntradaId_fkey" FOREIGN KEY ("eventoEntradaId") REFERENCES "EventoEntrada"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
