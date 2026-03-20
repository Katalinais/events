"use client"

import { useState, type ReactNode } from "react"
import Image from "next/image"
import Link from "next/link"
import { Menu, PanelLeft, PanelLeftClose } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"

export interface AppNavbarItem {
  id: string
  label: string
  icon: LucideIcon
  active?: boolean
  href?: string
  onClick?: () => void
  children?: AppNavbarItem[]
}

interface AppNavbarProps {
  items: AppNavbarItem[]
  brandLabel?: string
  mobileTitle?: string
  onLogoClick?: () => void
  footer?: ReactNode
  collapsedFooter?: ReactNode
}

export function AppNavbar({
  items,
  brandLabel = "Event Management",
  mobileTitle = "Menú",
  onLogoClick,
  footer,
  collapsedFooter,
}: AppNavbarProps) {
  const [sheetOpen, setSheetOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const handleItemClick = (item: AppNavbarItem) => {
    item.onClick?.()
    setSheetOpen(false)
  }

  const renderMobileItem = (item: AppNavbarItem, nested = false) => {
    const Icon = item.icon
    if (item.href) {
      return (
        <Button key={item.id} variant="ghost" className={cn("w-full justify-start gap-3 font-medium", nested && "ml-6 text-xs")} asChild>
          <Link href={item.href} onClick={() => handleItemClick(item)}>
            <Icon className={cn("shrink-0", nested ? "h-4 w-4" : "h-5 w-5")} />
            {item.label}
          </Link>
        </Button>
      )
    }
    return (
      <button
        key={item.id}
        onClick={() => handleItemClick(item)}
        className={cn(
          "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors",
          item.active
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:bg-muted hover:text-foreground",
          nested && "ml-6 px-2 py-1.5 text-xs"
        )}
      >
        <Icon className={cn("shrink-0", nested ? "h-4 w-4" : "h-5 w-5")} />
        {item.label}
      </button>
    )
  }

  const renderDesktopItem = (item: AppNavbarItem) => {
    const Icon = item.icon
    if (item.href) {
      return (
        <Button
          key={item.id}
          variant="ghost"
          className={cn(
            "w-full justify-start gap-3 font-medium",
            item.active
              ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
          asChild
        >
          <Link href={item.href}>
            <Icon className="h-4 w-4 shrink-0" />
            {item.label}
          </Link>
        </Button>
      )
    }
    return (
      <button
        key={item.id}
        onClick={item.onClick}
        className={cn(
          "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors",
          item.active
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        )}
      >
        <Icon className="h-5 w-5 shrink-0" />
        {item.label}
      </button>
    )
  }

  return (
    <>
      <div className="sm:hidden">
        <header className="sticky top-0 z-40 border-b border-border bg-card/80 backdrop-blur-md">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <Button variant="ghost" size="icon" className="shrink-0" onClick={() => setSheetOpen(true)} aria-label="Abrir menú">
              <Menu className="h-6 w-6" />
            </Button>
            <Link href="/" className="flex items-center gap-2" onClick={onLogoClick}>
              <Image src="/logo.png" alt="Event Management" width={36} height={36} className="h-9 w-9 rounded-lg" priority />
              <span className="text-xl font-bold tracking-tight text-foreground" style={{ fontFamily: "var(--font-heading)" }}>
                {brandLabel}
              </span>
            </Link>
            <div className="w-10 shrink-0" aria-hidden />
          </div>
        </header>

        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetContent side="left" className="w-64 p-0 sm:max-w-xs">
            <SheetHeader className="border-b border-border p-4 text-left">
              <SheetTitle className="text-base font-semibold">{mobileTitle}</SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col gap-1 p-4">
              {items.map((item) => (
                <div key={item.id}>
                  {renderMobileItem(item)}
                  {item.children?.map((child) => renderMobileItem(child, true))}
                </div>
              ))}
              {footer && <div className="my-2 border-t border-border pt-2">{footer}</div>}
            </nav>
          </SheetContent>
        </Sheet>
      </div>

      <aside
        className={cn(
          "hidden sm:flex sm:flex-col sm:sticky sm:top-0 sm:h-screen sm:border-r sm:border-border sm:bg-card/80 sm:shrink-0",
          sidebarOpen ? "sm:w-64" : "sm:w-14"
        )}
      >
        {sidebarOpen ? (
          <>
            <div className="flex h-16 items-center justify-between gap-2 border-b border-border px-4">
              <Link href="/" className="flex min-w-0 items-center gap-2" onClick={onLogoClick}>
                <Image src="/logo.png" alt="Event Management" width={32} height={32} className="h-8 w-8 shrink-0 rounded-lg" priority />
                <span className="truncate text-lg font-bold tracking-tight text-foreground" style={{ fontFamily: "var(--font-heading)" }}>
                  {brandLabel}
                </span>
              </Link>
              <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)} aria-label="Ocultar menú" className="shrink-0">
                <PanelLeftClose className="h-5 w-5" />
              </Button>
            </div>

            <nav className="flex flex-1 flex-col gap-1 p-4">
              {items.map((item) => (
                <div key={item.id}>
                  {renderDesktopItem(item)}
                  {item.children && (
                    <div className="ml-8 mt-1 flex flex-col gap-1">
                      {item.children.map((child) => {
                        const Icon = child.icon
                        if (child.href) {
                          return (
                            <Button
                              key={child.id}
                              variant="ghost"
                              className={cn(
                                "w-full justify-start gap-2 text-xs font-medium",
                                child.active
                                  ? "bg-primary/90 text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
                                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
                              )}
                              asChild
                            >
                              <Link href={child.href}>
                                <Icon className="h-4 w-4 shrink-0" />
                                {child.label}
                              </Link>
                            </Button>
                          )
                        }
                        return (
                          <button
                            key={child.id}
                            onClick={child.onClick}
                            className={cn(
                              "flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-xs font-medium transition-colors",
                              child.active
                                ? "bg-primary/90 text-primary-foreground"
                                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )}
                          >
                            <Icon className="h-4 w-4 shrink-0" />
                            {child.label}
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              ))}
              {footer && <div className="mt-auto border-t border-border pt-2">{footer}</div>}
            </nav>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center py-4">
            <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)} aria-label="Mostrar menú">
              <PanelLeft className="h-5 w-5" />
            </Button>
            <div className="mt-6 flex w-full flex-col items-center gap-1">
              {items.map((item) => {
                const Icon = item.icon
                if (item.href) {
                  return (
                    <Button
                      key={item.id}
                      variant="ghost"
                      size="icon"
                      className={cn(
                        item.active
                          ? "bg-primary text-primary-foreground hover:bg-primary/90"
                          : "text-muted-foreground hover:bg-muted"
                      )}
                      asChild
                    >
                      <Link href={item.href} aria-label={item.label}>
                        <Icon className="h-5 w-5" />
                      </Link>
                    </Button>
                  )
                }
                return (
                  <Button
                    key={item.id}
                    variant="ghost"
                    size="icon"
                    className={cn(
                      item.active
                        ? "bg-primary text-primary-foreground hover:bg-primary/90"
                        : "text-muted-foreground hover:bg-muted"
                    )}
                    onClick={item.onClick}
                    aria-label={item.label}
                  >
                    <Icon className="h-5 w-5" />
                  </Button>
                )
              })}
            </div>
            {collapsedFooter && (
              <div className="mt-auto w-full border-t border-border pt-2 flex justify-center">
                {collapsedFooter}
              </div>
            )}
          </div>
        )}
      </aside>
    </>
  )
}

