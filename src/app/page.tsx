'use client';

import React, { useState, useEffect } from 'react';
import { LoginForm } from '@/components/LoginForm';
import { GameBoard } from '@/components/GameBoard';
import { GameHistory } from '@/components/GameHistory';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { connectSocket, disconnectSocket, getSocket } from '@/lib/socket';
import * as WalletApi from '@/lib/wallet';
import { formatCurrency } from '@/lib/utils';
import { LogOut, User, Wallet, History, Home as HomeIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [balance, setBalance] = useState(0);
  const [activeTab, setActiveTab] = useState<'game' | 'history'>('game');
  const router = useRouter();

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
      loadBalance(savedToken);
      connectSocket();
    }
  }, []);

  const loadBalance = async (authToken: string) => {
    try {
      const bal = await WalletApi.getBalance(authToken);
      setBalance(bal);
    } catch (error) {
      console.error('Error loading balance:', error);
    }
  };

  const handleLogin = (authToken: string, userData: any) => {
    setToken(authToken);
    setUser(userData);
    loadBalance(authToken);
    connectSocket();
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setBalance(0);
    disconnectSocket();
  };

  if (!token || !user) {
    return <LoginForm onLogin={handleLogin} />;
  }

  return (
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
                  <div className="text-sm text-gray-400 flex items-center gap-2">
                    <Wallet className="w-4 h-4" />
                    {formatCurrency(balance)}
                  </div>
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
              onBalanceUpdate={() => loadBalance(token)}
              token={token}
            />
          ) : (
            <GameHistory token={token} />
          )}
        </motion.div>
      </div>
    </div>
  );
}
