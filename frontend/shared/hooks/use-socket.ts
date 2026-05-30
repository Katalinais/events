import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

export function useSocket() {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');

    const socket = io(BACKEND_URL, {
      withCredentials: true,
      auth: { token },
    });
    socketRef.current = socket;

    socket.on('hola', (data: { mensaje: string }) => {
      console.log('[WebSocket] hola:', data.mensaje);
    });

    socket.on('purchase:result', (data: { type: string; message: string }) => {
      console.log('[WebSocket] purchase:result:', data);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return socketRef;
}
