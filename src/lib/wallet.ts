import { api } from '@/lib/api'

export async function getBalance() {
  const res = await api.get('/wallet')
  return Number(res.balance)
}

export async function deposit(amount: number) {
  return api.post('/wallet/deposit', { amount })
}

export async function withdraw(amount: number) {
  return api.post('/wallet/withdraw', { amount })
}

export async function getTransactionHistory() {
  return api.get('/wallet/transactions')
}
