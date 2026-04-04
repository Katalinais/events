"use client"

import { BarChart3, CalendarDays, LayoutDashboard, LogOut, Tag, Ticket, Users } from "lucide-react"
import { useAuth } from "@/shared/providers/auth-context"
import { Button } from "@/shared/components/ui/button"
import { AppNavbar, type AppNavbarItem } from "@/shared/components/app-navbar"
import type { AdminNavView } from "../types"

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
      active: currentView === "gestion-eventos",
      onClick: () => onViewChange("gestion-eventos"),
      children: [
        {
          id: "gestion-eventos",
          label: "Eventos",
          icon: CalendarDays,
          active: currentView === "gestion-eventos",
          onClick: () => onViewChange("gestion-eventos"),
        },
      ],
    },
    {
      id: "categorias",
      label: "Categorías",
      icon: Tag,
      active: currentView === "categorias-eventos" || currentView === "categorias-boletas",
      onClick: () => onViewChange("categorias-eventos"),
      children: [
        {
          id: "categorias-eventos",
          label: "Eventos",
          icon: CalendarDays,
          active: currentView === "categorias-eventos",
          onClick: () => onViewChange("categorias-eventos"),
        },
        {
          id: "categorias-boletas",
          label: "Boletas",
          icon: Ticket,
          active: currentView === "categorias-boletas",
          onClick: () => onViewChange("categorias-boletas"),
        },
      ],
    },
    {
      id: "reporte",
      label: "Reporte",
      icon: BarChart3,
      active: currentView === "reporte-eventos" || currentView === "reporte-usuarios",
      onClick: () => onViewChange("reporte-eventos"),
      children: [
        {
          id: "reporte-eventos",
          label: "Eventos",
          icon: CalendarDays,
          active: currentView === "reporte-eventos",
          onClick: () => onViewChange("reporte-eventos"),
        },
        {
          id: "reporte-usuarios",
          label: "Usuarios",
          icon: Users,
          active: currentView === "reporte-usuarios",
          onClick: () => onViewChange("reporte-usuarios"),
        },
      ],
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