"use client"

import React, { createContext, useContext, useState, useCallback, useEffect } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { authApi, type AuthUser } from "@/lib/api-client"
import { eventKeys } from "@/lib/hooks/use-events"

const TOKEN_KEY = "auth_token"
const USER_KEY = "auth_user"

interface AuthContextType {
  user: AuthUser | null
  token: string | null
  isAuthenticated: boolean
  login: (username: string, password: string) => Promise<void>
  setSession: (accessToken: string, user: AuthUser) => void
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

function loadStored() {
  if (typeof window === "undefined") return { token: null, user: null }
  const token = localStorage.getItem(TOKEN_KEY)
  const userStr = localStorage.getItem(USER_KEY)
  const user = userStr ? (JSON.parse(userStr) as AuthUser) : null
  return { token, user }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient()
  const [token, setToken] = useState<string | null>(null)
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const { token: t, user: u } = loadStored()
    setToken(t)
    setUser(u)
    setIsLoading(false)
  }, [])

  const login = useCallback(async (username: string, password: string) => {
    const res = await authApi.login(username, password)
    localStorage.setItem(TOKEN_KEY, res.access_token)
    localStorage.setItem(USER_KEY, JSON.stringify(res.usuario))
    setToken(res.access_token)
    setUser(res.usuario)
    queryClient.invalidateQueries({ queryKey: eventKeys.favorites() })
  }, [queryClient])

  const setSession = useCallback((accessToken: string, userData: AuthUser) => {
    localStorage.setItem(TOKEN_KEY, accessToken)
    localStorage.setItem(USER_KEY, JSON.stringify(userData))
    setToken(accessToken)
    setUser(userData)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    setToken(null)
    setUser(null)
    queryClient.removeQueries({ queryKey: eventKeys.favorites() })
  }, [queryClient])

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        login,
        setSession,
        logout,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
