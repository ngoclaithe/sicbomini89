'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DiceRoller } from './DiceRoller';
import { Analytics } from './Analytics';
import { TopPlayers } from './TopPlayers';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import { Clock, Wallet, BarChart3, Trophy, Coins } from 'lucide-react';
import { motion } from 'framer-motion';
import { useGameSocket } from '@/hooks/useGameSocket';

interface GameBoardProps {
  userId: string;
  balance: number;
  onBalanceUpdate: () => void;
  token?: string;
}

export const GameBoard: React.FC<GameBoardProps> = ({ userId, balance, onBalanceUpdate, token }) => {
  const [betAmount, setBetAmount] = useState('10000');
  const [selectedBet, setSelectedBet] = useState<'tai' | 'xiu' | null>(null);
  const [hasBet, setHasBet] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showTopPlayers, setShowTopPlayers] = useState(false);
  const { toast } = useToast();

  const notify = (args: { title: string; description?: string; variant?: 'destructive' | undefined }) => toast(args as any);

  const { countdown, phase, isRolling, diceResults, gameResult, canReveal, bettingStats, placeBet } = useGameSocket({
    onNotify: notify,
    onBalanceUpdate,
  });


  const handlePlaceBet = (bet: 'tai' | 'xiu') => {
    if (hasBet) {
      toast({
        title: "Cảnh báo",
        description: "Bạn đã đặt cược cho phiên này rồi!",
        variant: "destructive",
      });
      return;
    }

    if (phase !== 'betting') {
      toast({
        title: "Cảnh báo",
        description: "Đã hết thời gian đặt cược!",
        variant: "destructive",
      });
      return;
    }

    const amount = parseFloat(betAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Lỗi",
        description: "Số tiền không hợp lệ!",
        variant: "destructive",
      });
      return;
    }

    if (amount > balance) {
      toast({
        title: "Lỗi",
        description: "Số dư không đủ!",
        variant: "destructive",
      });
      return;
    }

    placeBet({ userId, bet, amount });
    setSelectedBet(bet);
    setHasBet(true);
  };

  const quickBetAmounts = [10000, 50000, 100000, 500000];

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Analytics Modal */}
      <Analytics
        isOpen={showAnalytics}
        onClose={() => setShowAnalytics(false)}
        token={token}
      />

      {/* Top Players Modal */}
      <TopPlayers
        isOpen={showTopPlayers}
        onClose={() => setShowTopPlayers(false)}
        token={token}
      />

      {/* Countdown Timer - Thu gọn */}
      <Card className="border-2 border-primary/50 bg-gradient-to-br from-gray-900 to-gray-800">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              <Clock className="w-6 h-6 text-primary animate-pulse" />
              <div className="text-center flex-1">
                <div className="text-xs text-gray-400 mb-1">
                  {phase === 'betting' ? 'Thời gian đặt cược' : 'Xem kết quả'}
                </div>
                <motion.div
                  key={countdown}
                  initial={{ scale: 1.3, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className={`text-3xl font-bold ${
                    countdown <= 5 && phase === 'betting' ? 'text-red-500' : 'text-primary'
                  }`}
                >
                  {countdown}s
                </motion.div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setShowAnalytics(true)}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <BarChart3 className="w-4 h-4" />
              </Button>
              <Button
                onClick={() => setShowTopPlayers(true)}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <Trophy className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {hasBet && selectedBet && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2 text-center text-xs text-gray-400"
            >
              Đã đặt: <span className={`font-bold ${selectedBet === 'tai' ? 'text-red-500' : 'text-blue-500'}`}>
                {selectedBet.toUpperCase()}
              </span> - {formatCurrency(parseFloat(betAmount))}
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* Main Game Area - DiceRoller LUÔN ở giữa Tài và Xỉu */}
      <div className="grid grid-cols-3 gap-2 items-stretch overflow-x-auto">
        {/* TÀI - Bên trái */}
        <Card className="min-w-0 bg-gradient-to-br from-red-900/30 to-red-800/20 border-2 border-red-500/30 hover:border-red-500/60 transition-all h-full">
          <CardHeader className="pb-2 sm:pb-3">
            <CardTitle className="text-lg sm:text-2xl text-center text-red-500">TÀI</CardTitle>
            <p className="text-center text-xs text-gray-400">11 - 17</p>
          </CardHeader>
          <CardContent className="p-2 sm:p-6">
            <Button
              onClick={() => handlePlaceBet('tai')}
              disabled={phase !== 'betting' || hasBet || isRolling}
              className="w-full h-10 sm:h-14 text-sm sm:text-lg font-bold bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 disabled:opacity-50"
              size="lg"
            >
              Đặt TÀI
            </Button>

            <div className="mt-3 text-center text-xs sm:text-sm text-gray-300">
              <div className="flex items-center justify-center gap-2">
                <img src="/group.png" alt="Người đặt" className="w-4 h-4 opacity-80" />
                <div className="font-semibold text-red-400">{bettingStats.tai.count}</div>
              </div>
              <div className="mt-1 text-red-400 font-semibold">
                {formatCurrency(bettingStats.tai.totalAmount)}
              </div>
              <div className="flex justify-center mt-1">
                <Coins className="w-4 h-4 text-red-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dice Roller - Ở giữa */}
        <Card className="min-w-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 overflow-visible">
          <CardContent className="p-2 sm:p-6">
            <DiceRoller
              diceResults={diceResults}
              isRolling={isRolling}
              result={gameResult}
              canReveal={canReveal}
            />
          </CardContent>
        </Card>

        {/* XỈU - Bên phải */}
        <Card className="min-w-0 bg-gradient-to-br from-blue-900/30 to-blue-800/20 border-2 border-blue-500/30 hover:border-blue-500/60 transition-all h-full">
          <CardHeader className="pb-2 sm:pb-3">
            <CardTitle className="text-lg sm:text-2xl text-center text-blue-500">XỈU</CardTitle>
            <p className="text-center text-xs text-gray-400">4 - 10</p>
          </CardHeader>
          <CardContent className="p-2 sm:p-6">
            <Button
              onClick={() => handlePlaceBet('xiu')}
              disabled={phase !== 'betting' || hasBet || isRolling}
              className="w-full h-10 sm:h-14 text-sm sm:text-lg font-bold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 disabled:opacity-50"
              size="lg"
            >
              Đặt XỈU
            </Button>

            <div className="mt-3 text-center text-xs sm:text-sm text-gray-300">
              <div className="flex items-center justify-center gap-2">
                <img src="/group.png" alt="Người đặt" className="w-4 h-4 opacity-80" />
                <div className="font-semibold text-blue-400">{bettingStats.xiu.count}</div>
              </div>
              <div className="mt-1 text-blue-400 font-semibold">
                {formatCurrency(bettingStats.xiu.totalAmount)}
              </div>
              <div className="flex justify-center mt-1">
                <Coins className="w-4 h-4 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bet Amount Input - Dưới cùng */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Wallet className="w-4 h-4" />
            Số tiền cược
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input
            type="number"
            value={betAmount}
            onChange={(e) => setBetAmount(e.target.value)}
            placeholder="Nhập số tiền"
            className="text-lg h-10"
            disabled={hasBet || phase !== 'betting'}
          />
          <div className="grid grid-cols-4 gap-2">
            {quickBetAmounts.map((amount) => (
              <Button
                key={amount}
                onClick={() => setBetAmount(amount.toString())}
                variant="outline"
                disabled={hasBet || phase !== 'betting'}
                className="h-8 text-xs"
              >
                {formatNumber(amount)}
              </Button>
            ))}
          </div>
          <div className="text-sm text-gray-400 text-center">
            Số dư: <span className="text-primary font-bold">{formatCurrency(balance)}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
