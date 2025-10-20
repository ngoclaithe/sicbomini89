'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface TopPlayersProps {
  isOpen: boolean;
  onClose: () => void;
  token?: string;
}

interface TopWinner {
  userId: string;
  username: string;
  totalWin: number;
  totalGames: number;
  wins: number;
  winRate: string;
  biggestWin: number;
}

export const TopPlayers: React.FC<TopPlayersProps> = ({ isOpen, onClose, token }) => {
  const [topWinners, setTopWinners] = useState<TopWinner[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      loadTopWinners();
    }
  }, [isOpen]);

  const loadTopWinners = async () => {
    setLoading(true);
    try {
      const winnersRes = await api.get('/history/top-winners-today?limit=10', token);
      setTopWinners(winnersRes);
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách người chơi dẫn đầu",
        variant: "destructive",
      });
      console.error('Error loading top winners:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-gray-900 border-2 border-primary/30">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <span>🏆 Người chơi dẫn đầu hôm nay</span>
          </DialogTitle>
          <DialogClose className="absolute right-4 top-4 p-2" />
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : topWinners.length > 0 ? (
          <motion.div
            className="space-y-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {topWinners.map((winner, idx) => (
              <motion.div
                key={winner.userId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-center gap-3 bg-gray-800 rounded-lg p-4 hover:bg-gray-700/80 transition-all"
              >
                <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full text-white font-bold text-lg">
                  {idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-base truncate">{winner.username}</div>
                  <div className="text-xs text-gray-400">
                    {winner.wins} thắng / {winner.totalGames} ván ({winner.winRate})
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-green-500 text-lg">{formatCurrency(winner.biggestWin)}</div>
                  <div className="text-xs text-gray-400">Thắng lớn nhất</div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-12 text-gray-400">
            Chưa có dữ liệu người chơi dẫn đầu
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
