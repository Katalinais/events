import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

export function useSocket() {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socket = io(BACKEND_URL, { withCredentials: true });
    socketRef.current = socket;

    socket.on('hola', (data: { mensaje: string }) => {
      console.log('[WebSocket] hola:', data.mensaje);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return socketRef;
}
