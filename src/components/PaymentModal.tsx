'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import * as PaymentApi from '@/lib/payment';
import { formatCurrency } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import { CreditCard, DollarSign, Loader2, Copy, Check } from 'lucide-react';

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
  const [isLoadingBanks, setIsLoadingBanks] = useState(false);
  const [paymentInfos, setPaymentInfos] = useState<PaymentApi.PaymentInfo[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const { toast } = useToast();

  // Deposit form state
  const [depositAmount, setDepositAmount] = useState('');
  const [selectedPaymentInfoId, setSelectedPaymentInfoId] = useState('');
  const [depositNote, setDepositNote] = useState('');

  // Withdrawal form state
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountHolder, setAccountHolder] = useState('');

  // Load payment infos when modal opens or activeTab changes to deposit
  useEffect(() => {
    if (isOpen && activeTab === 'deposit') {
      loadPaymentInfos();
    }
  }, [isOpen, activeTab]);

  const loadPaymentInfos = async () => {
    setIsLoadingBanks(true);
    try {
      const infos = await PaymentApi.getPaymentInfos(token);
      setPaymentInfos(infos);
      if (infos.length > 0) {
        setSelectedPaymentInfoId(infos[0].id);
      }
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể tải danh sách ngân hàng',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingBanks(false);
    }
  };

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể sao chép',
        variant: 'destructive',
      });
    }
  };

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

    if (!selectedPaymentInfoId) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng chọn ngân hàng',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      await PaymentApi.createDeposit(
        {
          amount,
          paymentInfoId: selectedPaymentInfoId,
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
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-full max-w-md mx-auto sm:max-w-lg">
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
                <Label htmlFor="bank-select">Chọn tài khoản ngân hàng</Label>
                {isLoadingBanks ? (
                  <div className="mt-1 flex items-center justify-center p-3 bg-muted rounded-md">
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    <span className="text-sm">Đang tải...</span>
                  </div>
                ) : (
                  <select
                    id="bank-select"
                    value={selectedPaymentInfoId}
                    onChange={(e) => setSelectedPaymentInfoId(e.target.value)}
                    disabled={isLoading || paymentInfos.length === 0}
                    className="mt-1 w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                  >
                    <option value="">Chọn ngân hàng...</option>
                    {paymentInfos.map((info) => (
                      <option key={info.id} value={info.id}>
                        {info.bankName} - {info.accountNumber}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {selectedPaymentInfoId && paymentInfos.length > 0 && (
                <Card className="bg-primary/5 border border-primary/30">
                  <CardContent className="pt-4 space-y-2">
                    {paymentInfos
                      .filter((info) => info.id === selectedPaymentInfoId)
                      .map((info) => (
                        <div key={info.id} className="space-y-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-xs text-muted-foreground">Tên ngân hàng</p>
                              <p className="font-semibold text-sm">{info.bankName}</p>
                            </div>
                            <Button
                              onClick={() => copyToClipboard(info.bankName, `bank-${info.id}`)}
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                            >
                              {copiedId === `bank-${info.id}` ? (
                                <Check className="w-3 h-3 text-green-500" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </Button>
                          </div>

                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-xs text-muted-foreground">Số tài khoản</p>
                              <p className="font-semibold text-sm font-mono">{info.accountNumber}</p>
                            </div>
                            <Button
                              onClick={() => copyToClipboard(info.accountNumber, `account-${info.id}`)}
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                            >
                              {copiedId === `account-${info.id}` ? (
                                <Check className="w-3 h-3 text-green-500" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </Button>
                          </div>

                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-xs text-muted-foreground">Chủ tài khoản</p>
                              <p className="font-semibold text-sm">{info.accountHolder}</p>
                            </div>
                            <Button
                              onClick={() => copyToClipboard(info.accountHolder, `holder-${info.id}`)}
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                            >
                              {copiedId === `holder-${info.id}` ? (
                                <Check className="w-3 h-3 text-green-500" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </Button>
                          </div>
                        </div>
                      ))}
                  </CardContent>
                </Card>
              )}

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
                <Label htmlFor="deposit-note">Ghi chú (tu�� chọn)</Label>
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
                disabled={isLoading || !depositAmount || !selectedPaymentInfoId}
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
