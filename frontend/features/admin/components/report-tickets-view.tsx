"use client"

import { useState } from "react"
import { Eye, Ticket } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table"
import { useAllEventsSalesSummary, useEventSalesReport } from "@/shared/hooks/use-events"

const COP = (n: number) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP" }).format(n)

function DetailDialog({
  eventId,
  eventName,
  open,
  onOpenChange,
}: {
  eventId: string | null
  eventName: string
  open: boolean
  onOpenChange: (v: boolean) => void
}) {
  const { data: report, isLoading } = useEventSalesReport(open ? eventId : null)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="line-clamp-1">{eventName}</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
            Cargando detalle...
          </div>
        ) : !report || report.lineas.length === 0 ? (
          <div className="flex h-32 flex-col items-center justify-center gap-2 text-center">
            <Ticket className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Sin boletas vendidas aún.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="text-right">Precio</TableHead>
                  <TableHead className="text-right">Vendidas</TableHead>
                  <TableHead className="text-right">Ganancia</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {report.lineas.map((linea) => (
                  <TableRow key={linea.categoria}>
                    <TableCell className="font-medium">{linea.categoria}</TableCell>
                    <TableCell className="text-right">{COP(linea.precioUnitario)}</TableCell>
                    <TableCell className="text-right">{linea.cantidadVendida}</TableCell>
                    <TableCell className="text-right">{COP(linea.ganancia)}</TableCell>
                  </TableRow>
                ))}
                <TableRow className="bg-muted/50 font-semibold">
                  <TableCell>Total</TableCell>
                  <TableCell />
                  <TableCell className="text-right">{report.totalEntradas}</TableCell>
                  <TableCell className="text-right">{COP(report.gananciaTotal)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

export function ReportTicketsView() {
  const { data: summaries = [], isLoading } = useAllEventsSalesSummary()
  const [selected, setSelected] = useState<{ id: string; nombre: string } | null>(null)

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-2 pb-6 sm:pb-8">
        <h1
          className="text-2xl font-bold tracking-tight text-foreground sm:text-4xl"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Reporte - Boletas vendidas
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed sm:text-base">
          Ganancias por evento. Haz clic en "Ver detalle" para ver el desglose por tipo de entrada.
        </p>
      </div>

      {isLoading ? (
        <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
          Cargando reporte...
        </div>
      ) : (
        <>
          {/* Mobile: tarjetas */}
          <div className="flex flex-col gap-2 md:hidden">
            {summaries.length === 0 ? (
              <div className="rounded-lg border border-border bg-card px-4 py-12 text-center text-sm text-muted-foreground">
                No hay eventos.
              </div>
            ) : (
              summaries.map((s) => (
                <div
                  key={s.eventoId}
                  className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card px-4 py-3"
                >
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="truncate font-medium text-foreground">{s.eventoNombre}</span>
                    <span className="text-xs text-muted-foreground">
                      {s.totalEntradas} boletas · {COP(s.gananciaTotal)}
                    </span>
                  </div>
                  <Button
                    size="icon"
                    className="h-8 w-8 bg-primary text-primary-foreground hover:bg-primary/90"
                    onClick={() => setSelected({ id: String(s.eventoId), nombre: s.eventoNombre })}
                    aria-label="Ver detalle"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              ))
            )}
          </div>

          {/* Desktop: tabla */}
          <div className="hidden md:block overflow-x-auto rounded-lg border border-border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[200px]">Evento</TableHead>
                  <TableHead className="text-right w-36">Boletas vendidas</TableHead>
                  <TableHead className="text-right w-44">Ganancia total</TableHead>
                  <TableHead className="w-32" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {summaries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                      No hay eventos.
                    </TableCell>
                  </TableRow>
                ) : (
                  summaries.map((s) => (
                    <TableRow key={s.eventoId}>
                      <TableCell className="font-medium">{s.eventoNombre}</TableCell>
                      <TableCell className="text-right">{s.totalEntradas}</TableCell>
                      <TableCell className="text-right">{COP(s.gananciaTotal)}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="icon"
                          className="h-8 w-8 bg-primary text-primary-foreground hover:bg-primary/90"
                          onClick={() =>
                            setSelected({ id: String(s.eventoId), nombre: s.eventoNombre })
                          }
                          aria-label="Ver detalle"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </>
      )}

      <DetailDialog
        eventId={selected?.id ?? null}
        eventName={selected?.nombre ?? ""}
        open={!!selected}
        onOpenChange={(v) => { if (!v) setSelected(null) }}
      />
    </main>
  )
}
