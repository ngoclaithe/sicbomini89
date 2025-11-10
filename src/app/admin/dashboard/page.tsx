'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import * as AdminAuth from '@/lib/admin';
import { useToast } from '@/components/ui/use-toast';
import { LogOut, Shield, Users, BarChart3, Activity } from 'lucide-react';

export default function AdminDashboardPage() {
  const [admin, setAdmin] = useState<any>(null);
  const [statistics, setStatistics] = useState<any>(null);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const adminToken = localStorage.getItem('adminToken');
    const adminData = localStorage.getItem('admin');

    if (!adminToken || !adminData || adminData === 'undefined') {
      router.push('/admin/login');
      return;
    }

    try {
      setAdmin(JSON.parse(adminData));
      loadDashboardData(adminToken);
    } catch (error) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('admin');
      router.push('/admin/login');
    }
  }, [router]);

  const loadDashboardData = async (token: string) => {
    try {
      setLoading(true);
      const [stats, activity] = await Promise.all([
        AdminAuth.getStatistics(token),
        AdminAuth.getRecentActivity(token, 20),
      ]);
      
      setStatistics(stats);
      setRecentActivity(activity);
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: "Không thể tải dữ liệu dashboard",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('admin');
    toast({
      title: "Thành công",
      description: "Đã đăng xuất",
    });
    router.push('/admin/login');
  };

  if (!admin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <Card className="border-2 border-amber-600/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-amber-700 rounded-full flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-lg text-amber-200">{admin.username}</div>
                  <div className="text-sm text-amber-200/60">Quản trị viên</div>
                </div>
              </div>
              <Button
                onClick={handleLogout}
                variant="outline"
                className="gap-2 border-amber-600 text-amber-200 hover:bg-amber-600/20"
              >
                <LogOut className="w-4 h-4" />
                Đăng xuất
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Users Stats */}
            <Card className="border-amber-600/20 bg-slate-800/50">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-amber-200">Người dùng</CardTitle>
                  <Users className="w-5 h-5 text-amber-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-amber-400">{statistics.users.total}</div>
                <p className="text-xs text-amber-200/60 mt-2">
                  {statistics.users.active} đang hoạt động
                </p>
              </CardContent>
            </Card>

            {/* Games Stats */}
            <Card className="border-amber-600/20 bg-slate-800/50">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-amber-200">Trò chơi</CardTitle>
                  <BarChart3 className="w-5 h-5 text-amber-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-amber-400">{statistics.games.totalSessions}</div>
                <p className="text-xs text-amber-200/60 mt-2">
                  {statistics.games.completedSessions} phiên hoàn thành
                </p>
              </CardContent>
            </Card>

            {/* Finance Stats */}
            <Card className="border-amber-600/20 bg-slate-800/50">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-amber-200">Doanh thu</CardTitle>
                  <Activity className="w-5 h-5 text-amber-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-amber-400">
                  {(statistics.finance.profit / 1000).toFixed(1)}K
                </div>
                <p className="text-xs text-amber-200/60 mt-2">
                  Lợi nhuận ròng
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Recent Activity */}
        <Card className="border-amber-600/20">
          <CardHeader>
            <CardTitle className="text-amber-200">Hoạt động gần đây</CardTitle>
            <CardDescription className="text-amber-200/60">20 hành động mới nhất</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-amber-200/60">Đang tải...</div>
            ) : recentActivity.length > 0 ? (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {recentActivity.map((activity, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-slate-800/50 rounded border border-amber-600/10 hover:border-amber-600/30 transition">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-amber-200">{activity.username}</span>
                        <span className="text-xs text-amber-200/60">đặt cược {activity.betAmount}</span>
                      </div>
                      <div className="text-sm text-amber-200/60 mt-1">
                        Kết quả: [{Array.isArray(activity.result) ? activity.result.join(', ') : activity.result || 'N/A'}] - {activity.isWin ? '✓ Thắng' : '✗ Thua'}
                      </div>
                    </div>
                    {activity.isWin && (
                      <div className="text-right">
                        <div className="text-sm font-semibold text-green-400">+{activity.winAmount}</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-amber-200/60">Không có hoạt động</div>
            )}
          </CardContent>
        </Card>

        {/* Quick Links */}
        <Card className="border-amber-600/20">
          <CardHeader>
            <CardTitle className="text-amber-200">Công cụ quản lý</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <Button 
                variant="outline"
                className="border-amber-600/30 text-amber-200 hover:bg-amber-600/20"
              >
                Quản lý người dùng
              </Button>
              <Button 
                variant="outline"
                className="border-amber-600/30 text-amber-200 hover:bg-amber-600/20"
              >
                Cấu hình game
              </Button>
              <Button 
                variant="outline"
                className="border-amber-600/30 text-amber-200 hover:bg-amber-600/20"
              >
                Thiết lập kết quả
              </Button>
              <Button 
                variant="outline"
                className="border-amber-600/30 text-amber-200 hover:bg-amber-600/20"
              >
                Báo cáo chi tiết
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
