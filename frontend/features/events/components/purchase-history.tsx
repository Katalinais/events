"use client"

import Image from "next/image"
import { CalendarDays, ShoppingBag, Ticket } from "lucide-react"
import { Badge } from "@/shared/components/ui/badge"
import { useMyPurchasedEvents } from "@/shared/hooks/use-tickets"

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

function isUpcoming(date: string) {
  return new Date(date) > new Date()
}

export function PurchaseHistory() {
  const { data: events = [], isLoading } = useMyPurchasedEvents()

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <ShoppingBag className="h-8 w-8 text-muted-foreground animate-pulse" />
        </div>
        <h3 className="text-lg font-semibold text-foreground">Cargando tus compras...</h3>
      </div>
    )
  }

  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <ShoppingBag className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground">Aún no tienes compras</h3>
        <p className="max-w-sm text-sm text-muted-foreground">
          Las boletas que compres aparecerán aquí.
        </p>
      </div>
    )
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-2 pb-8">
        <h1
          className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Mis compras
        </h1>
        <p className="text-muted-foreground leading-relaxed">
          {events.length} {events.length === 1 ? "evento comprado" : "eventos comprados"}.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => {
          const upcoming = isUpcoming(event.date)
          return (
            <article
              key={event.id}
              className="group flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all hover:shadow-md"
            >
              <div className="relative aspect-[16/10] shrink-0 overflow-hidden">
                <Image
                  src={event.imageUrl}
                  alt={event.name}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                <div className="absolute top-3 right-3">
                  <Badge
                    variant={upcoming ? "default" : "secondary"}
                    className="border-0 text-xs font-medium"
                  >
                    {upcoming ? "Próximo" : "Finalizado"}
                  </Badge>
                </div>
              </div>

              <div className="flex flex-1 flex-col gap-3 p-4">
                <div className="flex flex-col gap-1">
                  <h3
                    className="line-clamp-2 text-lg font-semibold leading-snug text-foreground"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    {event.name}
                  </h3>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <CalendarDays className="h-3.5 w-3.5" />
                    <span className="text-sm">{formatDate(event.date)}</span>
                  </div>
                </div>

                <div className="mt-auto flex items-center gap-1.5 border-t border-border/60 pt-3 text-sm text-muted-foreground">
                  <Ticket className="h-3.5 w-3.5 shrink-0" />
                  <span>
                    {event.totalTickets} {event.totalTickets === 1 ? "entrada comprada" : "entradas compradas"}
                  </span>
                </div>
              </div>
            </article>
          )
        })}
      </div>
    </main>
  )
}
