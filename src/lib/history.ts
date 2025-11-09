import { api } from '@/lib/api'

export async function getTopWinnersToday(limit: number, token?: string) {
  return api.get(`/history/top-winners-today?limit=${limit}`, token)
}

export async function getDiceHistory(limit: number, token?: string) {
  return api.get(`/history/dice?limit=${limit}`, token)
}

export async function getSessions(limit: number, token?: string) {
  return api.get(`/history/sessions?limit=${limit}`, token)
}
