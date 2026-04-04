"use client"

import { useState, useEffect, Suspense } from "react"
import Image from "next/image"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"
import { PublicNavbar } from "@/features/navigation/components/public-navbar"
import { PublicEvents } from "@/features/events/components/public-events"
import { LoginForm } from "@/features/auth/components/login-form"
import { RegisterForm } from "@/features/auth/components/register-form"
import { useAuth } from "@/shared/providers/auth-context"
import { toast } from "sonner"

function HomeContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { isAuthenticated, isLoading, user } = useAuth()
  const [showLogin, setShowLogin] = useState(false)
  const [authFormMode, setAuthFormMode] = useState<"login" | "register">("login")
  const isAdmin = user?.tipo === "ADMINISTRADOR"

  useEffect(() => {
    if (searchParams.get("login") === "1") setShowLogin(true)
    if (searchParams.get("unauthorized") === "1") {
      toast.error("No tienes permiso para acceder al panel de administración")
    }
  }, [searchParams])

  useEffect(() => {
    if (isLoading) return
    if (isAuthenticated && isAdmin) {
      router.replace("/admin")
    }
  }, [isAuthenticated, isLoading, isAdmin, router])

  if (isLoading || (isAuthenticated && isAdmin)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    )
  }

  return (
    <div className="h-screen overflow-hidden bg-background flex flex-col sm:flex-row">
      {!showLogin && (
        <PublicNavbar
          onOpenLogin={() => setShowLogin(true)}
          onLogoClick={() => {
            setAuthFormMode("login")
            setShowLogin(false)
            router.push("/")
          }}
        />
      )}

      <main className="flex-1 overflow-y-auto">
        {showLogin && (
          <header className="sticky top-0 z-40 border-b border-border bg-card/80 backdrop-blur-md">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
              <Link
                href="/"
                className="flex items-center gap-2"
                onClick={() => {
                  setAuthFormMode("login")
                  setShowLogin(false)
                  router.push("/")
                }}
              >
                <Image
                  src="/logo.png"
                  alt="Event Management"
                  width={36}
                  height={36}
                  className="h-9 w-9 rounded-lg"
                  priority
                />
                <span
                  className="text-xl font-bold tracking-tight text-foreground"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  Event Management
                </span>
              </Link>
              <div className="w-10 shrink-0" aria-hidden />
            </div>
          </header>
        )}
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
        {!showLogin && <PublicEvents onRequestLogin={() => setShowLogin(true)} />}
      </main>
    </div>
  )
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    }>
      <HomeContent />
    </Suspense>
  )
}