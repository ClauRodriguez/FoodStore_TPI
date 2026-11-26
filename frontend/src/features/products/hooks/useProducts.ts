import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api, apiErrorMessage } from '@/shared/api/api'
import { useNotificationStore } from '@/store/notificationStore'
import type { Producto, ProductoInput } from '../types/product.types'

interface ProductosPaginados {
  total: number
  items: Producto[]
}

interface ProductosFiltros {
  skip?: number
  limit?: number
  search?: string
  categoria_id?: number
  disponible?: boolean
}

export interface ProductoStockInput {
  stock: number
  disponible: boolean
}

export function useProducts(filters: ProductosFiltros = {}) {
  const queryClient = useQueryClient()
  const showNotification = useNotificationStore((state) => state.showNotification)

  const skip = filters.skip ?? 0
  const limit = filters.limit ?? 20
  const search = filters.search?.trim()
  const params = {
    skip,
    limit,
    search: search || undefined,
    categoria_id: filters.categoria_id,
    disponible: filters.disponible,
  }

  const query = useQuery({
    queryKey: ['productos', params],
    queryFn: async () =>
      (await api.get<ProductosPaginados>('/productos', { params })).data,
  })

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['productos'] })

  const createMutation = useMutation({
    mutationFn: async (data: ProductoInput) =>
      (await api.post<Producto>('/productos', data)).data,
    onSuccess: async () => {
      await invalidate()
      showNotification('Producto creado')
    },
    onError: (error) => showNotification(apiErrorMessage(error)),
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: ProductoInput }) =>
      (await api.put<Producto>(`/productos/${id}`, data)).data,
    onSuccess: async () => {
      await invalidate()
      showNotification('Producto actualizado')
    },
    onError: (error) => showNotification(apiErrorMessage(error)),
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/productos/${id}`)
    },
    onSuccess: async () => {
      await invalidate()
      showNotification('Producto eliminado')
    },
    onError: (error) => showNotification(apiErrorMessage(error)),
  })

  const updateStockMutation = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number
      data: ProductoStockInput
    }) =>
      (await api.patch<Producto>(`/productos/${id}/stock`, data)).data,
    onSuccess: async () => {
      await invalidate()
      showNotification('Stock y disponibilidad actualizados')
    },
    onError: (error) => showNotification(apiErrorMessage(error)),
  })

  return {
    products: query.data?.items ?? [],
    total: query.data?.total ?? 0,
    isLoading: query.isPending,
    error: query.isError ? apiErrorMessage(query.error) : null,
    refetch: query.refetch,
    createProduct: createMutation.mutateAsync,
    updateProduct: (id: number, data: ProductoInput) =>
      updateMutation.mutateAsync({ id, data }),
    deleteProduct: deleteMutation.mutate,
    updateProductStock: (id: number, data: ProductoStockInput) =>
      updateStockMutation.mutate({ id, data }),
    isUpdatingStock: updateStockMutation.isPending,
    isSaving: createMutation.isPending || updateMutation.isPending,
    deletingId: deleteMutation.isPending ? deleteMutation.variables : null,
  }
}