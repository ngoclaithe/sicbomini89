🧾 Payment Module – Admin API Documentation
🧩 Tổng quan

Các API này dành riêng cho Admin, dùng để quản lý và phê duyệt các yêu cầu nạp tiền (Deposit) và rút tiền (Withdrawal) từ người dùng.
Mỗi yêu cầu đều có thể được duyệt (approve) hoặc từ chối (reject) kèm theo ghi chú hoặc lý do.

📦 1. Deposit (Nạp tiền)
1.1. POST /admin/deposits

Tạo lệnh nạp tiền mới cho người dùng.

Body (CreateDepositDto):

{
  "amount": 500000,
  "paymentInfoId": "b55f8b44-678c-4c8f-8249-d7f29a2a95e9",
  "note": "Nạp thêm vào ví chính"
}


Mô tả trường:

| Trường          | Kiểu          | Bắt buộc | Giải thích                                          |
| --------------- | ------------- | -------- | --------------------------------------------------- |
| `amount`        | number        | ✅        | Số tiền cần nạp (phải > 0)                          |
| `paymentInfoId` | string (UUID) | ✅        | ID của tài khoản ngân hàng hệ thống (`InfoPayment`) |
| `note`          | string        | ❌        | Ghi chú nội bộ hoặc lý do nạp tiền                  |

1.2. POST /admin/deposits/approve

Phê duyệt (duyệt thành công) một yêu cầu nạp tiền.

Body (ApproveDepositDto):

{
  "depositId": "3c70c432-4a7a-4786-9a59-2c1f556e0ccf",
  "note": "Đã xác nhận tiền vào tài khoản"
}


Mô tả trường:

| Trường      | Kiểu          | Bắt buộc | Giải thích                                       |
| ----------- | ------------- | -------- | ------------------------------------------------ |
| `depositId` | string (UUID) | ✅        | ID của yêu cầu nạp tiền                          |
| `note`      | string        | ❌        | Ghi chú (ví dụ: thời điểm xác nhận, người duyệt) |

1.3. POST /admin/deposits/reject

Từ chối yêu cầu nạp tiền.

Body (RejectDepositDto):

{
  "depositId": "3c70c432-4a7a-4786-9a59-2c1f556e0ccf",
  "reason": "Không tìm thấy giao dịch nạp tương ứng"
}


Mô tả trường:

| Trường      | Kiểu          | Bắt buộc | Giải thích              |
| ----------- | ------------- | -------- | ----------------------- |
| `depositId` | string (UUID) | ✅        | ID của yêu cầu nạp tiền |
| `reason`    | string        | ❌        | Lý do từ chối           |

💸 2. Withdrawal (Rút tiền)
2.1. POST /admin/withdrawals

Tạo yêu cầu rút tiền thủ công (trường hợp admin chủ động hỗ trợ user).

Body (CreateWithdrawalDto):

{
  "amount": 1000000,
  "bankName": "Vietcombank",
  "accountNumber": "0123456789",
  "accountHolder": "Nguyen Van A",
  "note": "Rút thử nghiệm"
}


Mô tả trường:

| Trường          | Kiểu   | Bắt buộc | Giải thích                 |
| --------------- | ------ | -------- | -------------------------- |
| `amount`        | number | ✅        | Số tiền cần rút (phải > 0) |
| `bankName`      | string | ✅        | Tên ngân hàng nhận         |
| `accountNumber` | string | ✅        | Số tài khoản nhận          |
| `accountHolder` | string | ✅        | Tên chủ tài khoản          |
| `note`          | string | ❌        | Ghi chú nội bộ             |

2.2. POST /admin/withdrawals/approve

Phê duyệt (duyệt thành công) yêu cầu rút tiền.

Body (ApproveWithdrawalDto):

{
  "withdrawalId": "5b7cdd11-5cbf-4a47-92f0-8f87a27f64a0",
  "note": "Đã chuyển khoản thành công"
}


Mô tả trường:

| Trường         | Kiểu          | Bắt buộc | Giải thích                   |
| -------------- | ------------- | -------- | ---------------------------- |
| `withdrawalId` | string (UUID) | ✅        | ID của yêu cầu rút tiền      |
| `note`         | string        | ❌        | Ghi chú xác nhận chuyển tiền |

2.3. POST /admin/withdrawals/reject

Từ chối yêu cầu rút tiền.

Body (RejectWithdrawalDto):

{
  "withdrawalId": "5b7cdd11-5cbf-4a47-92f0-8f87a27f64a0",
  "reason": "Thông tin tài khoản không khớp"
}


Mô tả trường:

| Trường         | Kiểu          | Bắt buộc | Giải thích              |
| -------------- | ------------- | -------- | ----------------------- |
| `withdrawalId` | string (UUID) | ✅        | ID của yêu cầu rút tiền |
| `reason`       | string        | ❌        | Lý do từ chối           |

⚙️ Ghi chú thêm

Tất cả các API đều yêu cầu xác thực Admin Token (JWT) trong header:

Authorization: Bearer <admin_access_token>


Các response chuẩn:

200 OK: Thực hiện thành công.

400 Bad Request: Thiếu hoặc sai định dạng dữ liệu.

403 Forbidden: Không có quyền admin.

404 Not Found: Không tìm thấy đối tượng theo ID.