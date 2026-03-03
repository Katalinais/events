"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Menu, CalendarDays, Heart, LogIn, LogOut, LayoutDashboard } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"

interface PublicNavbarProps {
  onOpenLogin?: () => void
  onLogoClick?: () => void
}

export function PublicNavbar({ onOpenLogin, onLogoClick }: PublicNavbarProps) {
  const { isAuthenticated, user, logout } = useAuth()
  const isAdmin = user?.tipo === "ADMINISTRADOR"
  const [sheetOpen, setSheetOpen] = useState(false)

  const closeAnd = (fn: () => void) => {
    setSheetOpen(false)
    fn()
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
          <Link
            href="/"
            className="flex items-center gap-2"
            onClick={() => {
              onLogoClick?.()
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

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="left" className="w-64 p-0 sm:max-w-xs">
          <SheetHeader className="border-b border-border p-4 text-left">
            <SheetTitle className="text-base font-semibold">Menú</SheetTitle>
          </SheetHeader>
          <nav className="flex flex-col gap-1 p-4">
            <Button variant="ghost" className="w-full justify-start gap-3 font-medium" asChild>
              <Link href="/" onClick={() => setSheetOpen(false)}>
                <CalendarDays className="h-5 w-5 shrink-0" />
                Eventos
              </Link>
            </Button>
            {isAuthenticated && !isAdmin && (
              <Button variant="ghost" className="w-full justify-start gap-3 font-medium" asChild>
                <Link href="/user" onClick={() => setSheetOpen(false)}>
                  <Heart className="h-5 w-5 shrink-0" />
                  Mis favoritos
                </Link>
              </Button>
            )}
            {isAuthenticated && isAdmin && (
              <Button variant="ghost" className="w-full justify-start gap-3 font-medium" asChild>
                <Link href="/admin" onClick={() => setSheetOpen(false)}>
                  <LayoutDashboard className="h-5 w-5 shrink-0" />
                  Admin
                </Link>
              </Button>
            )}
            <div className="my-2 border-t border-border" />
            {isAuthenticated ? (
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground"
                onClick={() => closeAnd(logout)}
              >
                <LogOut className="h-5 w-5 shrink-0" />
                Salir
              </Button>
            ) : (
              onOpenLogin && (
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground"
                  onClick={() => closeAnd(onOpenLogin)}
                >
                  <LogIn className="h-5 w-5 shrink-0" />
                  Entrar
                </Button>
              )
            )}
          </nav>
        </SheetContent>
      </Sheet>
    </>
  )
}