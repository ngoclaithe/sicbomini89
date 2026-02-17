# Cookie-Based Authentication - Frontend Setup

## Overview
Frontend đã được config sẵn để dùng **HTTP-only cookies** thay vì token thủ công. Cookies được tự động gửi kèm mọi request.

## Architecture

### BFF (Backend-for-Frontend) Pattern
```
Client → Next.js BFF Proxy (/api/bff/*) → NestJS Backend
```

**Lợi ích:**
- Cookies được forward tự động giữa client và backend
- Tránh CORS issues
- Bảo mật hơn (HTTP-only cookies không thể bị XSS)

## Configuration

### 1. Environment Variables

**Development (.env)**:
```env
BACKEND_URL=http://localhost:3001
NEXT_PUBLIC_API_URL=http://localhost:3001
```

**Production**:
```env
BACKEND_URL=https://your-backend-domain.com
NEXT_PUBLIC_API_URL=https://your-backend-domain.com
```

### 2. API Client (`lib/api.ts`)

Đã được refactor để **không cần token**:
```typescript
// ❌ Cũ - phải truyền token thủ công
api.get('/auth/me', token)

// ✅ Mới - cookie tự động
api.get('/auth/me')
```

### 3. Authentication Flow

```typescript
// Login
await login('admin', 'admin123')
// → Cookie được set tự động bởi backend
// → User state được update trong Zustand store

// Authenticated requests
await api.get('/auth/me')
// → Cookie tự động được gửi kèm

// Logout
await logout()
// → Cookie được clear tự động
```

## Usage Examples

### Login Component
```typescript
import { useAuth } from '@/hooks/useAuth';

const { login, isLoading } = useAuth();

const handleLogin = async () => {
  await login(username, password);
  // Cookie đã được set, không cần làm gì thêm
};
```

### Protected API Calls
```typescript
import { api } from '@/lib/api';

// Cookie tự động được gửi kèm
const user = await api.get('/auth/me');
const wallet = await api.get('/wallet');
```

### Check Authentication on App Load
```typescript
'use client';

import { useAuth } from '@/hooks/useAuth';
import { useEffect } from 'react';

export default function App() {
  const { checkAuth } = useAuth();
  
  useEffect(() => {
    checkAuth(); // Verify cookie còn valid không
  }, []);
  
  // ...
}
```

## State Management

### User Store (Zustand)
```typescript
import { useUserStore } from '@/store/useUserStore';

const user = useUserStore(state => state.user);
const isAdmin = useUserStore(state => state.isAdmin());
```

### Auth Store
```typescript
import { useAuth } from '@/hooks/useAuth';

const { isAuthenticated, isLoading } = useAuth();
```

## Testing

### Local Development
1. Start backend: `cd backend && npm run start:dev`
2. Start frontend: `cd frontend && npm run dev`
3. Open http://localhost:3000
4. Login với `admin` / `admin123`
5. Check cookies trong DevTools → Application → Cookies

### Production Deployment

**Backend Requirements:**
- Must use HTTPS
- Set `NODE_ENV=production`
- Configure CORS with frontend domain

**Frontend Requirements:**
- Set correct `BACKEND_URL` in `.env`
- Deploy to same domain OR ensure backend allows cross-origin cookies

## Troubleshooting

### Cookies not working?
1. Check DevTools → Network → Request Headers → Cookie
2. Verify `credentials: 'include'` in all fetch calls
3. Check backend CORS config includes `credentials: true`

### 401 Unauthorized?
1. Cookie might be expired (7 days default)
2. Backend might have restarted (JWT secret changed)
3. Try logout and login again

### BFF Proxy errors?
1. Check `BACKEND_URL` in `.env`
2. Ensure backend is running
3. Check backend logs for errors

## Migration from Token-based Auth

If migrating from old token-based code:

### Remove:
- ❌ `localStorage.setItem('token', ...)`
- ❌ `Authorization: Bearer ${token}` headers
- ❌ Token parameters in API calls

### Keep:
- ✅ `credentials: 'include'` in fetch
- ✅ User state management (Zustand)
- ✅ BFF proxy pattern

## Security Notes

- Cookies are **HTTP-only** → Cannot be accessed by JavaScript
- Cookies use **SameSite** protection → CSRF protection
- In production, cookies require **HTTPS** (`secure: true`)
- Cookies auto-expire after 7 days

## Default Test Accounts

- **Admin**: `admin` / `admin123`
- **User**: `player1` / `player123`
