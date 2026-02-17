'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import * as HistoryApi from '@/lib/history';
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
      const winnersRes = await HistoryApi.getTopWinnersToday(10);
      setTopWinners(winnersRes);
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách người chơi dẫn đầu",
        variant: "destructive",
      });

    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] sm:max-w-2xl bg-gray-900 border-2 border-primary/30 p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl sm:text-2xl">
            <span>🏆 Người chơi dẫn đầu hôm nay</span>
          </DialogTitle>
          <DialogClose className="absolute right-3 top-3 sm:right-4 sm:top-4 p-2" />
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-10 sm:py-12">
            <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin text-primary" />
          </div>
        ) : topWinners.length > 0 ? (
          <motion.div
            className="space-y-2 sm:space-y-3"
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
                className="flex items-center gap-3 bg-gray-800 rounded-lg p-3 sm:p-4 hover:bg-gray-700/80 transition-all"
              >
                <div className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full text-white font-bold text-base sm:text-lg">
                  {idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm sm:text-base truncate">{winner.username}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-green-500 text-sm sm:text-lg">{formatCurrency(winner.biggestWin)}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-10 sm:py-12 text-gray-400 text-sm">
            Chưa có dữ liệu người chơi dẫn đầu
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
