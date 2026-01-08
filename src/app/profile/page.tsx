'use client';

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChatWidget } from '@/components/ChatWidget'
import { useToast } from '@/components/ui/use-toast'
import { formatCurrency } from '@/lib/utils'
import * as WalletApi from '@/lib/wallet'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useUserStore } from '@/store/useUserStore'

export default function ProfilePage() {
  const { isAuthenticated, isLoading, checkAuth } = useAuth()
  const user = useUserStore((state) => state.user)
  const [balance, setBalance] = useState<number>(0)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/')
      return
    }
    if (isAuthenticated) {
      refreshBalance()
    }
  }, [isLoading, isAuthenticated, router])

  const refreshBalance = async () => {
    try {
      const bal = await WalletApi.getBalance()
      setBalance(bal)
    } catch (e) {
      toast({ title: 'Lỗi', description: 'Không tải được số dư', variant: 'destructive' })
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="text-white text-xl">Đang tải...</div>
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return null
  }

  return (
    <>
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
      <div className="max-w-3xl mx-auto space-y-6">
        <Card className="border-2 border-primary/30">
          <CardHeader>
            <CardTitle>Thông tin tài khoản</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div><span className="text-gray-400">Tên đăng nhập:</span> <span className="font-semibold">{user?.username}</span></div>
            <div><span className="text-gray-400">Số dư:</span> <span className="font-semibold text-primary">{formatCurrency(balance)}</span></div>
          </CardContent>
        </Card>

        <Button variant="outline" onClick={() => router.push('/')}>Quay lại trang chủ</Button>
      </div>
    </div>
    <ChatWidget />
    </>
  )
}
