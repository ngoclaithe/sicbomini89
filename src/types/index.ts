export interface User {
  id: string;
  username: string;
  email: string;
  role: 'USER' | 'ADMIN';
}

export interface Wallet {
  id: string;
  balance: number;
}

export interface Game {
  id: string;
  roundNumber: number;
  status: 'WAITING' | 'BETTING' | 'ROLLING' | 'FINISHED';
  dice1?: number;
  dice2?: number;
  dice3?: number;
  total?: number;
  result?: 'TAI' | 'XIU';
}

export interface Bet {
  id: string;
  betType: 'TAI' | 'XIU' | 'CHAN' | 'LE';
  amount: number;
  isWin?: boolean;
  payout?: number;
}
