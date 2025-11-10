import { api } from '@/lib/api'

export async function adminLogin(username: string, password: string) {
  return api.post('/auth/login', { username, password })
}

export async function adminLogout(token: string) {
  return api.post('/auth/logout', {}, token)
}

export async function updateGameConfig(token: string, config: { bettingTime?: number; winMultiplier?: number }) {
  return api.put('/admin/game-config', config, token)
}

export async function setGameResult(token: string, diceResults: number[]) {
  return api.post('/admin/set-game-result', { diceResults }, token)
}

export async function getUsers(token: string, page = 1, limit = 20) {
  return api.get(`/admin/users?page=${page}&limit=${limit}`, token)
}

export async function getUserDetail(token: string, userId: string) {
  return api.get(`/admin/users/${userId}`, token)
}

export async function activateInfoPayment(token: string, infoId: string) {
  return api.put(`/payment/info/${infoId}/activate`, {}, token)
}
export async function deactivateInfoPayment(token: string, infoId: string) {
  return api.put(`/payment/info/${infoId}/deactivate`, {}, token)
}
export async function toggleUserStatus(token: string, userId: string) {
  return api.put(`/admin/users/${userId}/toggle-status`, {}, token)
}

export async function adjustUserBalance(token: string, userId: string, amount: number) {
  return api.post(`/admin/users/${userId}/adjust-balance`, { amount }, token)
}

export async function getStatistics(token: string) {
  return api.get('/admin/statistics', token)
}

export async function getRecentActivity(token: string, limit = 50) {
  return api.get(`/admin/activity?limit=${limit}`, token)
}

export async function createPaymentInfo(token: string, paymentInfo: { bankName: string; accountNumber: string; accountHolder: string }) {
  return api.post('/payment/info/create', paymentInfo, token)
}

export async function approveDeposit(token: string, depositId: string, note?: string) {
  return api.put(`/payment/deposit/${depositId}/approve`, { depositId, note }, token)
}

export async function rejectDeposit(token: string, depositId: string, reason: string) {
  return api.put(`/payment/deposit/${depositId}/reject`, { depositId, reason }, token)
}

export async function approveWithdrawal(token: string, withdrawalId: string, note?: string) {
  return api.put(`/payment/withdrawal/${withdrawalId}/approve`, { withdrawalId, note }, token)
}

export async function rejectWithdrawal(token: string, withdrawalId: string, reason: string) {
  return api.put(`/payment/withdrawal/${withdrawalId}/reject`, { withdrawalId, reason }, token)
}
