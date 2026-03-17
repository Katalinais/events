"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Menu, LayoutDashboard, BarChart3, CalendarDays, Tag, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"

export type AdminNavView = "gestion-eventos" | "gestion-categorias" | "reporte"

interface AdminNavbarProps {
  currentView: AdminNavView
  onViewChange: (view: AdminNavView) => void
}

export function AdminNavbar({ currentView, onViewChange }: AdminNavbarProps) {
  const { logout } = useAuth()
  const [sheetOpen, setSheetOpen] = useState(false)

  const handleNav = (view: AdminNavView) => {
    onViewChange(view)
    setSheetOpen(false)
  }

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border bg-card/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0"
            onClick={() => setSheetOpen(true)}
            aria-label="Abrir menú"
          >
            <Menu className="h-6 w-6" />
          </Button>
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
          <div className="w-10 shrink-0" aria-hidden />
        </div>
      </header>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="left" className="w-64 p-0 sm:max-w-xs">
          <SheetHeader className="border-b border-border p-4 text-left">
            <SheetTitle className="text-base font-semibold">Menú</SheetTitle>
          </SheetHeader>
          <nav className="flex flex-col gap-1 p-4">
            <button
              onClick={() => handleNav("gestion-eventos")}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors",
                currentView === "gestion-eventos" || currentView === "gestion-categorias"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <LayoutDashboard className="h-5 w-5 shrink-0" />
              Gestión
            </button>
            <div className="ml-8 flex flex-col gap-1">
              <button
                onClick={() => handleNav("gestion-eventos")}
                className={cn(
                  "flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-xs font-medium transition-colors",
                  currentView === "gestion-eventos"
                    ? "bg-primary/90 text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <CalendarDays className="h-4 w-4 shrink-0" />
                Eventos
              </button>
              <button
                onClick={() => handleNav("gestion-categorias")}
                className={cn(
                  "flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-xs font-medium transition-colors",
                  currentView === "gestion-categorias"
                    ? "bg-primary/90 text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Tag className="h-4 w-4 shrink-0" />
                Categorías
              </button>
            </div>
            <button
              onClick={() => handleNav("reporte")}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors",
                currentView === "reporte"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <BarChart3 className="h-5 w-5 shrink-0" />
              Reporte
            </button>
            <div className="my-2 border-t border-border" />
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground"
              onClick={() => {
                setSheetOpen(false)
                logout()
              }}
            >
              <LogOut className="h-5 w-5 shrink-0" />
              Salir
            </Button>
          </nav>
        </SheetContent>
      </Sheet>
    </>
  )
}