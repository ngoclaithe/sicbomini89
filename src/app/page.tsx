'use client';

import React, { useState, useEffect } from 'react';
import { LoginForm } from '@/components/LoginForm';
import { GameBoard } from '@/components/GameBoard';
import { GameHistory } from '@/components/GameHistory';
import { ChatWidget } from '@/components/ChatWidget';
import { PaymentModal } from '@/components/PaymentModal';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { connectSocket, disconnectSocket } from '@/lib/socket';
import * as WalletApi from '@/lib/wallet';
import { formatCurrency } from '@/lib/utils';
import { LogOut, User, Wallet, History, Home as HomeIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useUserStore, UserRole } from '@/store/useUserStore';

export default function Home() {
  const { isAuthenticated, isLoading, checkAuth, logout } = useAuth();
  const user = useUserStore((state) => state.user);
  const [balance, setBalance] = useState(0);
  const [activeTab, setActiveTab] = useState<'game' | 'history'>('game');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === UserRole.ADMIN) {
        router.push('/admin-2026');
        return;
      }
      loadBalance();
      connectSocket();
    }

    return () => {
      disconnectSocket();
    };
  }, [isAuthenticated, user]);

  const loadBalance = async () => {
    try {
      const bal = await WalletApi.getBalance();
      setBalance(bal);
    } catch (error) {

    }
  };

  const handleLogin = () => {
    loadBalance();
  };

  const handleLogout = async () => {
    await logout();
    setBalance(0);
    disconnectSocket();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="text-white text-xl">Đang tải...</div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <LoginForm onLogin={handleLogin} />;
  }

  if (user.role === UserRole.ADMIN) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white">Đang chuyển hướng đến trang quản trị...</div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <Card className="border-2 border-primary/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => router.push('/profile')}
                    className="w-12 h-12 bg-gradient-to-r from-red-500 to-blue-500 rounded-full flex items-center justify-center hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <User className="w-6 h-6" />
                  </button>
                  <div>
                    <div className="font-semibold text-lg">{user.username}</div>
                    <div className="text-sm text-gray-400 flex items-center gap-3">
                      <Wallet className="w-4 h-4" />
                      {formatCurrency(balance)}
                    </div>
                    <Button
                      onClick={() => setIsPaymentModalOpen(true)}
                      className="mt-2 h-10 px-6 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all"
                    >
                      💰 Nạp / Rút tiền
                    </Button>
                  </div>
                </div>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  className="gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Đăng xuất
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Navigation Tabs */}
          <div className="flex gap-2">
            <Button
              onClick={() => setActiveTab('game')}
              variant={activeTab === 'game' ? 'default' : 'outline'}
              className="flex-1 h-12 gap-2"
            >
              <HomeIcon className="w-4 h-4" />
              Chơi game
            </Button>
            <Button
              onClick={() => setActiveTab('history')}
              variant={activeTab === 'history' ? 'default' : 'outline'}
              className="flex-1 h-12 gap-2"
            >
              <History className="w-4 h-4" />
              Lịch sử
            </Button>
          </div>

          {/* Main Content */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'game' ? (
              <GameBoard
                userId={user.id}
                balance={balance}
                onBalanceUpdate={loadBalance}
              />
            ) : (
              <GameHistory />
            )}
          </motion.div>
        </div>
      </div>
      <ChatWidget />
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        balance={balance}
        onSuccess={loadBalance}
      />
    </>
  );
}
