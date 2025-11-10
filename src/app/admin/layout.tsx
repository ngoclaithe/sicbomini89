'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  LayoutDashboard,
  Users,
  Settings,
  DiceFive,
  CreditCard,
  LogOut,
  Menu,
  X,
} from 'lucide-react';

const menuItems = [
  { name: 'Dashboard', icon: LayoutDashboard, href: '/admin/dashboard' },
  { name: 'Quản lý người dùng', icon: Users, href: '/admin/user' },
  { name: 'Cấu hình game', icon: Settings, href: '/admin/config' },
  { name: 'Điều chỉnh kết quả', icon: DiceFive, href: '/admin/setgameresult' },
  { name: 'Quản lý nạp/rút', icon: CreditCard, href: '/admin/payment' },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (!savedToken || !savedUser) {
      router.push('/');
      return;
    }

    setToken(savedToken);
    setUser(JSON.parse(savedUser));
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  };

  if (!token || !user) {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-900">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-gray-800 border-r border-gray-700 transition-all duration-300 flex flex-col`}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-700 flex items-center justify-between">
          {sidebarOpen && <h1 className="text-xl font-bold text-white">TX88</h1>}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-700 rounded-lg"
          >
            {sidebarOpen ? (
              <X className="w-5 h-5 text-white" />
            ) : (
              <Menu className="w-5 h-5 text-white" />
            )}
          </button>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              className="w-full flex items-center gap-4 px-4 py-3 rounded-lg hover:bg-gray-700 transition-colors text-gray-300 hover:text-white"
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && <span>{item.name}</span>}
            </button>
          ))}
        </nav>

        {/* Footer - User Info & Logout */}
        <div className="p-4 border-t border-gray-700 space-y-2">
          {sidebarOpen && (
            <div className="text-sm text-gray-400 truncate">
              <div className="font-semibold text-white truncate">{user.username}</div>
              <div className="text-xs">Quản trị viên</div>
            </div>
          )}
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full gap-2"
          >
            <LogOut className="w-4 h-4" />
            {sidebarOpen && 'Đăng xuất'}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
