'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import * as PaymentApi from '@/lib/payment';
import { formatCurrency } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import { CreditCard, DollarSign, Loader2 } from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  token: string;
  balance: number;
  onSuccess: () => void;
}

type TabType = 'deposit' | 'withdrawal';

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  token,
  balance,
  onSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('deposit');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Deposit form state
  const [depositAmount, setDepositAmount] = useState('');
  const [depositNote, setDepositNote] = useState('');

  // Withdrawal form state
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountHolder, setAccountHolder] = useState('');
  const [withdrawNote, setWithdrawNote] = useState('');

  const handleDeposit = async () => {
    const amount = parseFloat(depositAmount);

    if (isNaN(amount) || amount <= 0) {
      toast({
        title: 'Lỗi',
        description: 'Số tiền nạp không hợp lệ',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      await PaymentApi.createDeposit(
        {
          amount,
          paymentInfoId: 'default',
          note: depositNote || undefined,
        },
        token
      );

      toast({
        title: 'Thành công',
        description: 'Yêu cầu nạp tiền đã được gửi. Vui lòng đợi xác nhận.',
      });

      setDepositAmount('');
      setDepositNote('');
      onSuccess();
      onClose();
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: error instanceof Error ? error.message : 'Không thể nạp tiền',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleWithdrawal = async () => {
    const amount = parseFloat(withdrawAmount);

    if (isNaN(amount) || amount <= 0) {
      toast({
        title: 'Lỗi',
        description: 'Số tiền rút không hợp lệ',
        variant: 'destructive',
      });
      return;
    }

    if (amount > balance) {
      toast({
        title: 'Lỗi',
        description: 'Số dư không đủ',
        variant: 'destructive',
      });
      return;
    }

    if (!bankName.trim()) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng nhập tên ngân hàng',
        variant: 'destructive',
      });
      return;
    }

    if (!accountNumber.trim()) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng nhập số tài khoản',
        variant: 'destructive',
      });
      return;
    }

    if (!accountHolder.trim()) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng nhập tên chủ tài khoản',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      await PaymentApi.createWithdrawal(
        {
          amount,
          bankName: bankName.trim(),
          accountNumber: accountNumber.trim(),
          accountHolder: accountHolder.trim(),
          note: withdrawNote || undefined,
        },
        token
      );

      toast({
        title: 'Thành công',
        description: 'Yêu cầu rút tiền đã được gửi. Vui lòng đợi xác nhận.',
      });

      setWithdrawAmount('');
      setBankName('');
      setAccountNumber('');
      setAccountHolder('');
      setWithdrawNote('');
      onSuccess();
      onClose();
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: error instanceof Error ? error.message : 'Không thể rút tiền',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setActiveTab('deposit');
      setDepositAmount('');
      setDepositNote('');
      setWithdrawAmount('');
      setBankName('');
      setAccountNumber('');
      setAccountHolder('');
      setWithdrawNote('');
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Quản lý tiền</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Tabs */}
          <div className="flex gap-2 border-b border-border">
            <button
              onClick={() => setActiveTab('deposit')}
              className={`pb-2 px-4 font-semibold border-b-2 transition-colors ${
                activeTab === 'deposit'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <CreditCard className="w-4 h-4 inline mr-2" />
              Nạp tiền
            </button>
            <button
              onClick={() => setActiveTab('withdrawal')}
              className={`pb-2 px-4 font-semibold border-b-2 transition-colors ${
                activeTab === 'withdrawal'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <DollarSign className="w-4 h-4 inline mr-2" />
              Rút tiền
            </button>
          </div>

          {/* Deposit Tab */}
          {activeTab === 'deposit' && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="deposit-amount">Số tiền nạp</Label>
                <Input
                  id="deposit-amount"
                  type="number"
                  placeholder="Nhập số tiền"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  disabled={isLoading}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="deposit-note">Ghi chú (tuỳ chọn)</Label>
                <Input
                  id="deposit-note"
                  type="text"
                  placeholder="Ghi chú thêm"
                  value={depositNote}
                  onChange={(e) => setDepositNote(e.target.value)}
                  disabled={isLoading}
                  className="mt-1"
                />
              </div>

              <Card className="bg-muted">
                <CardContent className="pt-4">
                  <p className="text-sm text-muted-foreground">
                    Yêu cầu nạp tiền sẽ được xử lý trong vòng 5-30 phút
                  </p>
                </CardContent>
              </Card>

              <Button
                onClick={handleDeposit}
                disabled={isLoading || !depositAmount}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  'Nạp tiền'
                )}
              </Button>
            </div>
          )}

          {/* Withdrawal Tab */}
          {activeTab === 'withdrawal' && (
            <div className="space-y-4">
              <div>
                <Label>Số dư hiện tại</Label>
                <Card className="bg-muted mt-1">
                  <CardContent className="pt-4">
                    <p className="text-lg font-bold text-primary">
                      {formatCurrency(balance)}
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div>
                <Label htmlFor="withdraw-amount">Số tiền rút</Label>
                <Input
                  id="withdraw-amount"
                  type="number"
                  placeholder="Nhập số tiền"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  disabled={isLoading}
                  max={balance}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="bank-name">Tên ngân hàng</Label>
                <Input
                  id="bank-name"
                  type="text"
                  placeholder="VD: Vietcombank, Techcombank"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  disabled={isLoading}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="account-number">Số tài khoản</Label>
                <Input
                  id="account-number"
                  type="text"
                  placeholder="Số tài khoản nhận tiền"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  disabled={isLoading}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="account-holder">Tên chủ tài khoản</Label>
                <Input
                  id="account-holder"
                  type="text"
                  placeholder="Tên chủ tài khoản"
                  value={accountHolder}
                  onChange={(e) => setAccountHolder(e.target.value)}
                  disabled={isLoading}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="withdraw-note">Ghi chú (tuỳ chọn)</Label>
                <Input
                  id="withdraw-note"
                  type="text"
                  placeholder="Ghi chú thêm"
                  value={withdrawNote}
                  onChange={(e) => setWithdrawNote(e.target.value)}
                  disabled={isLoading}
                  className="mt-1"
                />
              </div>

              <Button
                onClick={handleWithdrawal}
                disabled={isLoading || !withdrawAmount}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  'Rút tiền'
                )}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
