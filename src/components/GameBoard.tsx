'use client';

import React, { useState, useEffect } from 'react';
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
  const [winningBets, setWinningBets] = useState<BetType[]>([]);
  const { toast } = useToast();

  const notify = (args: { title: string; description?: string; variant?: 'destructive' | undefined }) => toast(args as any);

  const { countdown, phase, isRolling, diceResults, gameResult, canReveal, bettingStats, placeBet, lastSessionId } = useGameSocket({
    onNotify: notify,
    onBalanceUpdate,
  });

  // Reset placed bets when session starts
  useEffect(() => {
    setPlacedBets([]);
    setWinningBets([]);
  }, [lastSessionId]);

  // Calculate winning bets based on dice results
  useEffect(() => {
    if (!diceResults || diceResults.length === 0) {
      setWinningBets([]);
      return;
    }

    const sum = diceResults.reduce((acc, val) => acc + val, 0);
    const isEven = sum % 2 === 0;
    const isBig = sum > 10;

    const winning: BetType[] = [];
    if (isBig) winning.push('tai');
    if (!isBig) winning.push('xiu');
    if (isEven) winning.push('chan');
    if (!isEven) winning.push('le');

    setWinningBets(winning);
  }, [diceResults]);

  const canPlaceBet = (newBetType: BetType): boolean => {
    // Check conflicting bet types
    if (newBetType === 'tai' && placedBets.some(b => b.type === 'xiu')) {
      return false;
    }
    if (newBetType === 'xiu' && placedBets.some(b => b.type === 'tai')) {
      return false;
    }
    if (newBetType === 'chan' && placedBets.some(b => b.type === 'le')) {
      return false;
    }
    if (newBetType === 'le' && placedBets.some(b => b.type === 'chan')) {
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
        description: "Số dư không đủ!",
        variant: "destructive",
      });
      return;
    }

    placeBet({ userId, bet, amount });
    setPlacedBets([...placedBets, { type: bet, amount }]);
  };

  const getQuickBetAmounts = () => {
    return [1000, 5000, 10000, 50000, 100000, 200000, 500000, 1000000, 5000000];
  };

  const handleAllIn = () => {
    const totalBetAmount = placedBets.reduce((sum, b) => sum + b.amount, 0);
    const maxCanBet = balance - totalBetAmount;
    setBetAmount(Math.max(0, maxCanBet).toString());
  };

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

        </CardContent>
      </Card>

      {/* Main Game Area - 3 columns grid */}
      <div className="grid grid-cols-3 gap-2 items-stretch overflow-x-hidden">
        {/* Left Column - TÀI và CHẴN */}
        <div className="grid grid-rows-2 gap-2 h-full">
          {/* TÀI */}
          <motion.div
            onClick={() => handlePlaceBet('tai')}
            className={`cursor-pointer ${
              winningBets.includes('tai')
                ? 'animate-pulse'
                : ''
            }`}
            whileHover={
              phase === 'betting' && !isRolling && canPlaceBet('tai')
                ? {}
                : {}
            }
          >
            <Card
              className={`bg-gradient-to-br from-red-900/30 to-red-800/20 border-2 transition-all ${
                winningBets.includes('tai')
                  ? 'border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.8)] bg-red-900/50'
                  : 'border-red-500/30 hover:border-red-500 hover:shadow-[0_0_20px_rgba(239,68,68,0.5)]'
              } ${
                phase === 'betting' && !isRolling && canPlaceBet('tai')
                  ? ''
                  : 'opacity-60'
              }`}
            >
              <CardHeader className="pb-2 sm:pb-3">
                <CardTitle className="text-lg sm:text-2xl text-center text-red-500">TÀI</CardTitle>
              </CardHeader>
              <CardContent className="p-2 sm:p-4 flex flex-col flex-grow">
                <div className="text-center text-xs sm:text-sm text-gray-300 flex-grow flex flex-col justify-center">
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
          </motion.div>

          {/* CHẴN */}
          <motion.div
            onClick={() => handlePlaceBet('chan')}
            className={`cursor-pointer ${
              winningBets.includes('chan')
                ? 'animate-pulse'
                : ''
            }`}
            whileHover={
              phase === 'betting' && !isRolling && canPlaceBet('chan')
                ? {}
                : {}
            }
          >
            <Card
              className={`bg-gradient-to-br from-yellow-900/30 to-yellow-800/20 border-2 transition-all ${
                winningBets.includes('chan')
                  ? 'border-yellow-500 shadow-[0_0_30px_rgba(234,179,8,0.8)] bg-yellow-900/50'
                  : 'border-yellow-500/30 hover:border-yellow-500 hover:shadow-[0_0_20px_rgba(234,179,8,0.5)]'
              } ${
                phase === 'betting' && !isRolling && canPlaceBet('chan')
                  ? ''
                  : 'opacity-60'
              }`}
            >
              <CardHeader className="pb-2 sm:pb-3">
                <CardTitle className="text-lg sm:text-2xl text-center text-yellow-500">CHẴN</CardTitle>
              </CardHeader>
              <CardContent className="p-2 sm:p-4 flex flex-col flex-grow">
                <div className="text-center text-xs sm:text-sm text-gray-300 flex-grow flex flex-col justify-center">
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
          </motion.div>
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
          <motion.div
            onClick={() => handlePlaceBet('xiu')}
            className={`cursor-pointer ${
              winningBets.includes('xiu')
                ? 'animate-pulse'
                : ''
            }`}
            whileHover={
              phase === 'betting' && !isRolling && canPlaceBet('xiu')
                ? {}
                : {}
            }
          >
            <Card
              className={`bg-gradient-to-br from-blue-900/30 to-blue-800/20 border-2 transition-all ${
                winningBets.includes('xiu')
                  ? 'border-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.8)] bg-blue-900/50'
                  : 'border-blue-500/30 hover:border-blue-500 hover:shadow-[0_0_20px_rgba(59,130,246,0.5)]'
              } ${
                phase === 'betting' && !isRolling && canPlaceBet('xiu')
                  ? ''
                  : 'opacity-60'
              }`}
            >
              <CardHeader className="pb-2 sm:pb-3">
                <CardTitle className="text-lg sm:text-2xl text-center text-blue-500">XỈU</CardTitle>
              </CardHeader>
              <CardContent className="p-2 sm:p-4 flex flex-col flex-grow">
                <div className="text-center text-xs sm:text-sm text-gray-300 flex-grow flex flex-col justify-center">
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
          </motion.div>

          {/* LẺ */}
          <motion.div
            onClick={() => handlePlaceBet('le')}
            className={`cursor-pointer ${
              winningBets.includes('le')
                ? 'animate-pulse'
                : ''
            }`}
            whileHover={
              phase === 'betting' && !isRolling && canPlaceBet('le')
                ? {}
                : {}
            }
          >
            <Card
              className={`bg-gradient-to-br from-green-900/30 to-green-800/20 border-2 transition-all ${
                winningBets.includes('le')
                  ? 'border-green-500 shadow-[0_0_30px_rgba(34,197,94,0.8)] bg-green-900/50'
                  : 'border-green-500/30 hover:border-green-500 hover:shadow-[0_0_20px_rgba(34,197,94,0.5)]'
              } ${
                phase === 'betting' && !isRolling && canPlaceBet('le')
                  ? ''
                  : 'opacity-60'
              }`}
            >
              <CardHeader className="pb-2 sm:pb-3">
                <CardTitle className="text-lg sm:text-2xl text-center text-green-500">LẺ</CardTitle>
              </CardHeader>
              <CardContent className="p-2 sm:p-4 flex flex-col flex-grow">
                <div className="text-center text-xs sm:text-sm text-gray-300 flex-grow flex flex-col justify-center">
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
          </motion.div>
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
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            {getQuickBetAmounts().map((amount) => (
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
            <Button
              onClick={handleAllIn}
              variant="outline"
              disabled={phase !== 'betting'}
              className="h-8 text-xs bg-gradient-to-r from-amber-600/20 to-amber-700/20 border-amber-500 text-amber-400 hover:bg-amber-600/30"
            >
              ALL IN
            </Button>
          </div>
          <div className="text-sm text-gray-400 text-center">
            Số dư: <span className="text-primary font-bold">{formatCurrency(balance)}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
