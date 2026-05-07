import { Rol, EstadoApartado, EstadoProyecto, TipoNotificacion } from '@prisma/client'

export type { Rol, EstadoApartado, EstadoProyecto, TipoNotificacion }

export interface SessionUser {
  id: string
  name?: string | null
  email?: string | null
  rol: Rol
}

export interface ApiError {
  error: true
  message: string
  code: string
}

export interface StockInfo {
  stockDisponible: number
  stockApartado: number
  stockLibre: number
}

export interface KPIs {
  valorInventario: number
  articulosEnStock: number
  articulosEnCero: number
  movimientosMes: number
  lotesSinPrecio: number
  apartadosProximosVencer: number
  proyectosActivos: number
}
