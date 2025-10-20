# TÃ i Xá»‰u Game - Frontend (Next.js)

## Setup

1. Install dependencies:
```
npm install
```

2. Setup environment:
```
cp .env.local.example .env.local
# Edit .env.local with your API URL
```

3. Run development server:
```
npm run dev
```

## Project Structure

- src/app - Next.js App Router pages
- src/components - Reusable components
  - ui - UI components (buttons, cards, etc.)
  - game - Game-specific components
  - dmin - Admin panel components
- src/lib - Utilities (API client, Socket.IO)
- src/hooks - Custom React hooks
- src/stores - Zustand state stores
- src/types - TypeScript types

## Features

- ðŸŽ² Real-time TÃ i Xá»‰u game
- ðŸ’° Wallet system
- ðŸ‘¥ User authentication
- ðŸŽ¨ Beautiful UI with animations
- ðŸ“Š Admin dashboard
- ðŸ“± Responsive design
