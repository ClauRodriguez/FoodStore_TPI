export interface UsuarioAuth {
  id: number
  username: string
  full_name: string
  email: string
  role: string
  disabled: boolean
  created_at: string
}
export interface LoginCredentials { username: string; password: string }
export interface RegisterInput { username: string; full_name: string; email: string; password: string }
export type AdminUser = UsuarioAuth
