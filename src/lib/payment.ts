import { api } from '@/lib/api';

export interface PaymentInfo {
  id: string;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
}

export interface DepositRequest {
  amount: number;
  paymentInfoId: string;
  note?: string;
}

export interface DepositResponse {
  id: string;
  codepay: string;
  status: 'pending' | 'success' | 'failed';
  amount: number;
  paymentInfo: PaymentInfo;
  createdAt: string;
}

export interface WithdrawalRequest {
  amount: number;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  note?: string;
}

export interface WithdrawalResponse {
  id: string;
  amount: number;
  status: 'pending' | 'success' | 'failed';
  createdAt: string;
}

export interface DepositHistory {
  id: string;
  codepay: string;
  amount: number;
  status: 'pending' | 'success' | 'failed';
  approvedAt?: string;
  note?: string;
}

export interface WithdrawalHistory {
  id: string;
  amount: number;
  status: 'pending' | 'success' | 'failed';
  approvedAt?: string;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
}

// User endpoints
export async function createDeposit(
  deposit: DepositRequest,
  token: string
): Promise<DepositResponse> {
  return api.post('/payment/deposit/create', deposit, token);
}

export async function getDepositHistory(token: string): Promise<DepositHistory[]> {
  return api.get('/payment/deposits/user', token);
}

export async function createWithdrawal(
  withdrawal: WithdrawalRequest,
  token: string
): Promise<WithdrawalResponse> {
  return api.post('/payment/withdrawal/create', withdrawal, token);
}

export async function getWithdrawalHistory(token: string): Promise<WithdrawalHistory[]> {
  return api.get('/payment/withdrawals/user', token);
}
