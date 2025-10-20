'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/lib/api';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface AnalyticsProps {
  isOpen: boolean;
  onClose: () => void;
  token?: string;
}

interface DiceData {
  dice1: number[];
  dice2: number[];
  dice3: number[];
  total: number;
}

interface SessionData {
  sessionId: string;
  totalPoints: number;
  result: 'tai' | 'xiu';
  diceResults: number[];
  createdAt: string;
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

export const Analytics: React.FC<AnalyticsProps> = ({ isOpen, onClose, token }) => {
  const [diceData, setDiceData] = useState<DiceData | null>(null);
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [topWinners, setTopWinners] = useState<TopWinner[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      loadAnalytics();
    }
  }, [isOpen]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const [diceRes, sessionsRes, winnersRes] = await Promise.all([
        api.get('/history/dice?limit=50', token),
        api.get('/history/sessions?limit=100', token),
        api.get('/history/top-winners-today?limit=10', token),
      ]);

      setDiceData(diceRes);
      setSessions(sessionsRes);
      setTopWinners(winnersRes);
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể tải thống kê",
        variant: "destructive",
      });
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderDiceChart = () => {
    if (!diceData) return null;

    const maxData = Math.max(
      diceData.dice1.length,
      diceData.dice2.length,
      diceData.dice3.length
    );

    const chartHeight = 200;
    const chartWidth = 600;
    const padding = { top: 20, right: 20, bottom: 30, left: 40 };
    const graphWidth = chartWidth - padding.left - padding.right;
    const graphHeight = chartHeight - padding.top - padding.bottom;

    const yScale = graphHeight / 5; // 6 levels (1-6) so 5 intervals
    const xScale = graphWidth / (maxData - 1 || 1);

    const getPath = (values: number[]) => {
      const points = values.map((val, idx) => {
        const x = padding.left + idx * xScale;
        const y = padding.top + graphHeight - (val - 1) * yScale;
        return `${x},${y}`;
      });
      return `M${points.join('L')}`;
    };

    return (
      <div className="overflow-x-auto">
        <svg width="100%" height={chartHeight} viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="min-w-[600px]">
          {/* Grid lines */}
          {[1, 2, 3, 4, 5, 6].map((level) => (
            <line
              key={`grid-${level}`}
              x1={padding.left}
              y1={padding.top + graphHeight - (level - 1) * yScale}
              x2={chartWidth - padding.right}
              y2={padding.top + graphHeight - (level - 1) * yScale}
              stroke="#374151"
              strokeDasharray="4"
              strokeWidth="1"
            />
          ))}

          {/* Y-axis */}
          <line
            x1={padding.left}
            y1={padding.top}
            x2={padding.left}
            y2={padding.top + graphHeight}
            stroke="#6B7280"
            strokeWidth="2"
          />

          {/* X-axis */}
          <line
            x1={padding.left}
            y1={padding.top + graphHeight}
            x2={chartWidth - padding.right}
            y2={padding.top + graphHeight}
            stroke="#6B7280"
            strokeWidth="2"
          />

          {/* Y-axis labels */}
          {[1, 2, 3, 4, 5, 6].map((level) => (
            <text
              key={`label-${level}`}
              x={padding.left - 10}
              y={padding.top + graphHeight - (level - 1) * yScale + 4}
              textAnchor="end"
              fontSize="12"
              fill="#9CA3AF"
            >
              {level}
            </text>
          ))}

          {/* Dice 1 - Yellow */}
          <path
            d={getPath(diceData.dice1)}
            stroke="#FBBF24"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Dice 2 - Red */}
          <path
            d={getPath(diceData.dice2)}
            stroke="#EF4444"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Dice 3 - Blue */}
          <path
            d={getPath(diceData.dice3)}
            stroke="#3B82F6"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gray-900 border-2 border-primary/30">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <span>📊 Thống kê trò chơi</span>
          </DialogTitle>
          <DialogClose className="absolute right-4 top-4 p-2" />
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {/* Dice Statistics */}
            {diceData && (
              <Card className="border-primary/30">
                <CardHeader>
                  <CardTitle>🎲 Thống kê xúc xắc (50 lần lắc gần đây)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Dice 1 */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Xúc xắc 1</h3>
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="bg-gray-800 rounded-lg p-4">
                        <div className="text-xs text-gray-400">Trung bình</div>
                        <div className="text-2xl font-bold text-primary">
                          {calculateDiceStats(diceData.dice1).avg}
                        </div>
                      </div>
                      <div className="bg-gray-800 rounded-lg p-4">
                        <div className="text-xs text-gray-400">Tối thiểu</div>
                        <div className="text-2xl font-bold text-blue-500">
                          {calculateDiceStats(diceData.dice1).min}
                        </div>
                      </div>
                      <div className="bg-gray-800 rounded-lg p-4">
                        <div className="text-xs text-gray-400">Tối đa</div>
                        <div className="text-2xl font-bold text-red-500">
                          {calculateDiceStats(diceData.dice1).max}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {getDiceDistribution(diceData.dice1).map((count, idx) => (
                        <div key={idx} className="flex-1">
                          <div className="bg-gradient-to-t from-primary/60 to-primary/30 rounded h-20 flex items-end justify-center p-1">
                            <div className="text-xs font-bold text-white">{count}</div>
                          </div>
                          <div className="text-center text-xs text-gray-400 mt-1">{idx + 1}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Dice 2 */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Xúc xắc 2</h3>
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="bg-gray-800 rounded-lg p-4">
                        <div className="text-xs text-gray-400">Trung bình</div>
                        <div className="text-2xl font-bold text-primary">
                          {calculateDiceStats(diceData.dice2).avg}
                        </div>
                      </div>
                      <div className="bg-gray-800 rounded-lg p-4">
                        <div className="text-xs text-gray-400">Tối thiểu</div>
                        <div className="text-2xl font-bold text-blue-500">
                          {calculateDiceStats(diceData.dice2).min}
                        </div>
                      </div>
                      <div className="bg-gray-800 rounded-lg p-4">
                        <div className="text-xs text-gray-400">Tối đa</div>
                        <div className="text-2xl font-bold text-red-500">
                          {calculateDiceStats(diceData.dice2).max}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {getDiceDistribution(diceData.dice2).map((count, idx) => (
                        <div key={idx} className="flex-1">
                          <div className="bg-gradient-to-t from-primary/60 to-primary/30 rounded h-20 flex items-end justify-center p-1">
                            <div className="text-xs font-bold text-white">{count}</div>
                          </div>
                          <div className="text-center text-xs text-gray-400 mt-1">{idx + 1}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Dice 3 */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Xúc xắc 3</h3>
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="bg-gray-800 rounded-lg p-4">
                        <div className="text-xs text-gray-400">Trung bình</div>
                        <div className="text-2xl font-bold text-primary">
                          {calculateDiceStats(diceData.dice3).avg}
                        </div>
                      </div>
                      <div className="bg-gray-800 rounded-lg p-4">
                        <div className="text-xs text-gray-400">Tối thiểu</div>
                        <div className="text-2xl font-bold text-blue-500">
                          {calculateDiceStats(diceData.dice3).min}
                        </div>
                      </div>
                      <div className="bg-gray-800 rounded-lg p-4">
                        <div className="text-xs text-gray-400">Tối đa</div>
                        <div className="text-2xl font-bold text-red-500">
                          {calculateDiceStats(diceData.dice3).max}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {getDiceDistribution(diceData.dice3).map((count, idx) => (
                        <div key={idx} className="flex-1">
                          <div className="bg-gradient-to-t from-primary/60 to-primary/30 rounded h-20 flex items-end justify-center p-1">
                            <div className="text-xs font-bold text-white">{count}</div>
                          </div>
                          <div className="text-center text-xs text-gray-400 mt-1">{idx + 1}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recent Sessions */}
            {sessions.length > 0 && (
              <Card className="border-primary/30">
                <CardHeader>
                  <CardTitle>🎮 Phiên đặt cược gần đây (100 lần)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {sessions.map((session, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-gray-800 rounded-lg p-3">
                        <div>
                          <div className={`text-sm font-semibold ${session.result === 'tai' ? 'text-red-500' : 'text-blue-500'}`}>
                            {session.result === 'tai' ? '🔴 TÀI' : '🔵 XỈU'} - {session.diceResults.join('+')} = {session.totalPoints}
                          </div>
                          <div className="text-xs text-gray-400">
                            {new Date(session.createdAt).toLocaleString('vi-VN')}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Top Winners Today */}
            {topWinners.length > 0 && (
              <Card className="border-primary/30">
                <CardHeader>
                  <CardTitle>🏆 Top người thắng hôm nay</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {topWinners.map((winner, idx) => (
                      <motion.div
                        key={winner.userId}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="flex items-center gap-3 bg-gray-800 rounded-lg p-3"
                      >
                        <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full text-white font-bold">
                          {idx + 1}
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold">{winner.username}</div>
                          <div className="text-xs text-gray-400">
                            {winner.wins}/{winner.totalGames} ({winner.winRate}%) | Tổng: {formatCurrency(winner.totalWin)}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-green-500">{formatCurrency(winner.biggestWin)}</div>
                          <div className="text-xs text-gray-400">Chiến thắng lớn nhất</div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>
        )}
      </DialogContent>
    </Dialog>
  );
};
