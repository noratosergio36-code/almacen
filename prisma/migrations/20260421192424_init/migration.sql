-- CreateEnum
CREATE TYPE "Rol" AS ENUM ('ADMIN', 'ALMACENISTA', 'USUARIO');

-- CreateEnum
CREATE TYPE "EstadoProyecto" AS ENUM ('ACTIVO', 'PAUSADO', 'CERRADO');

-- CreateEnum
CREATE TYPE "EstadoApartado" AS ENUM ('ACTIVO', 'CONVERTIDO_SALIDA', 'VENCIDO', 'CANCELADO');

-- CreateEnum
CREATE TYPE "TipoNotificacion" AS ENUM ('ENTRADA_SIN_PRECIO', 'APARTADO_VENCIMIENTO', 'STOCK_MINIMO', 'NUEVA_ENTRADA', 'NUEVA_SALIDA');

-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "rol" "Rol" NOT NULL DEFAULT 'USUARIO',
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "telegramChatId" TEXT,
    "telegramUsername" TEXT,
    "avatarUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ubicacion" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "qrCode" TEXT,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Ubicacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Proveedor" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "contacto" TEXT,
    "telefono" TEXT,
    "email" TEXT,
    "notas" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Proveedor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Proyecto" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "responsable" TEXT,
    "estado" "EstadoProyecto" NOT NULL DEFAULT 'ACTIVO',
    "fechaInicio" TIMESTAMP(3),
    "fechaCierre" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Proyecto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Articulo" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "marca" TEXT,
    "numeroParte" TEXT,
    "unidad" TEXT NOT NULL DEFAULT 'pza',
    "fotoUrl" TEXT,
    "stockMinimo" INTEGER,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Articulo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArticuloUbicacion" (
    "id" TEXT NOT NULL,
    "articuloId" TEXT NOT NULL,
    "ubicacionId" TEXT NOT NULL,
    "cantidad" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ArticuloUbicacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Entrada" (
    "id" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usuarioId" TEXT NOT NULL,
    "proveedorId" TEXT,
    "notas" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Entrada_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LoteEntrada" (
    "id" TEXT NOT NULL,
    "entradaId" TEXT NOT NULL,
    "articuloId" TEXT NOT NULL,
    "ubicacionId" TEXT,
    "cantidadOriginal" INTEGER NOT NULL,
    "cantidadDisponible" INTEGER NOT NULL,
    "precioUnitario" DOUBLE PRECISION,
    "precioPendiente" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LoteEntrada_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Salida" (
    "id" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usuarioId" TEXT NOT NULL,
    "proyectoId" TEXT,
    "notas" TEXT,
    "costoTotal" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Salida_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalidaItem" (
    "id" TEXT NOT NULL,
    "salidaId" TEXT NOT NULL,
    "loteEntradaId" TEXT NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "precioUnitario" DOUBLE PRECISION,
    "costoTotal" DOUBLE PRECISION,

    CONSTRAINT "SalidaItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Apartado" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "proyectoId" TEXT,
    "estado" "EstadoApartado" NOT NULL DEFAULT 'ACTIVO',
    "notas" TEXT,
    "fechaExpira" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Apartado_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApartadoItem" (
    "id" TEXT NOT NULL,
    "apartadoId" TEXT NOT NULL,
    "articuloId" TEXT NOT NULL,
    "loteEntradaId" TEXT,
    "cantidad" INTEGER NOT NULL,

    CONSTRAINT "ApartadoItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notificacion" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "tipo" "TipoNotificacion" NOT NULL,
    "titulo" TEXT NOT NULL,
    "mensaje" TEXT NOT NULL,
    "leida" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notificacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT,
    "accion" TEXT NOT NULL,
    "entidad" TEXT NOT NULL,
    "entidadId" TEXT,
    "detalle" JSONB,
    "ip" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_telegramChatId_key" ON "Usuario"("telegramChatId");

-- CreateIndex
CREATE INDEX "Usuario_email_idx" ON "Usuario"("email");

-- CreateIndex
CREATE INDEX "Usuario_rol_idx" ON "Usuario"("rol");

-- CreateIndex
CREATE UNIQUE INDEX "Ubicacion_nombre_key" ON "Ubicacion"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "Proyecto_nombre_key" ON "Proyecto"("nombre");

-- CreateIndex
CREATE INDEX "Articulo_nombre_idx" ON "Articulo"("nombre");

-- CreateIndex
CREATE INDEX "Articulo_marca_idx" ON "Articulo"("marca");

-- CreateIndex
CREATE INDEX "ArticuloUbicacion_articuloId_idx" ON "ArticuloUbicacion"("articuloId");

-- CreateIndex
CREATE INDEX "ArticuloUbicacion_ubicacionId_idx" ON "ArticuloUbicacion"("ubicacionId");

-- CreateIndex
CREATE UNIQUE INDEX "ArticuloUbicacion_articuloId_ubicacionId_key" ON "ArticuloUbicacion"("articuloId", "ubicacionId");

-- CreateIndex
CREATE INDEX "Entrada_fecha_idx" ON "Entrada"("fecha");

-- CreateIndex
CREATE INDEX "Entrada_usuarioId_idx" ON "Entrada"("usuarioId");

-- CreateIndex
CREATE INDEX "LoteEntrada_articuloId_idx" ON "LoteEntrada"("articuloId");

-- CreateIndex
CREATE INDEX "LoteEntrada_precioPendiente_idx" ON "LoteEntrada"("precioPendiente");

-- CreateIndex
CREATE INDEX "LoteEntrada_createdAt_idx" ON "LoteEntrada"("createdAt");

-- CreateIndex
CREATE INDEX "Salida_fecha_idx" ON "Salida"("fecha");

-- CreateIndex
CREATE INDEX "Salida_proyectoId_idx" ON "Salida"("proyectoId");

-- CreateIndex
CREATE INDEX "Apartado_estado_idx" ON "Apartado"("estado");

-- CreateIndex
CREATE INDEX "Apartado_fechaExpira_idx" ON "Apartado"("fechaExpira");

-- CreateIndex
CREATE INDEX "Notificacion_usuarioId_leida_idx" ON "Notificacion"("usuarioId", "leida");

-- CreateIndex
CREATE INDEX "Notificacion_createdAt_idx" ON "Notificacion"("createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_usuarioId_idx" ON "AuditLog"("usuarioId");

-- CreateIndex
CREATE INDEX "AuditLog_entidad_entidadId_idx" ON "AuditLog"("entidad", "entidadId");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- AddForeignKey
ALTER TABLE "ArticuloUbicacion" ADD CONSTRAINT "ArticuloUbicacion_articuloId_fkey" FOREIGN KEY ("articuloId") REFERENCES "Articulo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArticuloUbicacion" ADD CONSTRAINT "ArticuloUbicacion_ubicacionId_fkey" FOREIGN KEY ("ubicacionId") REFERENCES "Ubicacion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Entrada" ADD CONSTRAINT "Entrada_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Entrada" ADD CONSTRAINT "Entrada_proveedorId_fkey" FOREIGN KEY ("proveedorId") REFERENCES "Proveedor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoteEntrada" ADD CONSTRAINT "LoteEntrada_entradaId_fkey" FOREIGN KEY ("entradaId") REFERENCES "Entrada"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoteEntrada" ADD CONSTRAINT "LoteEntrada_articuloId_fkey" FOREIGN KEY ("articuloId") REFERENCES "Articulo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Salida" ADD CONSTRAINT "Salida_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Salida" ADD CONSTRAINT "Salida_proyectoId_fkey" FOREIGN KEY ("proyectoId") REFERENCES "Proyecto"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalidaItem" ADD CONSTRAINT "SalidaItem_salidaId_fkey" FOREIGN KEY ("salidaId") REFERENCES "Salida"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalidaItem" ADD CONSTRAINT "SalidaItem_loteEntradaId_fkey" FOREIGN KEY ("loteEntradaId") REFERENCES "LoteEntrada"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Apartado" ADD CONSTRAINT "Apartado_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Apartado" ADD CONSTRAINT "Apartado_proyectoId_fkey" FOREIGN KEY ("proyectoId") REFERENCES "Proyecto"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApartadoItem" ADD CONSTRAINT "ApartadoItem_apartadoId_fkey" FOREIGN KEY ("apartadoId") REFERENCES "Apartado"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApartadoItem" ADD CONSTRAINT "ApartadoItem_articuloId_fkey" FOREIGN KEY ("articuloId") REFERENCES "Articulo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApartadoItem" ADD CONSTRAINT "ApartadoItem_loteEntradaId_fkey" FOREIGN KEY ("loteEntradaId") REFERENCES "LoteEntrada"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notificacion" ADD CONSTRAINT "Notificacion_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;
