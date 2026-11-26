import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api, apiErrorMessage } from '@/shared/api/api'
import { useNotificationStore } from '@/store/notificationStore'
import { useAuthStore } from '@/features/auth'
import type { Categoria, CategoriaInput } from '../types/category.types'

interface UseCategoriesOptions {
  includeInactive?: boolean
}

export function useCategories({
  includeInactive = false,
}: UseCategoriesOptions = {}) {
  const queryClient = useQueryClient()
  const showNotification = useNotificationStore((state) => state.showNotification)
  const isAdmin = useAuthStore((state) => state.user?.role === 'admin')
  const shouldIncludeInactive = includeInactive && isAdmin
  const query = useQuery({
    queryKey: shouldIncludeInactive ? ['categorias', 'admin'] : ['categorias'],
    queryFn: async () =>
      (
        await api.get<Categoria[]>(
          shouldIncludeInactive ? '/categorias/admin' : '/categorias',
        )
      ).data,
  })
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['categorias'] })
  const createMutation = useMutation({
    mutationFn: async (data: CategoriaInput) =>
      (await api.post<Categoria>('/categorias', data)).data,
    onSuccess: async () => {
      await invalidate()
      showNotification('Categoría creada')
    },
    onError: (error) => showNotification(apiErrorMessage(error)),
  })
  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number
      data: CategoriaInput
    }) => (await api.put<Categoria>(`/categorias/${id}`, data)).data,
    onSuccess: async () => {
      await invalidate()
      showNotification('Categoría actualizada')
    },
    onError: (error) => showNotification(apiErrorMessage(error)),
  })
  const statusMutation = useMutation({
    mutationFn: async ({
      id,
      activo,
    }: {
      id: number
      activo: boolean
    }) =>
      (await api.patch<Categoria>(`/categorias/${id}`, { activo })).data,
    onSuccess: async (_categoria, variables) => {
      await invalidate()
      showNotification(
        variables.activo ? 'Categoría activada' : 'Categoría desactivada',
      )
    },
    onError: (error) => showNotification(apiErrorMessage(error)),
  })

  return {
    categories: query.data ?? [],
    isLoading: query.isPending,
    error: query.isError ? apiErrorMessage(query.error) : null,
    refetch: query.refetch,
    isAdmin,
    createCategory: createMutation.mutateAsync,
    updateCategory: (id: number, data: CategoriaInput) =>
      updateMutation.mutateAsync({ id, data }),
    setCategoryActive: (id: number, activo: boolean) =>
      statusMutation.mutateAsync({ id, activo }),
    isUpdatingStatus: statusMutation.isPending,
    updatingStatusId: statusMutation.isPending
      ? statusMutation.variables.id
      : null,
    isSaving: createMutation.isPending || updateMutation.isPending,
  }
}
