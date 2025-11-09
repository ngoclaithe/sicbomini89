'use client';

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/use-toast'
import { formatCurrency } from '@/lib/utils'
import * as WalletApi from '@/lib/wallet'
import { useRouter } from 'next/navigation'

export default function ProfilePage() {
  const [token, setToken] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)
  const [balance, setBalance] = useState<number>(0)
  const [amount, setAmount] = useState<string>('')
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    const t = localStorage.getItem('token')
    const u = localStorage.getItem('user')
    if (!t || !u) {
      router.push('/')
      return
    }
    setToken(t)
    try { setUser(JSON.parse(u)) } catch {}
    refreshBalance(t)
  }, [router])

  const refreshBalance = async (t: string) => {
    try {
      const bal = await WalletApi.getBalance(t)
      setBalance(bal)
    } catch (e) {
      toast({ title: 'Lỗi', description: 'Không tải được số dư', variant: 'destructive' })
    }
  }

  const handleDeposit = async () => {
    if (!token) return
    const amt = parseFloat(amount)
    if (!amt || amt <= 0) {
      toast({ title: 'Lỗi', description: 'Số tiền không hợp lệ', variant: 'destructive' })
      return
    }
    try {
      await WalletApi.deposit(amt, token)
      await refreshBalance(token)
      setAmount('')
      toast({ title: 'Thành công', description: 'Nạp tiền thành công' })
    } catch (e: any) {
      toast({ title: 'Lỗi', description: e?.message || 'Không thể nạp tiền', variant: 'destructive' })
    }
  }

  const handleWithdraw = async () => {
    if (!token) return
    const amt = parseFloat(amount)
    if (!amt || amt <= 0) {
      toast({ title: 'Lỗi', description: 'Số tiền không hợp lệ', variant: 'destructive' })
      return
    }
    try {
      await WalletApi.withdraw(amt, token)
      await refreshBalance(token)
      setAmount('')
      toast({ title: 'Thành công', description: 'Rút tiền thành công' })
    } catch (e: any) {
      toast({ title: 'Lỗi', description: e?.message || 'Không thể rút tiền', variant: 'destructive' })
    }
  }

  return (
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

        <Card className="border-2 border-primary/30">
          <CardHeader>
            <CardTitle>Nạp / Rút tiền</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Nhập số tiền" className="h-11" />
            <div className="flex gap-2">
              <Button className="flex-1 h-11" onClick={handleDeposit}>Nạp</Button>
              <Button className="flex-1 h-11" variant="outline" onClick={handleWithdraw}>Rút</Button>
            </div>
            <Button variant="link" onClick={() => router.push('/')}>Quay lại trang chủ</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
