'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Gamepad2, TrendingUp, Wallet } from 'lucide-react';
import * as AdminApi from '@/lib/admin';

interface DashboardStats {
  users: {
    total: number;
    active: number;
    inactive: number;
  };
  games: {
    totalSessions: number;
    completedSessions: number;
    totalBets: number;
  };
  finance: {
    totalBetsAmount: number;
    totalWinAmount: number;
    profit: number;
    totalWalletBalance: number;
  };
}

interface RecentActivity {
  id: string;
  username: string;
  sessionId: string;
  bet: string;
  betAmount: string;
  result: string;
  isWin: boolean;
  winAmount: string;
  createdAt: string;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    users: { total: 0, active: 0, inactive: 0 },
    games: { totalSessions: 0, completedSessions: 0, totalBets: 0 },
    finance: { totalBetsAmount: 0, totalWinAmount: 0, profit: 0, totalWalletBalance: 0 },
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsData, activityData] = await Promise.all([
        AdminApi.getStatistics(),
        AdminApi.getRecentActivity(10),
      ]);

      setStats(statsData);
      setRecentActivity(activityData);
    } catch (error) {

    } finally {
      setLoading(false);
    }
  };

  const refreshData = () => {
    loadDashboardData();
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <Button onClick={refreshData} className="gap-2">
          ↻ Làm mới
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-900/50 to-blue-800/50 border-blue-700/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Tổng người dùng</p>
                <p className="text-3xl font-bold text-white mt-2">{stats.users.total}</p>
              </div>
              <Users className="w-10 h-10 text-blue-400 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-900/50 to-green-800/50 border-green-700/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Người dùng hoạt động</p>
                <p className="text-3xl font-bold text-white mt-2">{stats.users.active}</p>
              </div>
              <Users className="w-10 h-10 text-green-400 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-900/50 to-purple-800/50 border-purple-700/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Tổng phiên chơi</p>
                <p className="text-3xl font-bold text-white mt-2">{stats.games.totalSessions}</p>
              </div>
              <Gamepad2 className="w-10 h-10 text-purple-400 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-900/50 to-yellow-800/50 border-yellow-700/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Lợi nhuận</p>
                <p className="text-3xl font-bold text-white mt-2">
                  {(stats.finance.profit / 1000).toFixed(0)}K
                </p>
              </div>
              <TrendingUp className="w-10 h-10 text-yellow-400 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="bg-gray-800/50 border-gray-700/50">
        <CardHeader>
          <CardTitle className="text-white">Hoạt động gần đây</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-gray-400 text-center py-8">Đang tải dữ liệu...</div>
          ) : recentActivity.length === 0 ? (
            <div className="text-gray-400 text-center py-8">Không có hoạt động nào</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-3 px-4 text-gray-300 font-semibold">Người dùng</th>
                    <th className="text-left py-3 px-4 text-gray-300 font-semibold">Cược</th>
                    <th className="text-right py-3 px-4 text-gray-300 font-semibold">Số tiền cược</th>
                    <th className="text-left py-3 px-4 text-gray-300 font-semibold">Kết quả</th>
                    <th className="text-left py-3 px-4 text-gray-300 font-semibold">Trạng thái</th>
                    <th className="text-right py-3 px-4 text-gray-300 font-semibold">Tiền thắng</th>
                    <th className="text-left py-3 px-4 text-gray-300 font-semibold">Thời gian</th>
                  </tr>
                </thead>
                <tbody>
                  {recentActivity.map((activity) => (
                    <tr key={activity.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                      <td className="py-3 px-4 text-gray-200">{activity.username}</td>
                      <td className="py-3 px-4 text-gray-300 capitalize">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${activity.bet === 'tai' ? 'bg-red-900/50 text-red-300' : 'bg-blue-900/50 text-blue-300'
                          }`}>
                          {activity.bet === 'tai' ? 'Tài' : activity.bet === 'xiu' ? 'Xỉu' : 'Chẵn/Lẻ'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right text-gray-200">
                        {(parseFloat(activity.betAmount) / 1000).toFixed(0)}K
                      </td>
                      <td className="py-3 px-4 text-gray-300 capitalize">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${activity.result === 'tai' ? 'bg-red-900/50 text-red-300' : 'bg-blue-900/50 text-blue-300'
                          }`}>
                          {activity.result === 'tai' ? 'Tài' : activity.result === 'xiu' ? 'Xỉu' : 'Chẵn/Lẻ'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${activity.isWin ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'
                          }`}>
                          {activity.isWin ? 'Thắng' : 'Thua'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right text-gray-200">
                        {(parseFloat(activity.winAmount) / 1000).toFixed(0)}K
                      </td>
                      <td className="py-3 px-4 text-gray-400 whitespace-nowrap text-xs">
                        {new Date(activity.createdAt).toLocaleString('vi-VN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
