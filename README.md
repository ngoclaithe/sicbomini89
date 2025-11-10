Admin API Documentation
1. Update Game Configuration

Method: PUT

URL: /admin/game-config

Description: Cập nhật cấu hình game mới (thời gian đặt cược và hệ số thắng).

Request Body (JSON):

{
  "bettingTime": 30,     // optional, số giây, min 10, max 120
  "winMultiplier": 2     // optional, min 1, max 10
}


Response:

{
  "message": "Game configuration updated successfully",
  "bettingTime": 30,
  "winMultiplier": 2
}

2. Set Game Result (Admin)

Method: POST

URL: /admin/set-game-result

Description: Admin thiết lập kết quả xúc xắc cho phiên game.

Request Body (JSON):

{
  "diceResults": [3, 5, 2]   // array 3 số nguyên từ 1–6
}


Response:
Trả về kết quả đã set (tùy vào GameService.setAdminResult).

3. Get All Users

Method: GET

URL: /admin/users

Query Parameters:

page (optional, default 1): số trang

limit (optional, default 20): số user/trang

Description: Lấy danh sách người dùng, kèm số dư ví.

Response:

{
  "users": [
    {
      "id": "uuid",
      "username": "user1",
      "role": "USER",
      "isActive": true,
      "balance": 1000,
      "createdAt": "2025-11-10T10:00:00.000Z"
    }
  ],
  "total": 100,
  "page": 1,
  "totalPages": 5
}

4. Get User Detail

Method: GET

URL: /admin/users/:userId

URL Params:

userId (string, required): ID người dùng

Description: Lấy chi tiết user, bao gồm thông tin, thống kê game, lịch sử game, giao dịch ví.

Response (ví dụ):

{
  "user": {
    "id": "uuid",
    "username": "user1",
    "role": "USER",
    "isActive": true,
    "balance": 1000,
    "createdAt": "2025-11-10T10:00:00.000Z"
  },
  "statistics": {
    "totalGames": 50,
    "wins": 30,
    "losses": 20,
    "winRate": "60.00",
    "totalBet": 5000,
    "totalWin": 6000,
    "netProfit": 1000
  },
  "recentGames": [...],
  "recentTransactions": [...]
}

5. Toggle User Status

Method: PUT

URL: /admin/users/:userId/toggle-status

URL Params: userId (string, required)

Description: Kích hoạt hoặc khóa tài khoản user.

Response:

{
  "message": "User activated successfully",
  "userId": "uuid",
  "isActive": true
}

6. Adjust User Balance

Method: POST

URL: /admin/users/:userId/adjust-balance

URL Params: userId (string, required)

Request Body (JSON):

{
  "amount": 500    // số dương: nạp tiền, số âm: trừ tiền
}


Description: Admin điều chỉnh số dư ví người dùng.

Response:

{
  "message": "Balance adjusted successfully",
  "userId": "uuid",
  "newBalance": 1500
}

7. Get Statistics

Method: GET

URL: /admin/statistics

Description: Thống kê hệ thống: users, game sessions, tài chính.

Response:

{
  "users": {
    "total": 100,
    "active": 80,
    "inactive": 20
  },
  "games": {
    "totalSessions": 200,
    "completedSessions": 150,
    "totalBets": 500
  },
  "finance": {
    "totalBetsAmount": 100000,
    "totalWinAmount": 80000,
    "profit": 20000,
    "totalWalletBalance": 50000
  }
}

8. Get Recent Activity

Method: GET

URL: /admin/activity

Query Parameters:

limit (optional, default 50): số bản ghi trả về

Description: Lấy hoạt động game gần đây.

Response:

[
  {
    "id": "historyId",
    "username": "user1",
    "sessionId": "sessionId",
    "bet": "X",
    "betAmount": 100,
    "result": [2,5,6],
    "isWin": true,
    "winAmount": 200,
    "createdAt": "2025-11-10T10:30:00.000Z"
  }
]