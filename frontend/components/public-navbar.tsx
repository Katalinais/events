"use client"

import Image from "next/image"
import Link from "next/link"
import { CalendarDays, LogIn, LogOut, LayoutDashboard } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"

interface PublicNavbarProps {
  onOpenLogin?: () => void
}

export function PublicNavbar({ onOpenLogin }: PublicNavbarProps) {
  const { isAuthenticated, user, logout } = useAuth()
  const isAdmin = user?.tipo === "ADMINISTRADOR"

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/80 backdrop-blur-md">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
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
        </div>

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-2 rounded-lg bg-muted px-3 py-1.5 text-sm font-medium text-foreground">
            <CalendarDays className="h-4 w-4" />
            <span className="hidden sm:inline">Eventos</span>
          </span>
          {isAuthenticated && isAdmin && (
            <Button variant="ghost" size="sm" asChild>
              <Link
                href="/admin"
                className="gap-1.5 text-muted-foreground hover:text-foreground"
              >
                <LayoutDashboard className="h-4 w-4" />
                <span className="hidden sm:inline">Admin</span>
              </Link>
            </Button>
          )}
          {isAuthenticated ? (
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-muted-foreground hover:text-foreground"
              onClick={logout}
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Salir</span>
            </Button>
          ) : (
            onOpenLogin && (
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5 text-muted-foreground hover:text-foreground"
                onClick={onOpenLogin}
              >
                <LogIn className="h-4 w-4" />
                <span className="hidden sm:inline">Entrar</span>
              </Button>
            )
          )}
        </div>
      </nav>
    </header>
  )
}
