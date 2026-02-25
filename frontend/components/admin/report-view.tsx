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
      <div className="flex flex-col gap-2 pb-8">
        <h1
          className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Reporte
        </h1>
        <p className="text-muted-foreground leading-relaxed">
          Número de interesados por evento.
        </p>
      </div>

      <div className="rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre del evento</TableHead>
              <TableHead className="text-right w-32">Número de interesados</TableHead>
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
