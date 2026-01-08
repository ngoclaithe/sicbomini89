import { api } from '@/lib/api'

export async function adminLogin(username: string, password: string) {
  return api.post('/auth/login', { username, password })
}

export async function adminLogout() {
  return api.post('/auth/logout', {})
}

export async function updateGameConfig(config: { bettingTime?: number; winMultiplier?: number }) {
  return api.put('/admin/game-config', config)
}

export async function setGameResult(diceResults: number[]) {
  return api.post('/admin/set-game-result', { diceResults })
}

export async function getUsers(page = 1, limit = 20) {
  return api.get(`/admin/users?page=${page}&limit=${limit}`)
}

export async function getUserDetail(userId: string) {
  return api.get(`/admin/users/${userId}`)
}

export async function activateInfoPayment(infoId: string) {
  return api.put(`/payment/info/${infoId}/activate`, {})
}

export async function deactivateInfoPayment(infoId: string) {
  return api.put(`/payment/info/${infoId}/deactivate`, {})
}

export async function toggleUserStatus(userId: string) {
  return api.put(`/admin/users/${userId}/toggle-status`, {})
}

export async function adjustUserBalance(userId: string, amount: number) {
  return api.post(`/admin/users/${userId}/adjust-balance`, { amount })
}

export async function getStatistics() {
  return api.get('/admin/statistics')
}

export async function getRecentActivity(limit = 50) {
  return api.get(`/admin/activity?limit=${limit}`)
}

export async function createPaymentInfo(paymentInfo: { bankName: string; accountNumber: string; accountHolder: string }) {
  return api.post('/payment/info/create', paymentInfo)
}

// ===== DEPOSIT APIs =====

export async function createDeposit(data: { amount: number; paymentInfoId: string; note?: string }) {
  return api.post('/admin/deposits', data)
}

export async function approveDeposit(depositId: string, note?: string) {
  return api.post('/admin/deposits/approve', { depositId, note })
}

export async function rejectDeposit(depositId: string, reason: string) {
  return api.post('/admin/deposits/reject', { depositId, reason })
}

export async function getDeposits(status?: 'pending' | 'success' | 'failed') {
  const query = status ? `?status=${status}` : ''
  return api.get(`/admin/deposits${query}`)
}

// ===== WITHDRAWAL APIs =====

export async function createWithdrawal(
  data: {
    amount: number
    bankName: string
    accountNumber: string
    accountHolder: string
    note?: string
  }
) {
  return api.post('/admin/withdrawals', data)
}

export async function approveWithdrawal(withdrawalId: string, note?: string) {
  return api.post('/admin/withdrawals/approve', { withdrawalId, note })
}

export async function rejectWithdrawal(withdrawalId: string, reason: string) {
  return api.post('/admin/withdrawals/reject', { withdrawalId, reason })
}

export async function getWithdrawals(status?: 'pending' | 'success' | 'failed') {
  const query = status ? `?status=${status}` : ''
  return api.get(`/admin/withdrawals${query}`)
}
