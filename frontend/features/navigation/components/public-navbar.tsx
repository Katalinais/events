"use client"

import { Suspense } from "react"
import { CalendarDays, Heart, LayoutDashboard, LogIn, LogOut, ShoppingBag } from "lucide-react"
import { useAuth } from "@/shared/providers/auth-context"
import { Button } from "@/shared/components/ui/button"
import { usePathname } from "next/navigation"
import { useSearchParams } from "next/navigation"
import { AppNavbar, type AppNavbarItem } from "@/shared/components/app-navbar"

interface PublicNavbarProps {
  onOpenLogin?: () => void
  onLogoClick?: () => void
}

function PublicNavbarInner({ onOpenLogin, onLogoClick }: PublicNavbarProps) {
  const { isAuthenticated, user, logout } = useAuth()
  const isAdmin = user?.role === "ADMINISTRADOR"
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const tab = searchParams.get("tab")

  const isEventsActive = pathname === "/" || (pathname === "/user" && tab === "events")
  const isFavoritesActive =
    (pathname === "/user" && tab !== "events") || (pathname !== "/user" && false)
  const items: AppNavbarItem[] = [
    {
      id: "events",
      label: "Eventos",
      icon: CalendarDays,
      active: isEventsActive,
      href: pathname === "/user" && isAuthenticated && !isAdmin ? "/user?tab=events" : "/",
    },
    ...(isAuthenticated && !isAdmin ? [{
      id: "past-events",
      label: "Mis compras",
      icon: ShoppingBag,
      active: pathname === "/past-events",
      href: "/past-events",
    }] : []),
  ]

  if (isAuthenticated && !isAdmin) {
    items.push({
      id: "favorites",
      label: "Mis favoritos",
      icon: Heart,
      active: isFavoritesActive,
      href: pathname === "/user" ? "/user?tab=favorites" : "/user",
    })
  }

  if (isAuthenticated && isAdmin) {
    items.push({
      id: "admin",
      label: "Admin",
      icon: LayoutDashboard,
      active: pathname === "/admin",
      href: "/admin",
    })
  }

  const footer = isAuthenticated ? (
    <Button
      variant="ghost"
      className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground"
      onClick={logout}
    >
      <LogOut className="h-4 w-4 shrink-0" />
      Salir
    </Button>
  ) : (
    onOpenLogin && (
      <Button
        variant="ghost"
        className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground"
        onClick={onOpenLogin}
      >
        <LogIn className="h-4 w-4 shrink-0" />
        Entrar
      </Button>
    )
  )

  return (
    <AppNavbar
      items={items}
      onLogoClick={onLogoClick}
      mobileTitle="Menú"
      footer={footer || undefined}
      collapsedFooter={
        isAuthenticated ? (
          <Button variant="ghost" size="icon" onClick={logout} aria-label="Salir">
            <LogOut className="h-5 w-5" />
          </Button>
        ) : (
          onOpenLogin && (
            <Button variant="ghost" size="icon" onClick={onOpenLogin} aria-label="Entrar">
              <LogIn className="h-5 w-5" />
            </Button>
          )
        )
      }
    />
  )
}

export function PublicNavbar(props: PublicNavbarProps) {
  return (
    <Suspense>
      <PublicNavbarInner {...props} />
    </Suspense>
  )
}