'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import * as AdminApi from '@/lib/admin';
import { toast } from 'react-hot-toast';
import { Dice5, Dice6 } from 'lucide-react';

export default function SetGameResultPage() {
  const [token, setToken] = useState<string | null>(null);
  const [diceResults, setDiceResults] = useState<string[]>(['', '', '']);
  const [loading, setLoading] = useState(false);
  const [selectedDice, setSelectedDice] = useState<number | null>(null);

  React.useEffect(() => {
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      setToken(savedToken);
    }
  }, []);

  const handleDiceInputChange = (index: number, value: string) => {
    const numValue = value === '' ? '' : String(parseInt(value, 10) || '');
    if (numValue === '' || (parseInt(numValue, 10) >= 1 && parseInt(numValue, 10) <= 6)) {
      const newResults = [...diceResults];
      newResults[index] = numValue;
      setDiceResults(newResults);
    }
  };

  const handleQuickSelect = (index: number, value: number) => {
    const newResults = [...diceResults];
    newResults[index] = String(value);
    setDiceResults(newResults);
    setSelectedDice(null);
  };

  const handleSetResult = async () => {
    if (!token) {
      toast.error('Vui lòng đăng nhập lại');
      return;
    }

    if (diceResults.some(r => r === '')) {
      toast.error('Vui lòng nhập kết quả cho cả 3 con xúc xắc');
      return;
    }

    const results = diceResults.map(r => parseInt(r, 10));
    if (results.some(r => isNaN(r) || r < 1 || r > 6)) {
      toast.error('Kết quả xúc xắc phải là số từ 1 đến 6');
      return;
    }

    try {
      setLoading(true);
      await AdminApi.setGameResult(token, results);
      toast.success('Kết quả trò chơi đã được đặt thành công');
      setDiceResults(['', '', '']);
    } catch (error) {
      console.error('Error setting game result:', error);
      toast.error('Lỗi khi đặt kết quả trò chơi');
    } finally {
      setLoading(false);
    }
  };

  const getTotal = () => {
    const results = diceResults.map(r => parseInt(r, 10)).filter(r => !isNaN(r));
    if (results.length === 3) {
      return results.reduce((a, b) => a + b, 0);
    }
    return null;
  };

  const total = getTotal();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Điều chỉnh kết quả trò chơi</h1>
      </div>

      {/* Main Card */}
      <Card className="bg-gray-800/50 border-gray-700/50 max-w-3xl">
        <CardHeader>
          <CardTitle className="text-white">Nhập kết quả xúc xắc</CardTitle>
          <p className="text-gray-400 text-sm mt-2">Mỗi con xúc xắc có giá trị từ 1 đến 6</p>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Dice Input Section */}
          <div className="space-y-4">
            <Label className="text-gray-300 text-base">Kết quả xúc xắc</Label>
            <div className="grid grid-cols-1 gap-6">
              {[0, 1, 2].map((index) => (
                <div key={index} className="space-y-3">
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <label className="text-gray-300 text-sm mb-2 block">
                        Xúc xắc {index + 1}
                      </label>
                      <div className="flex gap-3">
                        <Input
                          type="number"
                          min="1"
                          max="6"
                          value={diceResults[index]}
                          onChange={(e) =>
                            handleDiceInputChange(index, e.target.value)
                          }
                          placeholder="1-6"
                          className="w-24"
                        />
                        {diceResults[index] && (
                          <div className="flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg shadow-lg">
                            <span className="text-4xl font-bold text-white">
                              {diceResults[index]}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Quick Select Buttons */}
                  <div className="flex gap-2 flex-wrap">
                    {[1, 2, 3, 4, 5, 6].map((num) => (
                      <Button
                        key={num}
                        onClick={() => handleQuickSelect(index, num)}
                        variant={
                          diceResults[index] === String(num)
                            ? 'default'
                            : 'outline'
                        }
                        className="w-10 h-10 p-0"
                      >
                        {num}
                      </Button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Total Section */}
          {total !== null && (
            <div className="bg-gradient-to-r from-green-900/30 to-emerald-900/30 border border-green-700/50 rounded-lg p-6">
              <p className="text-gray-300 text-sm mb-2">Tổng điểm</p>
              <p className="text-5xl font-bold text-green-400">
                {total}
              </p>
              <p className="text-gray-400 text-sm mt-2">
                {diceResults[0]} + {diceResults[1]} + {diceResults[2]} = {total}
              </p>
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-4 border-t border-gray-700">
            <Button
              onClick={handleSetResult}
              disabled={loading || diceResults.some(r => r === '')}
              className="gap-2 w-full"
              size="lg"
            >
              {loading ? (
                <>
                  <span className="animate-spin">⏳</span>
                  Đang xử lý...
                </>
              ) : (
                <>
                  <Dice5 className="w-5 h-5" />
                  Đặt kết quả
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
