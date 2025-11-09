import { api } from '@/lib/api'

export async function login(username: string, password: string) {
  return api.post('/auth/login', { username, password })
}

export async function register(username: string, password: string) {
  return api.post('/auth/register', { username, password })
}

export async function getMe(token: string) {
  return api.get('/auth/me', token)
}
