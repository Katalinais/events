"use client"

import Image from "next/image"
import { CalendarDays, LayoutDashboard, BarChart3, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"

export type NavView = "public" | "gestion" | "reporte"

interface NavbarProps {
  currentView: NavView
  onViewChange: (view: NavView) => void
}

export function Navbar({ currentView, onViewChange }: NavbarProps) {
  const { isAuthenticated, logout } = useAuth()

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/80 backdrop-blur-md">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
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
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-lg bg-muted p-1">
            <button
              onClick={() => onViewChange("public")}
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-all",
                currentView === "public"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <CalendarDays className="h-4 w-4" />
              <span className="hidden sm:inline">Eventos</span>
            </button>
            <button
              onClick={() => onViewChange("gestion")}
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-all",
                currentView === "gestion"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden sm:inline">Gestión</span>
            </button>
            <button
              onClick={() => onViewChange("reporte")}
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-all",
                currentView === "reporte"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Reporte</span>
            </button>
          </div>
          {isAuthenticated && (
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-muted-foreground hover:text-foreground"
              onClick={logout}
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Salir</span>
            </Button>
          )}
        </div>
      </nav>
    </header>
  )
}
