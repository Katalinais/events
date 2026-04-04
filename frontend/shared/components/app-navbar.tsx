"use client"

import { useState, type ReactNode } from "react"
import Image from "next/image"
import Link from "next/link"
import { Menu, PanelLeft, PanelLeftClose, ChevronDown } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/shared/lib/utils"
import { Button } from "@/shared/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/shared/components/ui/sheet"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip"

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
  const [expandedItems, setExpandedItems] = useState<Set<string>>(() => {
    const active = items.find((i) => i.active && i.children)
    return active ? new Set([active.id]) : new Set()
  })

  const toggleExpanded = (id: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const handleLeafClick = (item: AppNavbarItem) => {
    item.onClick?.()
    setSheetOpen(false)
  }

  // ── Mobile nav item ──────────────────────────────────────────────
  const renderMobileItem = (item: AppNavbarItem) => {
    const Icon = item.icon
    const hasChildren = !!item.children?.length
    const isExpanded = expandedItems.has(item.id)

    if (hasChildren) {
      return (
        <div key={item.id}>
          <button
            onClick={() => toggleExpanded(item.id)}
            className={cn(
              "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors",
              item.active
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Icon className="h-5 w-5 shrink-0" />
            <span className="flex-1">{item.label}</span>
            <ChevronDown
              className={cn("h-4 w-4 shrink-0 transition-transform", isExpanded && "rotate-180")}
            />
          </button>
          {isExpanded && (
            <div className="ml-8 mt-1 flex flex-col gap-0.5">
              {item.children!.map((child) => {
                const ChildIcon = child.icon
                return (
                  <button
                    key={child.id}
                    onClick={() => handleLeafClick(child)}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-xs font-medium transition-colors",
                      child.active
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <ChildIcon className="h-4 w-4 shrink-0" />
                    {child.label}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      )
    }

    if (item.href) {
      return (
        <Button key={item.id} variant="ghost" className="w-full justify-start gap-3 font-medium" asChild>
          <Link href={item.href} onClick={() => handleLeafClick(item)}>
            <Icon className="h-5 w-5 shrink-0" />
            {item.label}
          </Link>
        </Button>
      )
    }

    return (
      <button
        key={item.id}
        onClick={() => handleLeafClick(item)}
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

  // ── Desktop expanded nav item ────────────────────────────────────
  const renderDesktopItem = (item: AppNavbarItem) => {
    const Icon = item.icon
    const hasChildren = !!item.children?.length
    const isExpanded = expandedItems.has(item.id)

    if (hasChildren) {
      return (
        <div key={item.id}>
          <button
            onClick={() => toggleExpanded(item.id)}
            className={cn(
              "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors",
              item.active
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Icon className="h-5 w-5 shrink-0" />
            <span className="flex-1">{item.label}</span>
            <ChevronDown
              className={cn("h-4 w-4 shrink-0 transition-transform", isExpanded && "rotate-180")}
            />
          </button>
          {isExpanded && (
            <div className="ml-8 mt-1 flex flex-col gap-0.5">
              {item.children!.map((child) => {
                const ChildIcon = child.icon
                if (child.href) {
                  return (
                    <Button
                      key={child.id}
                      variant="ghost"
                      className={cn(
                        "w-full justify-start gap-2 text-xs font-medium",
                        child.active
                          ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                      asChild
                    >
                      <Link href={child.href}>
                        <ChildIcon className="h-4 w-4 shrink-0" />
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
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <ChildIcon className="h-4 w-4 shrink-0" />
                    {child.label}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      )
    }

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
            <Icon className="h-5 w-5 shrink-0" />
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

  // ── Desktop collapsed icon ───────────────────────────────────────
  const renderCollapsedItem = (item: AppNavbarItem) => {
    const Icon = item.icon
    const isActive = item.active || item.children?.some((c) => c.active)
    const label = item.children?.find((c) => c.active)?.label ?? item.label

    const btn = (
      <Button
        key={item.id}
        variant="ghost"
        size="icon"
        className={cn(
          "h-9 w-9",
          isActive
            ? "bg-primary text-primary-foreground hover:bg-primary/90"
            : "text-muted-foreground hover:bg-muted"
        )}
        onClick={item.href ? undefined : item.onClick}
        aria-label={item.label}
      >
        {item.href ? <Link href={item.href}><Icon className="h-5 w-5" /></Link> : <Icon className="h-5 w-5" />}
      </Button>
    )

    return (
      <TooltipProvider key={item.id} delayDuration={200}>
        <Tooltip>
          <TooltipTrigger asChild>{btn}</TooltipTrigger>
          <TooltipContent side="right">{label}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return (
    <>
      {/* ── Mobile header + sheet ── */}
      <div className="sm:hidden">
        <header className="sticky top-0 z-40 border-b border-border bg-card/80 backdrop-blur-md">
          <div className="flex h-14 items-center justify-between px-4">
            <Button variant="ghost" size="icon" onClick={() => setSheetOpen(true)} aria-label="Abrir menú">
              <Menu className="h-5 w-5" />
            </Button>
            <Link href="/" className="flex items-center gap-2" onClick={onLogoClick}>
              <Image src="/logo.png" alt="logo" width={28} height={28} className="h-7 w-7 rounded-lg" priority />
              <span className="text-base font-bold tracking-tight text-foreground" style={{ fontFamily: "var(--font-heading)" }}>
                {brandLabel}
              </span>
            </Link>
            <div className="w-9" aria-hidden />
          </div>
        </header>

        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetContent side="left" className="flex w-72 flex-col p-0">
            <SheetHeader className="border-b border-border px-4 py-3 text-left">
              <SheetTitle className="text-sm font-semibold">{mobileTitle}</SheetTitle>
            </SheetHeader>
            <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
              {items.map(renderMobileItem)}
            </nav>
            {footer && (
              <div className="border-t border-border p-3">{footer}</div>
            )}
          </SheetContent>
        </Sheet>
      </div>

      {/* ── Desktop sidebar ── */}
      <aside
        className={cn(
          "hidden sm:flex sm:flex-col sm:h-full sm:overflow-hidden sm:shrink-0 sm:border-r sm:border-border sm:bg-card/80 sm:transition-all sm:duration-200",
          sidebarOpen ? "sm:w-64" : "sm:w-14"
        )}
      >
        {sidebarOpen ? (
          <>
            <div className="flex h-14 items-center justify-between gap-2 border-b border-border px-3">
              <Link href="/" className="flex min-w-0 items-center gap-2" onClick={onLogoClick}>
                <Image src="/logo.png" alt="logo" width={28} height={28} className="h-7 w-7 shrink-0 rounded-lg" priority />
                <span className="truncate text-base font-bold tracking-tight text-foreground" style={{ fontFamily: "var(--font-heading)" }}>
                  {brandLabel}
                </span>
              </Link>
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => setSidebarOpen(false)} aria-label="Colapsar menú">
                <PanelLeftClose className="h-4 w-4" />
              </Button>
            </div>

            <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
              {items.map(renderDesktopItem)}
            </nav>

            {footer && (
              <div className="border-t border-border p-3">{footer}</div>
            )}
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center gap-1 py-3">
            <Button variant="ghost" size="icon" className="h-9 w-9 mb-2" onClick={() => setSidebarOpen(true)} aria-label="Expandir menú">
              <PanelLeft className="h-4 w-4" />
            </Button>
            <div className="flex w-full flex-col items-center gap-1">
              {items.map(renderCollapsedItem)}
            </div>
            {collapsedFooter && (
              <div className="mt-auto border-t border-border pt-2 flex w-full justify-center">
                {collapsedFooter}
              </div>
            )}
          </div>
        )}
      </aside>
    </>
  )
}
