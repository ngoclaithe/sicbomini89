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

type BetType = 'tai' | 'xiu' | 'chan' | 'le';

interface PlacedBet {
  type: BetType;
  amount: number;
}

export const GameBoard: React.FC<GameBoardProps> = ({ userId, balance, onBalanceUpdate, token }) => {
  const [betAmount, setBetAmount] = useState('10000');
  const [placedBets, setPlacedBets] = useState<PlacedBet[]>([]);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showTopPlayers, setShowTopPlayers] = useState(false);
  const { toast } = useToast();

  const notify = (args: { title: string; description?: string; variant?: 'destructive' | undefined }) => toast(args as any);

  const { countdown, phase, isRolling, diceResults, gameResult, canReveal, bettingStats, placeBet } = useGameSocket({
    onNotify: notify,
    onBalanceUpdate,
  });

  const canPlaceBet = (newBetType: BetType): boolean => {
    const betTypesPlaced = placedBets.map(b => b.type);
    
    if (betTypesPlaced.includes(newBetType)) {
      return false;
    }

    if (newBetType === 'tai' && betTypesPlaced.includes('xiu')) {
      return false;
    }
    if (newBetType === 'xiu' && betTypesPlaced.includes('tai')) {
      return false;
    }
    if (newBetType === 'chan' && betTypesPlaced.includes('le')) {
      return false;
    }
    if (newBetType === 'le' && betTypesPlaced.includes('chan')) {
      return false;
    }

    return true;
  };

  const handlePlaceBet = (bet: BetType) => {
    if (!canPlaceBet(bet)) {
      const restrictions: { [key in BetType]: string } = {
        'tai': 'Không được đặt Tài và Xỉu cùng lúc',
        'xiu': 'Không được đặt Tài và Xỉu cùng lúc',
        'chan': 'Không được đặt Chẵn và Lẻ cùng lúc',
        'le': 'Không được đặt Chẵn và Lẻ cùng lúc',
      };
      toast({
        title: "Cảnh báo",
        description: restrictions[bet],
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

    const totalBetAmount = placedBets.reduce((sum, b) => sum + b.amount, 0);
    if (totalBetAmount + amount > balance) {
      toast({
        title: "Lỗi",
        description: "Số d�� không đủ!",
        variant: "destructive",
      });
      return;
    }

    placeBet({ userId, bet, amount });
    setPlacedBets([...placedBets, { type: bet, amount }]);
  };

  const quickBetAmounts = [10000, 50000, 100000, 500000];

  const getBetLabel = (type: BetType): string => {
    const labels: { [key in BetType]: string } = {
      'tai': 'TÀI',
      'xiu': 'XỈU',
      'chan': 'CHẴN',
      'le': 'LẺ',
    };
    return labels[type];
  };

  const getBetColor = (type: BetType): string => {
    const colors: { [key in BetType]: string } = {
      'tai': 'text-red-500',
      'xiu': 'text-blue-500',
      'chan': 'text-yellow-500',
      'le': 'text-green-500',
    };
    return colors[type];
  };

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

      {/* Countdown Timer */}
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

          {placedBets.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2 text-center text-xs text-gray-400"
            >
              Đã đặt: <span className="font-bold">
                {placedBets.map((b, idx) => (
                  <span key={idx} className={getBetColor(b.type)}>
                    {getBetLabel(b.type)} {formatCurrency(b.amount)}{idx < placedBets.length - 1 ? ', ' : ''}
                  </span>
                ))}
              </span>
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* Main Game Area - 3 columns grid */}
      <div className="grid grid-cols-3 gap-2 items-stretch overflow-x-hidden">
        {/* Left Column - TÀI và CHẴN */}
        <div className="grid grid-rows-2 gap-2 h-full">
          {/* TÀI */}
          <Card className="bg-gradient-to-br from-red-900/30 to-red-800/20 border-2 border-red-500/30 hover:border-red-500/60 transition-all">
            <CardHeader className="pb-2 sm:pb-3">
              <CardTitle className="text-lg sm:text-2xl text-center text-red-500">TÀI</CardTitle>
              <p className="text-center text-xs text-gray-400">11 - 17</p>
            </CardHeader>
            <CardContent className="p-2 sm:p-4 flex flex-col flex-grow">
              <Button
                onClick={() => handlePlaceBet('tai')}
                disabled={phase !== 'betting' || isRolling || !canPlaceBet('tai')}
                className="w-full h-10 sm:h-12 text-sm sm:text-base font-bold bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 disabled:opacity-50"
              >
                Đặt TÀI
              </Button>

              <div className="mt-2 text-center text-xs sm:text-sm text-gray-300 flex-grow flex flex-col justify-center">
                <div className="flex items-center justify-center gap-2">
                  <img src="/group.png" alt="Người đặt" className="w-4 h-4 opacity-80" />
                  <div className="font-semibold text-red-400">{bettingStats.tai.count}</div>
                </div>
                <div className="mt-1 text-red-400 font-semibold">
                  {formatCurrency(bettingStats.tai.totalAmount)}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CHẴN */}
          <Card className="bg-gradient-to-br from-yellow-900/30 to-yellow-800/20 border-2 border-yellow-500/30 hover:border-yellow-500/60 transition-all">
            <CardHeader className="pb-2 sm:pb-3">
              <CardTitle className="text-lg sm:text-2xl text-center text-yellow-500">CHẴN</CardTitle>
              <p className="text-center text-xs text-gray-400">4,6,8,10,12,14,16</p>
            </CardHeader>
            <CardContent className="p-2 sm:p-4 flex flex-col flex-grow">
              <Button
                onClick={() => handlePlaceBet('chan')}
                disabled={phase !== 'betting' || isRolling || !canPlaceBet('chan')}
                className="w-full h-10 sm:h-12 text-sm sm:text-base font-bold bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-500 hover:to-yellow-600 disabled:opacity-50"
              >
                Đặt CHẴN
              </Button>

              <div className="mt-2 text-center text-xs sm:text-sm text-gray-300 flex-grow flex flex-col justify-center">
                <div className="flex items-center justify-center gap-2">
                  <img src="/group.png" alt="Người đặt" className="w-4 h-4 opacity-80" />
                  <div className="font-semibold text-yellow-400">{bettingStats.chan?.count ?? 0}</div>
                </div>
                <div className="mt-1 text-yellow-400 font-semibold">
                  {formatCurrency(bettingStats.chan?.totalAmount ?? 0)}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Middle Column - Dice Roller */}
        <Card className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 overflow-hidden">
          <CardContent className="p-2 sm:p-6 h-full flex flex-col items-center justify-center">
            <DiceRoller
              diceResults={diceResults}
              isRolling={isRolling}
              result={gameResult}
              canReveal={canReveal}
            />
          </CardContent>
        </Card>

        {/* Right Column - XỈU và LẺ */}
        <div className="grid grid-rows-2 gap-2 h-full">
          {/* XỈU */}
          <Card className="bg-gradient-to-br from-blue-900/30 to-blue-800/20 border-2 border-blue-500/30 hover:border-blue-500/60 transition-all">
            <CardHeader className="pb-2 sm:pb-3">
              <CardTitle className="text-lg sm:text-2xl text-center text-blue-500">XỈU</CardTitle>
              <p className="text-center text-xs text-gray-400">4 - 10</p>
            </CardHeader>
            <CardContent className="p-2 sm:p-4 flex flex-col flex-grow">
              <Button
                onClick={() => handlePlaceBet('xiu')}
                disabled={phase !== 'betting' || isRolling || !canPlaceBet('xiu')}
                className="w-full h-10 sm:h-12 text-sm sm:text-base font-bold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 disabled:opacity-50"
              >
                Đặt XỈU
              </Button>

              <div className="mt-2 text-center text-xs sm:text-sm text-gray-300 flex-grow flex flex-col justify-center">
                <div className="flex items-center justify-center gap-2">
                  <img src="/group.png" alt="Người đặt" className="w-4 h-4 opacity-80" />
                  <div className="font-semibold text-blue-400">{bettingStats.xiu.count}</div>
                </div>
                <div className="mt-1 text-blue-400 font-semibold">
                  {formatCurrency(bettingStats.xiu.totalAmount)}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* LẺ */}
          <Card className="bg-gradient-to-br from-green-900/30 to-green-800/20 border-2 border-green-500/30 hover:border-green-500/60 transition-all">
            <CardHeader className="pb-2 sm:pb-3">
              <CardTitle className="text-lg sm:text-2xl text-center text-green-500">LẺ</CardTitle>
              <p className="text-center text-xs text-gray-400">5,7,9,11,13,15,17</p>
            </CardHeader>
            <CardContent className="p-2 sm:p-4 flex flex-col flex-grow">
              <Button
                onClick={() => handlePlaceBet('le')}
                disabled={phase !== 'betting' || isRolling || !canPlaceBet('le')}
                className="w-full h-10 sm:h-12 text-sm sm:text-base font-bold bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 disabled:opacity-50"
              >
                Đặt LẺ
              </Button>

              <div className="mt-2 text-center text-xs sm:text-sm text-gray-300 flex-grow flex flex-col justify-center">
                <div className="flex items-center justify-center gap-2">
                  <img src="/group.png" alt="Người đặt" className="w-4 h-4 opacity-80" />
                  <div className="font-semibold text-green-400">{bettingStats.le?.count ?? 0}</div>
                </div>
                <div className="mt-1 text-green-400 font-semibold">
                  {formatCurrency(bettingStats.le?.totalAmount ?? 0)}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bet Amount Input */}
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
            disabled={phase !== 'betting'}
          />
          <div className="grid grid-cols-4 gap-2">
            {quickBetAmounts.map((amount) => (
              <Button
                key={amount}
                onClick={() => setBetAmount(amount.toString())}
                variant="outline"
                disabled={phase !== 'betting'}
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
