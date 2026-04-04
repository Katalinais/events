"use client"

import { useState } from "react"
import { Minus, Plus, ShoppingCart, Ticket } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/shared/components/ui/dialog"
import { Separator } from "@/shared/components/ui/separator"
import { useEventoEntradas } from "@/shared/hooks/use-evento-entradas"
import { useTicketCategories } from "@/shared/hooks/use-ticket-categories"

interface PurchaseDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  eventId: string
  eventName: string
}

export function PurchaseDialog({ open, onOpenChange, eventId, eventName }: PurchaseDialogProps) {
  const { data: entradas = [], isLoading } = useEventoEntradas(open ? eventId : null)
  const { data: ticketCategories = [] } = useTicketCategories()
  const [quantities, setQuantities] = useState<Record<string, number>>({})

  const getCategoryName = (categoriaEntradaId: string) =>
    ticketCategories.find((c) => c.id === categoriaEntradaId)?.name ?? "Boleta"

  const updateQuantity = (entradaId: string, delta: number, max: number) => {
    setQuantities((prev) => {
      const current = prev[entradaId] ?? 0
      const next = Math.min(max, Math.max(0, current + delta))
      return { ...prev, [entradaId]: next }
    })
  }

  const total = entradas.reduce((sum, entrada) => {
    const qty = quantities[entrada.id] ?? 0
    return sum + qty * entrada.precio
  }, 0)

  const totalItems = Object.values(quantities).reduce((a, b) => a + b, 0)

  const formattedTotal = new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "COP",
  }).format(total)

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) setQuantities({}) }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Ticket className="h-5 w-5 text-primary" />
            Comprar boletas
          </DialogTitle>
          <DialogDescription className="line-clamp-1">{eventName}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 py-2">
          {isLoading ? (
            <div className="flex h-24 items-center justify-center text-sm text-muted-foreground">
              Cargando boletas...
            </div>
          ) : entradas.length === 0 ? (
            <div className="flex h-24 items-center justify-center text-sm text-muted-foreground">
              No hay boletas disponibles para este evento.
            </div>
          ) : (
            entradas.map((entrada) => {
              const qty = quantities[entrada.id] ?? 0
              const disponible = entrada.cantidadDisponible
              const precio = new Intl.NumberFormat("es-ES", {
                style: "currency",
                currency: "COP",
              }).format(entrada.precio)

              return (
                <div
                  key={entrada.id}
                  className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3"
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium">
                      {getCategoryName(entrada.categoriaEntradaId)}
                    </span>
                    <span className="text-xs text-muted-foreground">{precio} · {disponible} disponibles</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-7 w-7"
                      disabled={qty === 0}
                      onClick={() => updateQuantity(entrada.id, -1, disponible)}
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </Button>
                    <span className="w-5 text-center text-sm tabular-nums">{qty}</span>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-7 w-7"
                      disabled={qty >= disponible}
                      onClick={() => updateQuantity(entrada.id, 1, disponible)}
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {entradas.length > 0 && (
          <>
            <Separator />
            <div className="flex items-center justify-between px-1 text-sm">
              <span className="text-muted-foreground">
                {totalItems} {totalItems === 1 ? "boleta" : "boletas"}
              </span>
              <span className="font-semibold text-foreground">{formattedTotal}</span>
            </div>
          </>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
            disabled={totalItems === 0}
          >
            <ShoppingCart className="h-4 w-4" />
            Comprar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
