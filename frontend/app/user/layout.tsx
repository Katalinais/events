"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { Menu, Heart, CalendarDays, LogOut, User } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

export default function UserLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isAuthenticated, isLoading, user, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const isAdmin = user?.tipo === "ADMINISTRADOR"
  const [sheetOpen, setSheetOpen] = useState(false)

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
    <div className="min-h-screen bg-background">
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
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <SheetTitle className="text-base font-semibold">Mi cuenta</SheetTitle>
                <p className="text-xs text-muted-foreground">Explora tus espacios</p>
              </div>
            </div>
          </SheetHeader>
          <nav className="flex flex-col gap-1 p-4">
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start gap-3 font-medium",
                pathname === "/user"
                  ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
              asChild
            >
              <Link href="/user" onClick={() => setSheetOpen(false)}>
                <Heart className="h-5 w-5 shrink-0" />
                Favoritos
              </Link>
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
              asChild
            >
              <Link href="/" onClick={() => setSheetOpen(false)}>
                <CalendarDays className="h-5 w-5 shrink-0" />
                Eventos
              </Link>
            </Button>
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

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</main>
    </div>
  )
}