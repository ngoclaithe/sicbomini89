import { api } from '@/lib/api'

export async function getTopWinnersToday(limit: number) {
  return api.get(`/history/top-winners-today?limit=${limit}`)
}

export async function getDiceHistory(limit: number) {
  return api.get(`/history/dice?limit=${limit}`)
}

export async function getSessions(limit: number) {
  return api.get(`/history/sessions?limit=${limit}`)
}

export async function getRecentHistory(limit: number) {
  return api.get(`/history?limit=${limit}`)
}

export async function getStatistics() {
  return api.get(`/history/statistics`)
}
