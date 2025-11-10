'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import * as AdminApi from '@/lib/admin';
import * as PaymentApi from '@/lib/payment';
import { toast } from 'react-hot-toast';
import { Plus, Trash2, Check, X, ToggleLeft, ToggleRight } from 'lucide-react';

interface PaymentInfo {
  id: string;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  isActive: boolean;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Deposit {
  id: string;
  codepay: string;
  amount: number;
  status: 'pending' | 'success' | 'failed';
  createdAt: string;
  note?: string;
}

interface Withdrawal {
  id: string;
  amount: number;
  status: 'pending' | 'success' | 'failed';
  createdAt: string;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
}

export default function PaymentManagementPage() {
  const [token, setToken] = useState<string | null>(null);
  const [tab, setTab] = useState<'bankInfo' | 'deposits' | 'withdrawals'>('bankInfo');

  // Bank Info states
  const [paymentInfos, setPaymentInfos] = useState<PaymentInfo[]>([]);
  const [newBankInfo, setNewBankInfo] = useState({
    bankName: '',
    accountNumber: '',
    accountHolder: '',
  });
  const [loadingBankInfo, setLoadingBankInfo] = useState(false);
  const [creatingBankInfo, setCreatingBankInfo] = useState(false);
  const [showBankInfoModal, setShowBankInfoModal] = useState(false);
  const [togglingInfoId, setTogglingInfoId] = useState<string | null>(null);

  // Deposit states
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [loadingDeposits, setLoadingDeposits] = useState(false);
  const [approvingDeposit, setApprovingDeposit] = useState<string | null>(null);
  const [rejectingDeposit, setRejectingDeposit] = useState<string | null>(null);
  const [depositNote, setDepositNote] = useState<Record<string, string>>({});

  // Withdrawal states
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loadingWithdrawals, setLoadingWithdrawals] = useState(false);
  const [approvingWithdrawal, setApprovingWithdrawal] = useState<string | null>(null);
  const [rejectingWithdrawal, setRejectingWithdrawal] = useState<string | null>(null);
  const [withdrawalNote, setWithdrawalNote] = useState<Record<string, string>>({});

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      setToken(savedToken);
      // Load initial data based on default tab
      if (tab === 'bankInfo') {
        loadPaymentInfos(savedToken);
      } else if (tab === 'deposits') {
        loadDeposits(savedToken);
      } else {
        loadWithdrawals(savedToken);
      }
    }
  }, [tab]);

  // Bank Info Functions
  const loadPaymentInfos = async (authToken: string) => {
    try {
      setLoadingBankInfo(true);
      const infos = await PaymentApi.getPaymentInfos(authToken);
      setPaymentInfos(infos);
    } catch (error) {
      console.error('Error loading payment infos:', error);
      toast.error('Lỗi khi tải thông tin tài khoản ngân hàng');
    } finally {
      setLoadingBankInfo(false);
    }
  };

  const handleCreatePaymentInfo = async () => {
    if (!token) return;

    if (!newBankInfo.bankName.trim() || !newBankInfo.accountNumber.trim() || !newBankInfo.accountHolder.trim()) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }

    try {
      setCreatingBankInfo(true);
      await AdminApi.createPaymentInfo(token, newBankInfo);
      toast.success('Tài khoản ngân hàng đã được thêm thành công');
      setNewBankInfo({ bankName: '', accountNumber: '', accountHolder: '' });
      setShowBankInfoModal(false);
      loadPaymentInfos(token);
    } catch (error) {
      console.error('Error creating payment info:', error);
      toast.error('Lỗi khi thêm tài khoản ngân hàng');
    } finally {
      setCreatingBankInfo(false);
    }
  };

  const handleTogglePaymentInfo = async (infoId: string, isCurrentlyActive: boolean) => {
    try {
      setTogglingInfoId(infoId);
      if (isCurrentlyActive) {
        await AdminApi.deactivateInfoPayment(infoId);
        toast.success('Đã vô hiệu hóa tài khoản ngân hàng');
      } else {
        await AdminApi.activateInfoPayment(infoId);
        toast.success('Đã kích hoạt tài khoản ngân hàng');
      }
      loadPaymentInfos(token!);
    } catch (error) {
      console.error('Error toggling payment info:', error);
      toast.error('Lỗi khi thay đổi trạng thái tài khoản');
    } finally {
      setTogglingInfoId(null);
    }
  };

  // Deposit Functions
  const loadDeposits = async (authToken: string) => {
    setLoadingDeposits(false);
  };

  const handleApproveDeposit = async (depositId: string) => {
    if (!token) return;

    try {
      setApprovingDeposit(depositId);
      await AdminApi.approveDeposit(token, depositId, depositNote[depositId] || undefined);
      toast.success('Duyệt nạp tiền thành công');
      setDepositNote(prev => {
        const newNote = { ...prev };
        delete newNote[depositId];
        return newNote;
      });
      loadDeposits(token);
    } catch (error) {
      console.error('Error approving deposit:', error);
      toast.error('Lỗi khi duyệt nạp tiền');
    } finally {
      setApprovingDeposit(null);
    }
  };

  const handleRejectDeposit = async (depositId: string) => {
    if (!token) return;
    const reason = depositNote[depositId];
    if (!reason?.trim()) {
      toast.error('Vui lòng nhập lý do từ chối');
      return;
    }

    try {
      setRejectingDeposit(depositId);
      await AdminApi.rejectDeposit(token, depositId, reason);
      toast.success('Từ chối nạp tiền thành công');
      setDepositNote(prev => {
        const newNote = { ...prev };
        delete newNote[depositId];
        return newNote;
      });
      loadDeposits(token);
    } catch (error) {
      console.error('Error rejecting deposit:', error);
      toast.error('Lỗi khi từ chối nạp tiền');
    } finally {
      setRejectingDeposit(null);
    }
  };

  // Withdrawal Functions
  const loadWithdrawals = async (authToken: string) => {
    setLoadingWithdrawals(false);
  };

  const handleApproveWithdrawal = async (withdrawalId: string) => {
    if (!token) return;

    try {
      setApprovingWithdrawal(withdrawalId);
      await AdminApi.approveWithdrawal(token, withdrawalId, withdrawalNote[withdrawalId] || undefined);
      toast.success('Duyệt rút tiền thành công');
      setWithdrawalNote(prev => {
        const newNote = { ...prev };
        delete newNote[withdrawalId];
        return newNote;
      });
      loadWithdrawals(token);
    } catch (error) {
      console.error('Error approving withdrawal:', error);
      toast.error('Lỗi khi duyệt rút tiền');
    } finally {
      setApprovingWithdrawal(null);
    }
  };

  const handleRejectWithdrawal = async (withdrawalId: string) => {
    if (!token) return;
    const reason = withdrawalNote[withdrawalId];
    if (!reason?.trim()) {
      toast.error('Vui lòng nhập lý do từ chối');
      return;
    }

    try {
      setRejectingWithdrawal(withdrawalId);
      await AdminApi.rejectWithdrawal(token, withdrawalId, reason);
      toast.success('Từ chối rút tiền thành công');
      setWithdrawalNote(prev => {
        const newNote = { ...prev };
        delete newNote[withdrawalId];
        return newNote;
      });
      loadWithdrawals(token);
    } catch (error) {
      console.error('Error rejecting withdrawal:', error);
      toast.error('Lỗi khi từ chối rút tiền');
    } finally {
      setRejectingWithdrawal(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Quản lý nạp/rút tiền</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-700">
        <button
          onClick={() => setTab('bankInfo')}
          className={`px-4 py-2 font-medium transition-colors ${
            tab === 'bankInfo'
              ? 'text-white border-b-2 border-blue-500'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          Tài khoản ngân hàng
        </button>
        <button
          onClick={() => setTab('deposits')}
          className={`px-4 py-2 font-medium transition-colors ${
            tab === 'deposits'
              ? 'text-white border-b-2 border-blue-500'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          Nạp tiền
        </button>
        <button
          onClick={() => setTab('withdrawals')}
          className={`px-4 py-2 font-medium transition-colors ${
            tab === 'withdrawals'
              ? 'text-white border-b-2 border-blue-500'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          Rút tiền
        </button>
      </div>

      {/* Bank Info Tab */}
      {tab === 'bankInfo' && (
        <div className="space-y-6">
          {/* Bank Info List */}
          <Card className="bg-gray-800/50 border-gray-700/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-white">Danh sách tài khoản ngân hàng</CardTitle>
              <Button
                onClick={() => setShowBankInfoModal(true)}
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
                Thêm tài khoản
              </Button>
            </CardHeader>
            <CardContent>
              {loadingBankInfo ? (
                <div className="text-gray-400 text-center py-8">Đang tải...</div>
              ) : paymentInfos.length === 0 ? (
                <div className="text-gray-400 text-center py-8">Chưa có tài khoản nào</div>
              ) : (
                <div className="space-y-3">
                  {paymentInfos.map((info) => (
                    <div
                      key={info.id}
                      className="bg-gray-700/50 p-4 rounded-lg"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <p className="text-white font-semibold">{info.bankName}</p>
                          <p className="text-gray-400 text-sm">
                            Số TK: {info.accountNumber}
                          </p>
                          <p className="text-gray-400 text-sm">
                            Chủ TK: {info.accountHolder}
                          </p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded text-xs font-semibold ${
                            info.isActive
                              ? 'bg-green-900/50 text-green-300'
                              : 'bg-red-900/50 text-red-300'
                          }`}
                        >
                          {info.isActive ? 'Hoạt động' : 'Vô hiệu hóa'}
                        </span>
                      </div>
                      <div className="flex gap-2 justify-end pt-3 border-t border-gray-600">
                        <Button
                          onClick={() => handleTogglePaymentInfo(info.id, info.isActive)}
                          disabled={togglingInfoId === info.id}
                          variant="outline"
                          size="sm"
                          className={`gap-2 ${
                            info.isActive
                              ? 'text-red-400 hover:text-red-300'
                              : 'text-green-400 hover:text-green-300'
                          }`}
                        >
                          {info.isActive ? (
                            <>
                              <ToggleRight className="w-4 h-4" />
                              Vô hiệu hóa
                            </>
                          ) : (
                            <>
                              <ToggleLeft className="w-4 h-4" />
                              Kích hoạt
                            </>
                          )}
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-400 gap-2">
                          <Trash2 className="w-4 h-4" />
                          Xóa
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Deposits Tab */}
      {tab === 'deposits' && (
        <Card className="bg-gray-800/50 border-gray-700/50">
          <CardHeader>
            <CardTitle className="text-white">Quản lý nạp tiền</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingDeposits ? (
              <div className="text-gray-400 text-center py-8">Đang tải...</div>
            ) : deposits.length === 0 ? (
              <div className="text-gray-400 text-center py-8">Không có yêu cầu nạp nào</div>
            ) : (
              <div className="space-y-4">
                {deposits.map((deposit) => (
                  <div
                    key={deposit.id}
                    className="bg-gray-700/50 p-4 rounded-lg space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-white font-semibold">
                          Code: {deposit.codepay}
                        </p>
                        <p className="text-gray-400 text-sm">
                          Số tiền: {(deposit.amount / 1000).toFixed(0)}K đ
                        </p>
                        <p className="text-gray-400 text-sm">
                          {new Date(deposit.createdAt).toLocaleString('vi-VN')}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded text-xs font-semibold ${
                          deposit.status === 'pending'
                            ? 'bg-yellow-900/50 text-yellow-300'
                            : deposit.status === 'success'
                            ? 'bg-green-900/50 text-green-300'
                            : 'bg-red-900/50 text-red-300'
                        }`}
                      >
                        {deposit.status === 'pending'
                          ? 'Chờ duyệt'
                          : deposit.status === 'success'
                          ? 'Đã duyệt'
                          : 'Từ chối'}
                      </span>
                    </div>

                    {deposit.status === 'pending' && (
                      <div className="space-y-2 pt-2 border-t border-gray-600">
                        <Input
                          placeholder="Ghi chú (optional)"
                          value={depositNote[deposit.id] || ''}
                          onChange={(e) =>
                            setDepositNote({
                              ...depositNote,
                              [deposit.id]: e.target.value,
                            })
                          }
                          className="text-sm"
                        />
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleApproveDeposit(deposit.id)}
                            disabled={approvingDeposit === deposit.id}
                            className="flex-1 gap-2 bg-green-600 hover:bg-green-700"
                          >
                            <Check className="w-4 h-4" />
                            Duyệt
                          </Button>
                          <Button
                            onClick={() => handleRejectDeposit(deposit.id)}
                            disabled={
                              rejectingDeposit === deposit.id ||
                              !depositNote[deposit.id]?.trim()
                            }
                            variant="outline"
                            className="flex-1 gap-2 text-red-400"
                          >
                            <X className="w-4 h-4" />
                            Từ chối
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Withdrawals Tab */}
      {tab === 'withdrawals' && (
        <Card className="bg-gray-800/50 border-gray-700/50">
          <CardHeader>
            <CardTitle className="text-white">Quản lý rút tiền</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingWithdrawals ? (
              <div className="text-gray-400 text-center py-8">Đang tải...</div>
            ) : withdrawals.length === 0 ? (
              <div className="text-gray-400 text-center py-8">Không có yêu cầu rút nào</div>
            ) : (
              <div className="space-y-4">
                {withdrawals.map((withdrawal) => (
                  <div
                    key={withdrawal.id}
                    className="bg-gray-700/50 p-4 rounded-lg space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-white font-semibold">
                          {withdrawal.bankName} - {withdrawal.accountNumber}
                        </p>
                        <p className="text-gray-400 text-sm">
                          Chủ TK: {withdrawal.accountHolder}
                        </p>
                        <p className="text-gray-400 text-sm">
                          Số tiền: {(withdrawal.amount / 1000).toFixed(0)}K đ
                        </p>
                        <p className="text-gray-400 text-sm">
                          {new Date(withdrawal.createdAt).toLocaleString('vi-VN')}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded text-xs font-semibold ${
                          withdrawal.status === 'pending'
                            ? 'bg-yellow-900/50 text-yellow-300'
                            : withdrawal.status === 'success'
                            ? 'bg-green-900/50 text-green-300'
                            : 'bg-red-900/50 text-red-300'
                        }`}
                      >
                        {withdrawal.status === 'pending'
                          ? 'Chờ duyệt'
                          : withdrawal.status === 'success'
                          ? 'Đã duyệt'
                          : 'Từ chối'}
                      </span>
                    </div>

                    {withdrawal.status === 'pending' && (
                      <div className="space-y-2 pt-2 border-t border-gray-600">
                        <Input
                          placeholder="Ghi chú (optional)"
                          value={withdrawalNote[withdrawal.id] || ''}
                          onChange={(e) =>
                            setWithdrawalNote({
                              ...withdrawalNote,
                              [withdrawal.id]: e.target.value,
                            })
                          }
                          className="text-sm"
                        />
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleApproveWithdrawal(withdrawal.id)}
                            disabled={approvingWithdrawal === withdrawal.id}
                            className="flex-1 gap-2 bg-green-600 hover:bg-green-700"
                          >
                            <Check className="w-4 h-4" />
                            Duyệt
                          </Button>
                          <Button
                            onClick={() => handleRejectWithdrawal(withdrawal.id)}
                            disabled={
                              rejectingWithdrawal === withdrawal.id ||
                              !withdrawalNote[withdrawal.id]?.trim()
                            }
                            variant="outline"
                            className="flex-1 gap-2 text-red-400"
                          >
                            <X className="w-4 h-4" />
                            Từ chối
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Add Bank Info Modal */}
      {showBankInfoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <Card className="bg-gray-800 border-gray-700 w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-white">Thêm tài khoản ngân hàng</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="bank-name" className="text-gray-300">
                  Tên ngân hàng
                </Label>
                <Input
                  id="bank-name"
                  value={newBankInfo.bankName}
                  onChange={(e) =>
                    setNewBankInfo({ ...newBankInfo, bankName: e.target.value })
                  }
                  placeholder="VD: Vietcombank"
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="account-number" className="text-gray-300">
                  Số tài khoản
                </Label>
                <Input
                  id="account-number"
                  value={newBankInfo.accountNumber}
                  onChange={(e) =>
                    setNewBankInfo({ ...newBankInfo, accountNumber: e.target.value })
                  }
                  placeholder="VD: 0123456789"
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="account-holder" className="text-gray-300">
                  Tên chủ tài khoản
                </Label>
                <Input
                  id="account-holder"
                  value={newBankInfo.accountHolder}
                  onChange={(e) =>
                    setNewBankInfo({ ...newBankInfo, accountHolder: e.target.value })
                  }
                  placeholder="VD: CTY LIVESTREAM TECH"
                  className="mt-2"
                />
              </div>
              <div className="flex gap-2 justify-end pt-4 border-t border-gray-700">
                <Button
                  onClick={() => {
                    setShowBankInfoModal(false);
                    setNewBankInfo({ bankName: '', accountNumber: '', accountHolder: '' });
                  }}
                  variant="outline"
                >
                  Hủy
                </Button>
                <Button
                  onClick={handleCreatePaymentInfo}
                  disabled={creatingBankInfo}
                  className="gap-2"
                >
                  <Plus className="w-4 h-4" />
                  {creatingBankInfo ? 'Đang thêm...' : 'Thêm tài khoản'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
