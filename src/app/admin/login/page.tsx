'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import * as AdminAuth from '@/lib/admin';
import { useToast } from '@/components/ui/use-toast';
import { Shield, Lock } from 'lucide-react';

export default function AdminLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = await AdminAuth.adminLogin(username, password);
      
      localStorage.setItem('adminToken', data.access_token);
      localStorage.setItem('admin', JSON.stringify(data.admin));
      
      toast({
        title: "Thành công!",
        description: "Đăng nhập admin thành công",
      });
      
      router.push('/admin/dashboard');
    } catch (error: any) {
      toast({
        title: "Lỗi đăng nhập",
        description: error.message || "Sai tên đăng nhập hoặc mật khẩu",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Card className="w-full max-w-md border-2 border-amber-600/50 shadow-2xl shadow-amber-600/20">
        <CardHeader className="text-center space-y-4 border-b border-amber-600/30">
          <div className="flex justify-center">
            <div className="p-4 bg-amber-600/20 rounded-full">
              <Shield className="w-12 h-12 text-amber-500" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold text-amber-500">
            Quản Lý Hệ Thống
          </CardTitle>
          <CardDescription className="text-sm text-amber-200/70">
            Đăng nhập quản trị viên
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="admin-username" className="text-amber-200">
                Tên quản trị viên
              </Label>
              <Input
                id="admin-username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Nhập tên quản trị viên"
                required
                className="h-11 bg-slate-800 border-amber-600/30 text-white placeholder:text-gray-500 focus:border-amber-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-password" className="text-amber-200">
                Mật khẩu
              </Label>
              <Input
                id="admin-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu"
                required
                minLength={6}
                className="h-11 bg-slate-800 border-amber-600/30 text-white placeholder:text-gray-500 focus:border-amber-500"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full h-11 text-base bg-amber-600 hover:bg-amber-700 text-white font-semibold"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Đang xác thực...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Đăng nhập
                </span>
              )}
            </Button>
          </form>
          <div className="mt-6 pt-4 border-t border-amber-600/20">
            <p className="text-xs text-center text-amber-200/50">
              ⚠️ Chỉ dành cho quản trị viên được ủy quyền
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
