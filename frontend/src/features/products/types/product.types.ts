import type { Categoria } from '@/features/categories/types/category.types'

export interface Producto {
  id: number
  nombre: string
  descripcion: string | null
  precio_base: number
  imagen_url: string | null
  stock: number
  disponible: boolean
  categoria_id: number
  activo: boolean
  categoria: Categoria
}

export type ProductoInput = Pick<
  Producto,
  | 'nombre'
  | 'descripcion'
  | 'precio_base'
  | 'imagen_url'
  | 'stock'
  | 'disponible'
  | 'categoria_id'
>