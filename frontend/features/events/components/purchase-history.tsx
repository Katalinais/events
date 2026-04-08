"use client"

import { useState } from "react"
import { Download, ShoppingBag, CalendarDays, Ticket } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { Badge } from "@/shared/components/ui/badge"
import { Separator } from "@/shared/components/ui/separator"
import { useMyTickets } from "@/shared/hooks/use-tickets"
import { ticketApi } from "@/shared/lib/api-client"

const COP = (n: number) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(n)

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

function isUpcoming(eventDate: string) {
  return new Date(eventDate) > new Date()
}

export function PurchaseHistory() {
  const { data: purchases = [], isLoading } = useMyTickets()
  const [downloading, setDownloading] = useState<number | null>(null)

  const handleDownload = async (purchaseId: number) => {
    setDownloading(purchaseId)
    try {
      const blob = await ticketApi.downloadPdf(purchaseId)
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `boletas-${purchaseId}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setDownloading(null)
    }
  }

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

  if (purchases.length === 0) {
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
    <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-2 pb-8">
        <h1
          className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Mis compras
        </h1>
        <p className="text-muted-foreground leading-relaxed">
          {purchases.length} {purchases.length === 1 ? "compra realizada" : "compras realizadas"}.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {purchases.map((purchase) => {
          const firstDetail = purchase.detalles[0]
          if (!firstDetail) return null
          const evento = firstDetail.eventoEntrada.evento
          const upcoming = isUpcoming(evento.fecha)

          return (
            <article
              key={purchase.id}
              className="rounded-xl border border-border bg-card shadow-sm"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-3 p-5">
                <div className="flex flex-col gap-1">
                  <h2
                    className="text-lg font-semibold leading-snug text-foreground"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    {evento.nombre}
                  </h2>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <CalendarDays className="h-3.5 w-3.5" />
                      {formatDate(evento.fecha)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Ticket className="h-3.5 w-3.5" />
                      Comprado el {formatDate(purchase.fechaVenta)}
                    </span>
                  </div>
                </div>
                <Badge
                  variant={upcoming ? "default" : "secondary"}
                  className="shrink-0 text-xs"
                >
                  {upcoming ? "Próximo" : "Finalizado"}
                </Badge>
              </div>

              <Separator />

              {/* Detalle de boletas */}
              <div className="flex flex-col gap-0 divide-y divide-border">
                {purchase.detalles.map((detalle) => (
                  <div
                    key={detalle.id}
                    className="flex items-center justify-between px-5 py-3 text-sm"
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

              <Separator />

              {/* Footer: total + acción */}
              <div className="flex items-center justify-between gap-3 px-5 py-4">
                <span className="text-base font-bold text-foreground">
                  Total: {COP(purchase.total)}
                </span>
                {upcoming && (
                  <Button
                    size="sm"
                    className="gap-2"
                    disabled={downloading === purchase.id}
                    onClick={() => handleDownload(purchase.id)}
                  >
                    <Download className="h-4 w-4" />
                    {downloading === purchase.id ? "Generando..." : "Descargar boletas"}
                  </Button>
                )}
              </div>
            </article>
          )
        })}
      </div>
    </main>
  )
}
