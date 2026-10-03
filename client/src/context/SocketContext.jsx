import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [priceUpdates, setPriceUpdates] = useState({});

  useEffect(() => {
    // Connect to backend via Vite's proxy (same origin) or direct in production
    const socket = io({
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 2000,
      reconnectionAttempts: 10,
    });

    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
      setConnected(true);
    });
    socket.on('disconnect', () => setConnected(false));
    socket.on('connect_error', (err) => {
      console.warn('Socket connection error:', err.message);
    });
    socket.on('price:update', (data) => {
      setPriceUpdates(prev => ({ ...prev, [data.symbol]: data }));
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
    };
  }, []);

  const subscribe = useCallback((symbol) => {
    socketRef.current?.emit('subscribe:price', symbol);
  }, []);

  const unsubscribe = useCallback((symbol) => {
    socketRef.current?.emit('unsubscribe:price', symbol);
  }, []);

  return (
    <SocketContext.Provider value={{ connected, priceUpdates, subscribe, unsubscribe }}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error('useSocket must be used within SocketProvider');
  return ctx;
};
