"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { io, Socket } from "socket.io-client"
import { useAuth } from "./auth-context"

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001"

interface SocketContextType {
  socket: Socket | null
}

const SocketContext = createContext<SocketContextType>({ socket: null })

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { token } = useAuth()
  const [socket, setSocket] = useState<Socket | null>(null)

  useEffect(() => {
    const s = io(BACKEND_URL, {
      withCredentials: true,
      auth: { token },
    })

    s.on("hola", (data: { mensaje: string }) => {
      console.log("[WebSocket] hola:", data.mensaje)
    })

    setSocket(s)

    return () => {
      s.disconnect()
    }
  }, [token])

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  )
}

export function useSocketContext() {
  return useContext(SocketContext)
}
