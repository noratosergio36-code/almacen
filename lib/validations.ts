import { z } from 'zod'

export const ArticuloSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
  descripcion: z.string().optional(),
  marca: z.string().optional(),
  numeroParte: z.string().optional(),
  unidad: z.string().min(1).default('pza'),
  stockMinimo: z.number().int().min(0).optional().nullable(),
})

export const UbicacionSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido').max(20),
  descripcion: z.string().optional(),
})

export const ProveedorSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
  contacto: z.string().optional(),
  telefono: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  notas: z.string().optional(),
})

export const ProyectoSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
  descripcion: z.string().optional(),
  responsable: z.string().optional(),
  estado: z.enum(['ACTIVO', 'PAUSADO', 'CERRADO']).default('ACTIVO'),
  fechaInicio: z.string().optional(),
  fechaCierre: z.string().optional(),
})

export const LoteEntradaSchema = z.object({
  articuloId: z.string().min(1),
  ubicacionId: z.string().optional(),
  cantidadOriginal: z.number().int().positive(),
})

export const EntradaSchema = z.object({
  proveedorId: z.string().optional(),
  notas: z.string().optional(),
  lotes: z.array(LoteEntradaSchema).min(1, 'Debe haber al menos un artículo'),
})

export const SalidaItemSchema = z.object({
  articuloId: z.string().min(1),
  cantidad: z.number().int().positive(),
})

export const SalidaSchema = z.object({
  proyectoId: z.string().optional(),
  notas: z.string().optional(),
  items: z.array(SalidaItemSchema).min(1),
  apartadoId: z.string().optional(),
})

export const ApartadoItemSchema = z.object({
  articuloId: z.string().min(1),
  cantidad: z.number().int().positive(),
})

export const ApartadoSchema = z.object({
  proyectoId: z.string().optional(),
  notas: z.string().optional(),
  items: z.array(ApartadoItemSchema).min(1),
})

export const UsuarioSchema = z.object({
  nombre: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8).optional(),
  rol: z.enum(['ADMIN', 'ALMACENISTA', 'USUARIO']),
})

export const PrecioLoteSchema = z.object({
  precioUnitario: z.number().positive(),
})
