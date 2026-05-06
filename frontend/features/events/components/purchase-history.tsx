"use client"

import { useState } from "react"
import Image from "next/image"
import { CalendarDays, Eye, ShoppingBag, Ticket } from "lucide-react"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { Separator } from "@/shared/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog"
import { useMyPurchasedEvents, useMyTickets } from "@/shared/hooks/use-tickets"
import type { PurchasedEvent } from "@/shared/lib/api-client"

const COP = (n: number) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(n)

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

interface EventDetailDialogProps {
  event: PurchasedEvent | null
  onClose: () => void
}

function EventDetailDialog({ event, onClose }: EventDetailDialogProps) {
  const { data: allPurchases = [] } = useMyTickets()

  const purchases = event
    ? allPurchases.filter((p) =>
        p.detalles.some((d) => d.eventoEntrada.evento.id === event.id)
      )
    : []

  return (
    <Dialog open={event !== null} onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle style={{ fontFamily: "var(--font-heading)" }}>
            {event?.name}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {purchases.map((purchase, idx) => {
            const eventDetalles = purchase.detalles.filter(
              (d) => d.eventoEntrada.evento.id === event?.id
            )
            return (
              <div key={purchase.id} className="flex flex-col gap-3">
                {idx > 0 && <Separator />}
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Ticket className="h-3.5 w-3.5 shrink-0" />
                  <span>Compra del {formatDate(purchase.fechaVenta)}</span>
                </div>

                <div className="flex flex-col divide-y divide-border rounded-lg border border-border">
                  {eventDetalles.map((detalle) => (
                    <div
                      key={detalle.id}
                      className="flex items-center justify-between px-4 py-3 text-sm"
                    >
                      <span className="font-medium text-foreground">
                        {detalle.eventoEntrada.categoriaEntrada.nombre}
                        <span className="ml-2 font-normal text-muted-foreground">
                          × {detalle.cantidad}
                        </span>
                      </span>
                      <div className="flex items-center gap-4 text-muted-foreground">
                        <span>{COP(detalle.precioUnitario)} c/u</span>
                        <span className="w-24 text-right font-medium text-foreground">
                          {COP(detalle.subtotal)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end text-sm font-bold text-foreground">
                  Total: {COP(purchase.total)}
                </div>
              </div>
            )
          })}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function PurchaseHistory() {
  const { data: events = [], isLoading } = useMyPurchasedEvents()
  const [selectedEvent, setSelectedEvent] = useState<PurchasedEvent | null>(null)

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
    <>
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

                  <div className="mt-auto flex items-center justify-between border-t border-border/60 pt-3">
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Ticket className="h-3.5 w-3.5 shrink-0" />
                      <span>
                        {event.totalTickets} {event.totalTickets === 1 ? "entrada" : "entradas"}
                      </span>
                    </div>
                    <Button
                      size="icon"
                      className="h-8 w-8 bg-blue-600 text-white hover:bg-blue-700"
                      onClick={() => setSelectedEvent(event)}
                      aria-label="Ver detalles"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      </main>

      <EventDetailDialog
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
      />
    </>
  )
}
