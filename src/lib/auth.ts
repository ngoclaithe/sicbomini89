import { api } from '@/lib/api'

export async function login(username: string, password: string) {
  return api.post('/auth/login', { username, password })
}

export async function register(username: string, password: string) {
  return api.post('/auth/register', { username, password })
}

export async function logout() {
  return api.post('/auth/logout', {})
}

export async function getMe() {
  return api.get('/auth/me')
}
