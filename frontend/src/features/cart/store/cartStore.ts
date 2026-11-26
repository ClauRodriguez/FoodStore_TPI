import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartItem {
  producto_id: number
  nombre: string
  precio_unitario: number
  imagen_url: string | null
  cantidad: number
}

interface CartProduct {
  id: number
  nombre: string
  precio_base: number
  imagen_url: string | null
}

interface CartState {
  items: CartItem[]
  total: number
  agregar: (producto: CartProduct) => void
  quitar: (productoId: number) => void
  cambiarCantidad: (productoId: number, cantidad: number) => void
  vaciar: () => void
}

function validateProductId(productoId: number) {
  if (!Number.isInteger(productoId) || productoId <= 0) {
    throw new RangeError('El ID del producto debe ser un entero positivo')
  }
}

function calculateTotal(items: CartItem[]) {
  return items.reduce(
    (total, item) => total + item.precio_unitario * item.cantidad,
    0,
  )
}

function normalizeCartItem(value: unknown): CartItem | null {
  if (typeof value !== 'object' || value === null) return null

  const item = value as Record<string, unknown>
  if (
    typeof item.producto_id !== 'number' ||
    !Number.isInteger(item.producto_id) ||
    item.producto_id <= 0 ||
    typeof item.nombre !== 'string' ||
    typeof item.precio_unitario !== 'number' ||
    !Number.isFinite(item.precio_unitario) ||
    item.precio_unitario < 0 ||
    typeof item.cantidad !== 'number' ||
    !Number.isInteger(item.cantidad) ||
    item.cantidad <= 0 ||
    (item.imagen_url != null && typeof item.imagen_url !== 'string')
  ) {
    return null
  }

  return {
    producto_id: item.producto_id,
    nombre: item.nombre,
    precio_unitario: item.precio_unitario,
    imagen_url: item.imagen_url ?? null,
    cantidad: item.cantidad,
  }
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      total: 0,

      agregar: (producto) => {
        validateProductId(producto.id)
        if (!producto.nombre.trim()) {
          throw new TypeError('El nombre del producto no puede estar vacío')
        }
        if (!Number.isFinite(producto.precio_base) || producto.precio_base < 0) {
          throw new RangeError('El precio del producto debe ser no negativo')
        }

        set((state) => {
          const existingItem = state.items.find(
            (item) => item.producto_id === producto.id,
          )
          const items = existingItem
            ? state.items.map((item) =>
                item.producto_id === producto.id
                  ? {
                      ...item,
                      nombre: producto.nombre,
                      precio_unitario: producto.precio_base,
                      imagen_url: producto.imagen_url,
                      cantidad: item.cantidad + 1,
                    }
                  : item,
              )
            : [
                ...state.items,
                {
                  producto_id: producto.id,
                  nombre: producto.nombre,
                  precio_unitario: producto.precio_base,
                  imagen_url: producto.imagen_url,
                  cantidad: 1,
                },
              ]

          return { items, total: calculateTotal(items) }
        })
      },

      quitar: (productoId) => {
        validateProductId(productoId)
        set((state) => {
          const items = state.items.filter(
            (item) => item.producto_id !== productoId,
          )
          return { items, total: calculateTotal(items) }
        })
      },

      cambiarCantidad: (productoId, cantidad) => {
        validateProductId(productoId)
        if (!Number.isInteger(cantidad) || cantidad < 0) {
          throw new RangeError('La cantidad debe ser un entero no negativo')
        }

        set((state) => {
          const items =
            cantidad === 0
              ? state.items.filter((item) => item.producto_id !== productoId)
              : state.items.map((item) =>
                  item.producto_id === productoId
                    ? { ...item, cantidad }
                    : item,
                )
          return { items, total: calculateTotal(items) }
        })
      },

      vaciar: () => set({ items: [], total: 0 }),
    }),
    {
      name: 'foodstore-cart',
      version: 3,
      partialize: (state) => ({ items: state.items }),
      migrate: (persistedState) => {
        if (
          typeof persistedState !== 'object' ||
          persistedState === null ||
          !('items' in persistedState) ||
          !Array.isArray(persistedState.items)
        ) {
          return { items: [] }
        }

        return {
          items: persistedState.items
            .map(normalizeCartItem)
            .filter((item): item is CartItem => item !== null),
        }
      },
      merge: (persistedState, currentState) => {
        const persistedItems =
          typeof persistedState === 'object' &&
          persistedState !== null &&
          'items' in persistedState &&
          Array.isArray(persistedState.items)
            ? persistedState.items
                .map(normalizeCartItem)
                .filter((item): item is CartItem => item !== null)
            : []
        return {
          ...currentState,
          items: persistedItems,
          total: calculateTotal(persistedItems),
        }
      },
    },
  ),
)
