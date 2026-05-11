CREATE TYPE "TipoSeparador" AS ENUM ('NINGUNO', 'PASILLO', 'MURO');

CREATE TABLE "separador_fila" (
  "id"     TEXT NOT NULL,
  "prefix" TEXT NOT NULL,
  "tipo"   "TipoSeparador" NOT NULL DEFAULT 'NINGUNO',
  CONSTRAINT "separador_fila_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "separador_fila_prefix_key" ON "separador_fila"("prefix");
