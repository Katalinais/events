"use client"

import { BarChart3, CalendarDays, LayoutDashboard, LogOut, Tag } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { AppNavbar, type AppNavbarItem } from "@/components/app-navbar"

export type AdminNavView = "gestion-eventos" | "gestion-categorias" | "reporte"

interface AdminNavbarProps {
  currentView: AdminNavView
  onViewChange: (view: AdminNavView) => void
}

export function AdminNavbar({ currentView, onViewChange }: AdminNavbarProps) {
  const { logout } = useAuth()
  const items: AppNavbarItem[] = [
    {
      id: "gestion",
      label: "Gestión",
      icon: LayoutDashboard,
      active: currentView === "gestion-eventos" || currentView === "gestion-categorias",
      onClick: () => onViewChange("gestion-eventos"),
      children: [
        {
          id: "gestion-eventos",
          label: "Eventos",
          icon: CalendarDays,
          active: currentView === "gestion-eventos",
          onClick: () => onViewChange("gestion-eventos"),
        },
        {
          id: "gestion-categorias",
          label: "Categorías",
          icon: Tag,
          active: currentView === "gestion-categorias",
          onClick: () => onViewChange("gestion-categorias"),
        },
      ],
    },
    {
      id: "reporte",
      label: "Reporte",
      icon: BarChart3,
      active: currentView === "reporte",
      onClick: () => onViewChange("reporte"),
    },
  ]

  return (
    <AppNavbar
      items={items}
      brandLabel="Admin"
      mobileTitle="Menú"
      footer={
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground"
          onClick={logout}
        >
          <LogOut className="h-5 w-5 shrink-0" />
          Salir
        </Button>
      }
      collapsedFooter={
        <Button variant="ghost" size="icon" onClick={logout} aria-label="Salir">
          <LogOut className="h-5 w-5" />
        </Button>
      }
    />
  )
}