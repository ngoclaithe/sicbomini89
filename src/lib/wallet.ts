import { api } from '@/lib/api'

export async function getBalance(token: string) {
  const res = await api.get('/wallet', token)
  return Number(res.balance)
}

export async function deposit(amount: number, token: string) {
  return api.post('/wallet/deposit', { amount }, token)
}

export async function withdraw(amount: number, token: string) {
  return api.post('/wallet/withdraw', { amount }, token)
}
