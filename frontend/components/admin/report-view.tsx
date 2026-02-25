"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useEvents } from "@/lib/hooks/use-events"

export function ReportView() {
  const { data: events = [] } = useEvents()
  const sortedByInterested = [...events].sort((a, b) => b.interested - a.interested)

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-2 pb-6 sm:pb-8">
        <h1
          className="text-2xl font-bold tracking-tight text-foreground sm:text-4xl"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Reporte
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed sm:text-base">
          Número de interesados por evento.
        </p>
      </div>

      {/* Mobile: encabezados + lista en tarjetas */}
      <div className="flex flex-col gap-2 md:hidden">
        {/* Títulos de columnas */}
        <div className="flex items-center justify-between gap-3 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <span className="min-w-0 flex-1">Nombre del evento</span>
          <span className="shrink-0 w-16 text-right">Interesados</span>
        </div>
        {sortedByInterested.length === 0 ? (
          <div className="rounded-lg border border-border bg-card px-4 py-12 text-center text-muted-foreground">
            No hay eventos.
          </div>
        ) : (
          sortedByInterested.map((event) => (
            <div
              key={event.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card px-4 py-3"
            >
              <span className="min-w-0 flex-1 truncate font-medium text-foreground">
                {event.name}
              </span>
              <span className="shrink-0 w-16 text-right inline-flex items-center justify-center rounded-full bg-primary/10 px-2.5 py-0.5 text-sm font-semibold text-primary">
                {event.interested}
              </span>
            </div>
          ))
        )}
      </div>

      {/* Desktop: tabla */}
      <div className="hidden md:block overflow-x-auto rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[200px]">Nombre del evento</TableHead>
              <TableHead className="text-right w-40 whitespace-nowrap">
                Número de interesados
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedByInterested.length === 0 ? (
              <TableRow>
                <TableCell colSpan={2} className="h-24 text-center text-muted-foreground">
                  No hay eventos.
                </TableCell>
              </TableRow>
            ) : (
              sortedByInterested.map((event) => (
                <TableRow key={event.id}>
                  <TableCell className="font-medium">{event.name}</TableCell>
                  <TableCell className="text-right">
                    <span className="inline-flex items-center justify-center rounded-full bg-primary/10 px-2.5 py-0.5 text-sm font-semibold text-primary">
                      {event.interested}
                    </span>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </main>
  )
}
