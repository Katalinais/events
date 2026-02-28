"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"

export default function AdminLayout({
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
    if (!isAdmin) {
      router.replace("/?unauthorized=1")
      return
    }
  }, [isAuthenticated, isLoading, isAdmin, router])

  if (isLoading || !isAuthenticated || !isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    )
  }

  return <>{children}</>
}
