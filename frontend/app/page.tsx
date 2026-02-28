"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { PublicNavbar } from "@/components/public-navbar"
import { PublicEvents } from "@/components/public-events"
import { LoginForm } from "@/components/login-form"
import { RegisterForm } from "@/components/register-form"
import { useAuth } from "@/lib/auth-context"
import { toast } from "sonner"

export default function Home() {
  const searchParams = useSearchParams()
  const [showLogin, setShowLogin] = useState(false)
  const [authFormMode, setAuthFormMode] = useState<"login" | "register">("login")
  const { isAuthenticated, isLoading } = useAuth()

  useEffect(() => {
    if (searchParams.get("login") === "1") setShowLogin(true)
    if (searchParams.get("unauthorized") === "1") {
      toast.error("No tienes permiso para acceder al panel de administración")
    }
  }, [searchParams])

  return (
    <div className="min-h-screen bg-background">
      <PublicNavbar onOpenLogin={() => setShowLogin(true)} />
      {showLogin && authFormMode === "login" && (
        <LoginForm
          onSuccess={() => setShowLogin(false)}
          onSwitchToRegister={() => setAuthFormMode("register")}
          onClose={() => setShowLogin(false)}
        />
      )}
      {showLogin && authFormMode === "register" && (
        <RegisterForm
          onSwitchToLogin={() => setAuthFormMode("login")}
          onSuccess={() => {
            setAuthFormMode("login")
            setShowLogin(false)
          }}
          onClose={() => setShowLogin(false)}
        />
      )}
      {!showLogin && (
        <PublicEvents onRequestLogin={() => setShowLogin(true)} />
      )}
    </div>
  )
}