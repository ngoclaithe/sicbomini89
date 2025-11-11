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
import { CreditCard, DollarSign, Loader2, Copy, Check, QrCode, ArrowLeft } from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  token: string;
  balance: number;
  onSuccess: () => void;
}

type TabType = 'deposit' | 'withdrawal';
type DepositStep = 'form' | 'qr';

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  token,
  balance,
  onSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('deposit');
  const [depositStep, setDepositStep] = useState<DepositStep>('form');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingBanks, setIsLoadingBanks] = useState(false);
  const [paymentInfos, setPaymentInfos] = useState<PaymentApi.PaymentInfo[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [depositResponse, setDepositResponse] = useState<PaymentApi.DepositResponse | null>(null);
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

  const generateQRUrl = (paymentInfo: PaymentApi.PaymentInfo, amount: number, codepay: string) => {
    const bankCode = paymentInfo.bankName.toUpperCase().replace(/\s+/g, '');
    return `https://qr.sepay.vn/img?acc=${paymentInfo.accountNumber}&bank=${bankCode}&amount=${amount}&des=${codepay}`;
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
      const response = await PaymentApi.createDeposit(
        {
          amount,
          paymentInfoId: selectedPaymentInfoId,
          note: depositNote || undefined,
        },
        token
      );

      setDepositResponse(response);
      setDepositStep('qr');

      toast({
        title: 'Thành công',
        description: 'Vui lòng quét mã QR để hoàn tất giao dịch',
      });
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: error instanceof Error ? error.message : 'Không thể tạo lệnh nạp tiền',
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
      setDepositStep('form');
      setDepositAmount('');
      setDepositNote('');
      setWithdrawAmount('');
      setBankName('');
      setAccountNumber('');
      setAccountHolder('');
      setDepositResponse(null);
      onClose();
    }
  };

  const handleBackToForm = () => {
    setDepositStep('form');
    setDepositResponse(null);
  };

  const handleDoneQR = () => {
    onSuccess();
    handleClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-full max-w-md mx-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {depositStep === 'qr' ? 'Quét mã QR để thanh toán' : 'Quản lý tiền'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Show tabs only on form step */}
          {depositStep === 'form' && (
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
          )}

          {/* QR Code Step */}
          {activeTab === 'deposit' && depositStep === 'qr' && depositResponse && (
            <div className="space-y-4">
              <Button
                onClick={handleBackToForm}
                variant="ghost"
                size="sm"
                className="mb-2"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Quay lại
              </Button>

              <Card className="bg-white">
                <CardContent className="pt-6 flex flex-col items-center">
                  <div className="mb-4 p-4 bg-white rounded-lg border-2 border-gray-200">
                    <img
                      src={generateQRUrl(depositResponse.paymentInfo, depositResponse.amount, depositResponse.codepay)}
                      alt="QR Code"
                      className="w-64 h-64"
                    />
                  </div>
                  
                  <div className="w-full space-y-3">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Số tiền</p>
                      <p className="text-2xl font-bold text-primary">
                        {formatCurrency(depositResponse.amount)}
                      </p>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                      <div>
                        <p className="text-xs text-muted-foreground">Mã giao dịch</p>
                        <p className="font-mono font-semibold">{depositResponse.codepay}</p>
                      </div>
                      <Button
                        onClick={() => copyToClipboard(depositResponse.codepay, 'codepay')}
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                      >
                        {copiedId === 'codepay' ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>

                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">Ngân hàng</p>
                      <p className="font-semibold">{depositResponse.paymentInfo.bankName}</p>
                      <p className="text-sm mt-1">{depositResponse.paymentInfo.accountNumber}</p>
                      <p className="text-sm">{depositResponse.paymentInfo.accountHolder}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="pt-4">
                  <div className="flex items-start gap-2">
                    <QrCode className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <p className="font-semibold mb-1">Hướng dẫn:</p>
                      <ol className="list-decimal list-inside space-y-1">
                        <li>Mở ứng dụng ngân hàng của bạn</li>
                        <li>Quét mã QR hoặc chuyển khoản thủ công</li>
                        <li>Kiểm tra nội dung chuyển khoản là mã: <span className="font-mono font-bold">{depositResponse.codepay}</span></li>
                        <li>Xác nhận giao dịch</li>
                      </ol>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-amber-50 border-amber-200">
                <CardContent className="pt-4">
                  <p className="text-sm text-amber-800">
                    ⚠️ Giao dịch sẽ được xử lý tự động trong vòng 1-5 phút sau khi chuyển khoản thành công
                  </p>
                </CardContent>
              </Card>

              <Button onClick={handleDoneQR} className="w-full" variant="outline">
                Hoàn tất
              </Button>
            </div>
          )}

          {/* Deposit Form */}
          {activeTab === 'deposit' && depositStep === 'form' && (
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
                <Label htmlFor="deposit-note">Ghi chú (tự chọn)</Label>
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
                  'Tạo mã QR'
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