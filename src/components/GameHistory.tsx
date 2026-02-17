'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import * as HistoryApi from '@/lib/history';
import { formatCurrency } from '@/lib/utils';
import { History, TrendingUp, TrendingDown } from 'lucide-react';
import { motion } from 'framer-motion';

interface GameHistoryProps {
  token?: string;
}

export const GameHistory: React.FC<GameHistoryProps> = ({ token }) => {
  const [history, setHistory] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    loadHistory();
    loadStats();
  }, []);

  const loadHistory = async () => {
    try {
      const data = await HistoryApi.getRecentHistory(10, token);
      setHistory(data);
    } catch (error) {
      console.error('Error loading history:', error);
    }
  };

  const loadStats = async () => {
    try {
      const data = await HistoryApi.getStatistics(token);
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  return (
    <div className="space-y-6">
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <Card>
            <CardContent className="p-3 sm:p-4 text-center">
              <div className="text-xl sm:text-2xl font-bold text-primary">{stats.totalGames}</div>
              <div className="text-xs sm:text-sm text-gray-400">Tổng ván</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 sm:p-4 text-center">
              <div className="text-xl sm:text-2xl font-bold text-green-500">{stats.wins}</div>
              <div className="text-xs sm:text-sm text-gray-400">Thắng</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 sm:p-4 text-center">
              <div className="text-xl sm:text-2xl font-bold text-red-500">{stats.losses}</div>
              <div className="text-xs sm:text-sm text-gray-400">Thua</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 sm:p-4 text-center">
              <div className="text-xl sm:text-2xl font-bold text-yellow-500">{stats.winRate}%</div>
              <div className="text-xs sm:text-sm text-gray-400">Tỷ lệ thắng</div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader className="pb-3 sm:pb-4">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <History className="w-4 h-4 sm:w-5 sm:h-5" />
            Lịch sử chơi gần đây
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {history.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`p-3 sm:p-4 rounded-lg border-2 ${item.isWin
                    ? 'bg-green-900/20 border-green-500/30'
                    : 'bg-red-900/20 border-red-500/30'
                  }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
                  <div className="flex items-center gap-3">
                    {item.isWin ? (
                      <TrendingUp className="w-5 h-5 text-green-500" />
                    ) : (
                      <TrendingDown className="w-5 h-5 text-red-500" />
                    )}
                    <div>
                      <div className="font-semibold text-sm sm:text-base">
                        {item.result === 'tai' ? '🔴 TÀI' : '🔵 XỈU'} - {item.totalPoints} điểm
                      </div>
                      <div className="text-xs sm:text-sm text-gray-400">
                        Đặt: {item.userBet.toUpperCase()} - {formatCurrency(item.betAmount)}
                      </div>
                    </div>
                  </div>
                  <div className={`text-base sm:text-lg font-bold ${item.isWin ? 'text-green-500' : 'text-red-500'}`}>
                    {item.isWin ? '+' : '-'}{formatCurrency(Math.abs(item.isWin ? item.winAmount - item.betAmount : item.betAmount))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
