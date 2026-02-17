import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

const getGameUrl = () => {
  const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005';
  return `${base.replace(/\/$/, '')}/game`;
};

export const getSocket = () => {
  if (!socket) {
    socket = io(getGameUrl(), {
      autoConnect: false,
      transports: ['websocket'],
    });
  }
  return socket;
};

export const connectSocket = () => {
  const socket = getSocket();
  if (!socket.connected) {
    socket.connect();
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
  }
};
