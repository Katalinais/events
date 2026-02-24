"use client"

import Image from "next/image"
import { CalendarDays, LayoutDashboard } from "lucide-react"
import { cn } from "@/lib/utils"

interface NavbarProps {
  currentView: "public" | "admin"
  onViewChange: (view: "public" | "admin") => void
}

export function Navbar({ currentView, onViewChange }: NavbarProps) {
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
            onClick={() => onViewChange("admin")}
            className={cn(
              "flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-all",
              currentView === "admin"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <LayoutDashboard className="h-4 w-4" />
            <span className="hidden sm:inline">Administrador</span>
          </button>
        </div>
      </nav>
    </header>
  )
}
