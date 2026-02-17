'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  Users,
  Settings,
  Dice5,
  CreditCard,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useUserStore } from '@/store/useUserStore';

const menuItems = [
  { name: 'Dashboard', icon: LayoutDashboard, href: '/admin-2026/dashboard' },
  { name: 'Quản lý người dùng', icon: Users, href: '/admin-2026/user' },
  { name: 'Cấu hình game', icon: Settings, href: '/admin-2026/config' },
  { name: 'Điều chỉnh kết quả', icon: Dice5, href: '/admin-2026/setgameresult' },
  { name: 'Quản lý nạp/rút', icon: CreditCard, href: '/admin-2026/payment' },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading, checkAuth, logout } = useAuth();
  const user = useUserStore((state) => state.user);
  const isAdmin = useUserStore((state) => state.isAdmin());
  const [sidebarOpen, setSidebarOpen] = React.useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const isLoginPage = pathname === '/admin-2026/login';

  useEffect(() => {
    if (isLoginPage) return;

    checkAuth();
  }, [isLoginPage]);

  useEffect(() => {
    if (isLoginPage) return;

    if (!isLoading && !isAuthenticated) {
      router.push('/admin-2026/login');
      return;
    }

    if (!isLoading && isAuthenticated && !isAdmin) {
      router.push('/');
    }
  }, [isLoading, isAuthenticated, isAdmin, router, isLoginPage]);

  const handleLogout = async () => {
    await logout();
    router.push('/admin-2026/login');
  };

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (isLoading || !isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white text-xl">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-900">
      {/* Sidebar */}
      <div
        className={`${sidebarOpen ? 'w-64' : 'w-20'
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
