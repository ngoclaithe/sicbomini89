import { io, Socket } from 'socket.io-client';

let chatSocket: Socket | null = null;

const getChatUrl = () => {
  const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  return `${base.replace(/\/$/, '')}/chat`;
};

export const getChatSocket = () => {
  if (!chatSocket) {
    chatSocket = io(getChatUrl(), {
      autoConnect: false,
      transports: ['websocket'],
    });
  }
  return chatSocket;
};

export const connectChatSocket = () => {
  const sock = getChatSocket();
  if (!sock.connected) sock.connect();
  return sock;
};

export const disconnectChatSocket = () => {
  if (chatSocket) chatSocket.disconnect();
};
