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


export const Analytics: React.FC<AnalyticsProps> = ({ isOpen, onClose, token }) => {
  const [diceData, setDiceData] = useState<DiceData | null>(null);
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [loading, setLoading] = useState(false);
  const [visibleDice, setVisibleDice] = useState({ dice1: true, dice2: true, dice3: true });
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      loadAnalytics();
      setVisibleDice({ dice1: true, dice2: true, dice3: true });
    }
  }, [isOpen]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const [diceRes, sessionsRes] = await Promise.all([
        api.get('/history/dice?limit=50', token),
        api.get('/history/sessions?limit=100', token),
      ]);

      setDiceData(diceRes);
      setSessions(sessionsRes);
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
          {visibleDice.dice1 && (
            <path
              d={getPath(diceData.dice1)}
              stroke="#FBBF24"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="1"
            />
          )}

          {/* Dice 2 - Red */}
          {visibleDice.dice2 && (
            <path
              d={getPath(diceData.dice2)}
              stroke="#EF4444"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="1"
            />
          )}

          {/* Dice 3 - Blue */}
          {visibleDice.dice3 && (
            <path
              d={getPath(diceData.dice3)}
              stroke="#3B82F6"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="1"
            />
          )}
        </svg>
      </div>
    );
  };

  const toggleDice = (dice: 'dice1' | 'dice2' | 'dice3') => {
    setVisibleDice(prev => ({
      ...prev,
      [dice]: !prev[dice]
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gray-900 border-2 border-primary/30">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <span>📊 Thống kê</span>
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
            {/* Dice Statistics Chart */}
            {diceData && (
              <Card className="border-primary/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 flex-wrap">
                    {/* <span>🎲 Thống kê xúc xắc (50 lần lắc gần đây)</span> */}
                    <div className="flex gap-4 ml-auto text-sm flex-wrap">
                      <motion.button
                        onClick={() => toggleDice('dice1')}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`flex items-center gap-2 px-3 py-1 rounded transition-all ${
                          visibleDice.dice1
                            ? 'bg-yellow-500/20 border border-yellow-400'
                            : 'bg-gray-800/50 border border-gray-600 opacity-50'
                        }`}
                      >
                        <div className="w-4 h-1 bg-yellow-400 rounded"></div>
                        <span className={visibleDice.dice1 ? 'text-yellow-400' : 'text-gray-400'}>Xúc xắc 1</span>
                      </motion.button>
                      <motion.button
                        onClick={() => toggleDice('dice2')}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`flex items-center gap-2 px-3 py-1 rounded transition-all ${
                          visibleDice.dice2
                            ? 'bg-red-500/20 border border-red-400'
                            : 'bg-gray-800/50 border border-gray-600 opacity-50'
                        }`}
                      >
                        <div className="w-4 h-1 bg-red-500 rounded"></div>
                        <span className={visibleDice.dice2 ? 'text-red-400' : 'text-gray-400'}>Xúc xắc 2</span>
                      </motion.button>
                      <motion.button
                        onClick={() => toggleDice('dice3')}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`flex items-center gap-2 px-3 py-1 rounded transition-all ${
                          visibleDice.dice3
                            ? 'bg-blue-500/20 border border-blue-400'
                            : 'bg-gray-800/50 border border-gray-600 opacity-50'
                        }`}
                      >
                        <div className="w-4 h-1 bg-blue-500 rounded"></div>
                        <span className={visibleDice.dice3 ? 'text-blue-400' : 'text-gray-400'}>Xúc xắc 3</span>
                      </motion.button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {renderDiceChart()}
                </CardContent>
              </Card>
            )}

            {/* Recent Sessions Table */}
            {sessions.length > 0 && (
              <Card className="border-primary/30">
                {/* <CardHeader>
                  <CardTitle>🎮 Phiên đặt cược gần đây (100 lần)</CardTitle>
                </CardHeader> */}
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-700">
                          <th className="text-left py-2 px-3 text-gray-400"></th>
                          {[...Array(20)].map((_, idx) => (
                            <th key={idx} className="text-center py-2 px-2 text-gray-400 min-w-max">
                              {idx + 1}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {sessions.slice(0, 5).map((session, rowIdx) => (
                          <tr key={rowIdx} className="border-b border-gray-700 hover:bg-gray-800/50">
                            <td className="py-2 px-3 text-gray-400">{rowIdx + 1}</td>
                            {[...Array(20)].map((_, colIdx) => {
                              const sessionIndex = rowIdx * 20 + colIdx;
                              const sess = sessions[sessionIndex];
                              if (!sess) return <td key={colIdx} className="text-center py-2 px-2"></td>;
                              return (
                                <td
                                  key={colIdx}
                                  className={`text-center py-2 px-2 font-bold text-xs ${
                                    sess.result === 'tai' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'
                                  }`}
                                >
                                  {sess.result === 'tai' ? 'T' : 'X'}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
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
