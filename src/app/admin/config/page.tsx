'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import * as AdminApi from '@/lib/admin';
import { toast } from 'react-hot-toast';

interface GameConfig {
  bettingTime?: number;
  winMultiplier?: number;
}

export default function GameConfigPage() {
  const [token, setToken] = useState<string | null>(null);
  const [bettingTime, setBettingTime] = useState('30');
  const [winMultiplier, setWinMultiplier] = useState('2');
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      setToken(savedToken);
      setIsLoading(false);
    }
  }, []);

  const handleSaveConfig = async () => {
    if (!token) return;

    const bettingTimeNum = parseFloat(bettingTime);
    const winMultiplierNum = parseFloat(winMultiplier);

    if (isNaN(bettingTimeNum) || bettingTimeNum <= 0) {
      toast.error('Thời gian đặt cược phải là số dương');
      return;
    }

    if (isNaN(winMultiplierNum) || winMultiplierNum <= 0) {
      toast.error('Tỷ lệ thắng phải là số dương');
      return;
    }

    try {
      setLoading(true);
      await AdminApi.updateGameConfig(token, {
        bettingTime: bettingTimeNum,
        winMultiplier: winMultiplierNum,
      });
      toast.success('Cấu hình trò chơi đã được cập nhật thành công');
    } catch (error) {
      console.error('Error updating config:', error);
      toast.error('Lỗi khi cập nhật cấu hình');
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-gray-400">Đang tải cấu hình...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Cấu hình trò chơi</h1>
      </div>

      {/* Game Config Card */}
      <Card className="bg-gray-800/50 border-gray-700/50 max-w-2xl">
        <CardHeader>
          <CardTitle className="text-white">Cài đặt trò chơi</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Betting Time */}
          <div className="space-y-2">
            <Label htmlFor="betting-time" className="text-gray-300">
              Thời gian đặt cược (giây)
            </Label>
            <p className="text-sm text-gray-400 mb-2">
              Thời gian cho phép người chơi đặt cược trước khi vòng chơi bắt đầu
            </p>
            <Input
              id="betting-time"
              type="number"
              min="1"
              step="1"
              value={bettingTime}
              onChange={(e) => setBettingTime(e.target.value)}
              className="max-w-xs"
              placeholder="Nhập thời gian (giây)"
            />
            <p className="text-xs text-gray-500 mt-1">
              Giá trị hiện tại: {bettingTime} giây
            </p>
          </div>

          {/* Win Multiplier */}
          <div className="space-y-2">
            <Label htmlFor="win-multiplier" className="text-gray-300">
              Tỷ lệ thắng (bội số)
            </Label>
            <p className="text-sm text-gray-400 mb-2">
              Tỷ lệ nhân số tiền cược khi người chơi thắng
            </p>
            <Input
              id="win-multiplier"
              type="number"
              min="0.1"
              step="0.1"
              value={winMultiplier}
              onChange={(e) => setWinMultiplier(e.target.value)}
              className="max-w-xs"
              placeholder="Nhập tỷ lệ"
            />
            <p className="text-xs text-gray-500 mt-1">
              Giá trị hiện tại: {winMultiplier}x
            </p>
          </div>

          {/* Save Button */}
          <div className="pt-4 border-t border-gray-700">
            <Button
              onClick={handleSaveConfig}
              disabled={loading}
              className="gap-2"
            >
              {loading ? 'Đang cập nhật...' : '💾 Lưu cấu hình'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="bg-blue-900/20 border-blue-700/50 max-w-2xl">
        <CardContent className="p-6">
          <h3 className="text-blue-300 font-semibold mb-3">ℹ️ Thông tin</h3>
          <ul className="space-y-2 text-sm text-gray-300">
            <li>• <strong>Thời gian đặt cược:</strong> Khoảng thời gian mà người chơi có thể đặt cược</li>
            <li>• <strong>Tỷ lệ thắng:</strong> Số tiền thắng được tính b��ng cách nhân cược với tỷ lệ này</li>
            <li>• Ví dụ: Cược 100K với tỷ lệ 2x sẽ thắng 200K</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
