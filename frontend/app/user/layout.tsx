"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/shared/providers/auth-context"
import { PublicNavbar } from "@/features/navigation/components/public-navbar"

export default function UserLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isAuthenticated, isLoading, user } = useAuth()
  const router = useRouter()
  const isAdmin = user?.tipo === "ADMINISTRADOR"

  useEffect(() => {
    if (isLoading) return
    if (!isAuthenticated) {
      router.replace("/?login=1")
      return
    }
    if (isAdmin) {
      router.replace("/admin")
    }
  }, [isAuthenticated, isLoading, isAdmin, router])

  if (isLoading || !isAuthenticated || isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    )
  }

  return (
    <div className="h-screen overflow-hidden bg-background flex flex-col sm:flex-row">
      <PublicNavbar />

      <main className="flex-1 overflow-y-auto">
        <div className="w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</div>
      </main>
    </div>
  )
}