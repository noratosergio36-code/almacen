import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number | null | undefined): string {
  if (value == null) return '—'
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value)
}

export function formatDate(date: Date | string): string {
  return format(new Date(date), 'dd MMM yyyy', { locale: es })
}

export function formatDateTime(date: Date | string): string {
  return format(new Date(date), "dd MMM yyyy 'a las' HH:mm", { locale: es })
}

export function errorResponse(message: string, code: string, status = 400) {
  return Response.json({ error: true, message, code }, { status })
}

export function successResponse(data: unknown, status = 200) {
  return Response.json(data, { status })
}
