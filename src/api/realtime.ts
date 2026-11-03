import { io, Socket } from 'socket.io-client';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';

let socketInstance: Socket | null = null;

export interface LiveOnlineStats {
  activeVisitors: number;
  registeredUsers: number;
}

/**
 * Returns a shared, robust singleton Socket.IO instance for Dashboard.
 */
export const getDashboardSocket = (): Socket => {
  if (!socketInstance) {
    socketInstance = io(BASE_URL, {
      withCredentials: true,
      transports: ['polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    });

    socketInstance.on('connect', () => {
      console.log('⚡ [Dashboard Realtime] Connected to live sync server:', socketInstance?.id);
    });

    socketInstance.on('disconnect', (reason) => {
      console.log('🔌 [Dashboard Realtime] Disconnected:', reason);
    });
  }

  return socketInstance;
};

/**
 * Subscribe to real-time online telemetry statistics.
 */
export const subscribeToOnlineStats = (callback: (stats: LiveOnlineStats) => void): (() => void) => {
  const socket = getDashboardSocket();
  socket.on('live_online_stats', callback);
  return () => {
    socket.off('live_online_stats', callback);
  };
};
