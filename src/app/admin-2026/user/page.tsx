'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import * as AdminApi from '@/lib/admin';
import { toast } from 'react-hot-toast';

interface User {
  id: string;
  username: string;
  email?: string;
  balance: number;
  status: 'active' | 'inactive';
  createdAt: string;
}

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [adjustAmount, setAdjustAmount] = useState('0');
  const [isAdjusting, setIsAdjusting] = useState(false);

  const itemsPerPage = 10;

  useEffect(() => {
    loadUsers(1);
  }, []);

  const loadUsers = async (page: number) => {
    try {
      setLoading(true);
      const response = await AdminApi.getUsers(page, itemsPerPage);
      setUsers(response.users || []);
      setTotalPages(response.totalPages || 1);
      setCurrentPage(page);
    } catch (error) {

      toast.error('Lỗi khi tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadUsers(1);
      return;
    }

    try {
      setLoading(true);
      const response = await AdminApi.getUsers(1, itemsPerPage);
      const filtered = (response.users || []).filter((user: User) =>
        user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setUsers(filtered);
      setTotalPages(1);
      setCurrentPage(1);
    } catch (error) {
      toast.error('Lỗi khi tìm kiếm người dùng');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (userId: string) => {
    try {
      await AdminApi.toggleUserStatus(userId);
      toast.success('Cập nhật trạng thái thành công');
      loadUsers(currentPage);
    } catch (error) {
      toast.error('Lỗi khi cập nhật trạng thái');
    }
  };

  const handleAdjustBalance = async () => {
    if (!selectedUserId) return;

    const amount = parseFloat(adjustAmount);
    if (isNaN(amount)) {
      toast.error('Vui lòng nhập số tiền hợp lệ');
      return;
    }

    try {
      setIsAdjusting(true);
      await AdminApi.adjustUserBalance(selectedUserId, amount);
      toast.success('Điều chỉnh số dư thành công');
      setSelectedUserId(null);
      setAdjustAmount('0');
      loadUsers(currentPage);
    } catch (error) {
      toast.error('Lỗi khi điều chỉnh số dư');
    } finally {
      setIsAdjusting(false);
    }
  };

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Quản lý người dùng</h1>
      </div>

      {/* Search Section */}
      <Card className="bg-gray-800/50 border-gray-700/50">
        <CardContent className="p-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <Label className="text-gray-300">Tìm kiếm theo tên hoặc email</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  placeholder="Nhập tên đăng nhập hoặc email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="flex-1"
                />
                <Button onClick={handleSearch} className="gap-2">
                  <Search className="w-4 h-4" />
                  Tìm kiếm
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="bg-gray-800/50 border-gray-700/50">
        <CardHeader>
          <CardTitle className="text-white">Danh sách người dùng</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-gray-400 text-center py-8">Đang tải dữ liệu...</div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-gray-400 text-center py-8">Không tìm thấy người dùng nào</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-3 px-4 text-gray-300 font-semibold">Tên đăng nhập</th>
                    <th className="text-left py-3 px-4 text-gray-300 font-semibold">Email</th>
                    <th className="text-right py-3 px-4 text-gray-300 font-semibold">Số dư</th>
                    <th className="text-left py-3 px-4 text-gray-300 font-semibold">Trạng thái</th>
                    <th className="text-left py-3 px-4 text-gray-300 font-semibold">Ngày tạo</th>
                    <th className="text-center py-3 px-4 text-gray-300 font-semibold">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                      <td className="py-3 px-4 text-gray-200">{user.username}</td>
                      <td className="py-3 px-4 text-gray-400">{user.email || 'N/A'}</td>
                      <td className="py-3 px-4 text-right text-gray-200 font-semibold">
                        {(user.balance / 1000).toFixed(0)}K
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${user.status === 'active'
                              ? 'bg-green-900/50 text-green-300'
                              : 'bg-red-900/50 text-red-300'
                            }`}
                        >
                          {user.status === 'active' ? 'Hoạt động' : 'Khóa'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-400">
                        {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex gap-2 justify-center">
                          <Button
                            onClick={() => setSelectedUserId(user.id)}
                            variant="outline"
                            className="text-xs"
                          >
                            Điều chỉnh
                          </Button>
                          <Button
                            onClick={() => handleToggleStatus(user.id)}
                            variant="outline"
                            className="text-xs"
                          >
                            {user.status === 'active' ? 'Khóa' : 'Mở'}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-6">
              <Button
                onClick={() => loadUsers(currentPage - 1)}
                disabled={currentPage === 1}
                variant="outline"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-gray-400">
                Trang {currentPage} / {totalPages}
              </span>
              <Button
                onClick={() => loadUsers(currentPage + 1)}
                disabled={currentPage === totalPages}
                variant="outline"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Adjust Balance Modal */}
      {selectedUserId && (
        <Card className="bg-gray-800/50 border-gray-700/50">
          <CardHeader>
            <CardTitle className="text-white">Điều chỉnh số dư</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-gray-300">Người dùng: {filteredUsers.find(u => u.id === selectedUserId)?.username}</Label>
              <p className="text-sm text-gray-400 mt-1">
                Số dư hiện tại: {((filteredUsers.find(u => u.id === selectedUserId)?.balance || 0) / 1000).toFixed(0)}K
              </p>
            </div>
            <div>
              <Label htmlFor="adjust-amount" className="text-gray-300">Số tiền (+ hoặc -)</Label>
              <Input
                id="adjust-amount"
                type="number"
                placeholder="Nhập số tiền"
                value={adjustAmount}
                onChange={(e) => setAdjustAmount(e.target.value)}
                className="mt-2"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                onClick={() => {
                  setSelectedUserId(null);
                  setAdjustAmount('0');
                }}
                variant="outline"
              >
                Hủy
              </Button>
              <Button
                onClick={handleAdjustBalance}
                disabled={isAdjusting}
                className="gap-2"
              >
                {isAdjusting ? 'Đang xử lý...' : 'Cập nhật'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
