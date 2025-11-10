'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Gamepad2, TrendingUp, Wallet } from 'lucide-react';
import * as AdminApi from '@/lib/admin';

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalGames: number;
  totalRevenue: number;
}

export default function DashboardPage() {
  const [token, setToken] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalGames: 0,
    totalRevenue: 0,
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      setToken(savedToken);
      loadDashboardData(savedToken);
    }
  }, []);

  const loadDashboardData = async (authToken: string) => {
    try {
      setLoading(true);
      const [statsData, activityData] = await Promise.all([
        AdminApi.getStatistics(authToken),
        AdminApi.getRecentActivity(authToken, 10),
      ]);

      setStats(statsData);
      setRecentActivity(activityData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = () => {
    if (token) {
      loadDashboardData(token);
    }
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
                <p className="text-3xl font-bold text-white mt-2">{stats.totalUsers}</p>
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
                <p className="text-3xl font-bold text-white mt-2">{stats.activeUsers}</p>
              </div>
              <Users className="w-10 h-10 text-green-400 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-900/50 to-purple-800/50 border-purple-700/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Tổng game</p>
                <p className="text-3xl font-bold text-white mt-2">{stats.totalGames}</p>
              </div>
              <Gamepad2 className="w-10 h-10 text-purple-400 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-900/50 to-yellow-800/50 border-yellow-700/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Tổng doanh thu</p>
                <p className="text-3xl font-bold text-white mt-2">
                  {(stats.totalRevenue / 1000000).toFixed(1)}M
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
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
                  <div className="flex-1">
                    <p className="text-white font-medium">{activity.type || 'Hoạt động'}</p>
                    <p className="text-gray-400 text-sm">{activity.description || activity.note || ''}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-400 text-sm">
                      {new Date(activity.createdAt || activity.timestamp).toLocaleString('vi-VN')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
