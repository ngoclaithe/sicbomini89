🧾 Payment Module API Documentation
I. User Endpoints
1️⃣ POST /payment/deposit/create

Tạo yêu cầu nạp tiền mới.

Status mặc định: pending
CODEPAY sẽ được hệ thống tự sinh (6 ký tự ngẫu nhiên, ví dụ: ABC123).

📥 Request Body (JSON)
{
  "amount": 500000,
  "paymentInfoId": "1c6df57a-ef5f-4b24-bf76-8338712a9c94",
  "note": "Nạp thêm tiền cho trận đấu"
}

🧾 Giải thích:
Trường	Kiểu	Bắt buộc	Mô tả
amount	number	✅	Số tiền nạp
paymentInfoId	UUID	✅	ID tài khoản ngân hàng hệ thống (InfoPayment)
note	string	❌	Ghi chú người dùng (tuỳ chọn)
📤 Response (200)
{
  "id": "8a5d7b00-c9d8-4a83-9f1c-22b2a232bdc9",
  "codepay": "ABC123",
  "status": "pending",
  "amount": 500000,
  "paymentInfo": {
    "bankName": "Vietcombank",
    "accountNumber": "0123456789",
    "accountHolder": "CTY LIVESTREAM TECH"
  },
  "createdAt": "2025-11-11T10:00:00Z"
}

2️⃣ GET /payment/deposits/user

Xem lịch sử các yêu cầu nạp tiền của user.

📤 Response (200)
[
  {
    "id": "8a5d7b00-c9d8-4a83-9f1c-22b2a232bdc9",
    "codepay": "ABC123",
    "amount": 500000,
    "status": "success",
    "approvedAt": "2025-11-11T10:05:00Z",
    "note": "Nạp thêm tiền cho trận đấu"
  },
  {
    "id": "b4f2c12b-a3de-4011-a23c-92d49bb0b4d7",
    "codepay": "XYZ789",
    "amount": 300000,
    "status": "failed",
    "approvedAt": null
  }
]

3️⃣ POST /payment/withdrawal/create

Tạo yêu cầu rút tiền (status: pending).

📥 Request Body (JSON)
{
  "amount": 200000,
  "bankName": "Techcombank",
  "accountNumber": "19031234567890",
  "accountHolder": "Nguyen Van A",
  "note": "Rút tiền thưởng"
}

🧾 Giải thích:
Trường	Kiểu	Bắt buộc	Mô tả
amount	number	✅	Số tiền muốn rút
bankName	string	✅	Tên ngân hàng nhận tiền
accountNumber	string	✅	Số tài khoản nhận tiền
accountHolder	string	✅	Tên chủ tài khoản nhận tiền
note	string	❌	Ghi chú thêm
📤 Response (200)
{
  "id": "3d2d1f22-9c54-42b7-8b4b-8d7b6ff49db7",
  "amount": 200000,
  "status": "pending",
  "createdAt": "2025-11-11T10:10:00Z"
}

4️⃣ GET /payment/withdrawals/user

Xem lịch sử rút tiền của user.

📤 Response (200)
[
  {
    "id": "3d2d1f22-9c54-42b7-8b4b-8d7b6ff49db7",
    "amount": 200000,
    "status": "success",
    "approvedAt": "2025-11-11T10:20:00Z",
    "bankName": "Techcombank",
    "accountNumber": "19031234567890",
    "accountHolder": "Nguyen Van A"
  }
]

II. Admin Endpoints
1️⃣ POST /payment/info/create

Thêm tài khoản ngân hàng hệ thống (InfoPayment).

📥 Request Body
{
  "bankName": "Vietcombank",
  "accountNumber": "0123456789",
  "accountHolder": "CTY LIVESTREAM TECH"
}

📤 Response
{
  "id": "1c6df57a-ef5f-4b24-bf76-8338712a9c94",
  "bankName": "Vietcombank",
  "accountNumber": "0123456789",
  "accountHolder": "CTY LIVESTREAM TECH"
}

2️⃣ PUT /payment/deposit/:id/approve

Duyệt lệnh nạp tiền → cộng tiền vào ví user.

📥 Request Body
{
  "depositId": "8a5d7b00-c9d8-4a83-9f1c-22b2a232bdc9",
  "note": "Đã xác minh chuyển khoản thành công"
}

📤 Response
{
  "message": "Deposit approved successfully",
  "status": "success",
  "approvedAt": "2025-11-11T10:05:00Z"
}

3️⃣ PUT /payment/deposit/:id/reject

Từ chối lệnh nạp tiền.

📥 Request Body
{
  "depositId": "8a5d7b00-c9d8-4a83-9f1c-22b2a232bdc9",
  "reason": "Không tìm thấy giao dịch chuyển khoản"
}

📤 Response
{
  "message": "Deposit rejected",
  "status": "failed"
}

4️⃣ PUT /payment/withdrawal/:id/approve

Duyệt yêu cầu rút tiền → trừ tiền khỏi ví user.

📥 Request Body
{
  "withdrawalId": "3d2d1f22-9c54-42b7-8b4b-8d7b6ff49db7",
  "note": "Đã chuyển khoản thành công"
}

📤 Response
{
  "message": "Withdrawal approved successfully",
  "status": "success",
  "approvedAt": "2025-11-11T10:20:00Z"
}

5️⃣ PUT /payment/withdrawal/:id/reject

Từ chối yêu cầu rút tiền.

📥 Request Body
{
  "withdrawalId": "3d2d1f22-9c54-42b7-8b4b-8d7b6ff49db7",
  "reason": "Tài khoản không hợp lệ"
}

📤 Response
{
  "message": "Withdrawal rejected",
  "status": "failed"
}
