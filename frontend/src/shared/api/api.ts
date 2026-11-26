import axios from 'axios'

const baseURL = import.meta.env.VITE_API_URL

if (!baseURL) {
  throw new Error('Falta configurar VITE_API_URL en el archivo .env del frontend')
}

export const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: { Accept: 'application/json' },
})

// El JWT viaja exclusivamente en la cookie HttpOnly. JavaScript no lo lee ni lo agrega.
api.interceptors.request.use((config) => config)

export function apiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (error.response?.status === 403) return 'Acceso denegado'

    const detail = (error.response?.data as { detail?: unknown } | undefined)?.detail
    if (typeof detail === 'string') return detail
    if (Array.isArray(detail)) {
      return detail
        .map((item) => (typeof item?.msg === 'string' ? item.msg : String(item)))
        .join('. ')
    }
    if (!error.response) return 'No se pudo conectar con el backend'
    return `La API respondió con error ${error.response.status}`
  }
  return error instanceof Error ? error.message : 'Error inesperado'
}
