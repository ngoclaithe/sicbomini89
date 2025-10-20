'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { History, TrendingUp, TrendingDown } from 'lucide-react';
import { motion } from 'framer-motion';

interface GameHistoryProps {
  token: string;
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
      const data = await api.get('/history?limit=10', token);
      setHistory(data);
    } catch (error) {
      console.error('Error loading history:', error);
    }
  };

  const loadStats = async () => {
    try {
      const data = await api.get('/history/statistics', token);
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{stats.totalGames}</div>
              <div className="text-sm text-gray-400">Tổng ván</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-500">{stats.wins}</div>
              <div className="text-sm text-gray-400">Thắng</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-500">{stats.losses}</div>
              <div className="text-sm text-gray-400">Thua</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-500">{stats.winRate}%</div>
              <div className="text-sm text-gray-400">Tỷ lệ thắng</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* History List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5" />
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
                className={`p-4 rounded-lg border-2 ${
                  item.isWin 
                    ? 'bg-green-900/20 border-green-500/30' 
                    : 'bg-red-900/20 border-red-500/30'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {item.isWin ? (
                      <TrendingUp className="w-5 h-5 text-green-500" />
                    ) : (
                      <TrendingDown className="w-5 h-5 text-red-500" />
                    )}
                    <div>
                      <div className="font-semibold">
                        {item.result === 'tai' ? '🔴 TÀI' : '🔵 XỈU'} - {item.totalPoints} điểm
                      </div>
                      <div className="text-sm text-gray-400">
                        Đặt: {item.userBet.toUpperCase()} - {formatCurrency(item.betAmount)}
                      </div>
                    </div>
                  </div>
                  <div className={`text-lg font-bold ${item.isWin ? 'text-green-500' : 'text-red-500'}`}>
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