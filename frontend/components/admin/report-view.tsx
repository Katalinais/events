"use client"

import { useState, Fragment } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronRight, Users } from "lucide-react"
import { useEvents, useReportEvents } from "@/lib/hooks/use-events"
import type { ReportInteresado } from "@/lib/api-client"

export function ReportView() {
  const { data: events = [], isLoading: eventsLoading } = useEvents()
  const { data: reportData = [], isLoading: reportLoading } = useReportEvents()
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const sortedByInterested = [...events].sort((a, b) => b.interested - a.interested)

  const getInterestedUsers = (eventId: string): ReportInteresado[] => {
    const report = reportData.find((e) => e.id === eventId)
    return report?.interestedUsers ?? []
  }

  const toggleDetails = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id))
  }

  if (eventsLoading) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <p className="text-muted-foreground">Cargando reporte...</p>
      </main>
    )
  }

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
          Número de interesados por evento. Usa &quot;Ver detalles&quot; para ver quiénes marcaron interés.
        </p>
      </div>

      {/* Mobile: tarjetas con Ver detalles */}
      <div className="flex flex-col gap-2 md:hidden">
        {sortedByInterested.length === 0 ? (
          <div className="rounded-lg border border-border bg-card px-4 py-12 text-center text-muted-foreground">
            No hay eventos.
          </div>
        ) : (
          sortedByInterested.map((event) => (
            <div
              key={event.id}
              className="rounded-lg border border-border bg-card px-4 py-3"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="min-w-0 flex-1 truncate font-medium text-foreground">
                  {event.name}
                </span>
                <span className="shrink-0 inline-flex items-center justify-center rounded-full bg-primary/10 px-2.5 py-0.5 text-sm font-semibold text-primary">
                  {event.interested}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="shrink-0 gap-1 text-muted-foreground hover:text-foreground"
                  onClick={() => toggleDetails(event.id)}
                >
                  {expandedId === event.id ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                  Ver detalles
                </Button>
              </div>
              {expandedId === event.id && (
                <div className="mt-3 border-t border-border pt-3">
                  {reportLoading ? (
                    <p className="text-sm text-muted-foreground">Cargando detalles...</p>
                  ) : (() => {
                    const users = getInterestedUsers(event.id)
                    if (users.length === 0) {
                      return <p className="text-sm italic text-muted-foreground">Ningún usuario ha marcado interés.</p>
                    }
                    return (
                      <>
                        <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                          <Users className="h-3.5 w-3.5" />
                          Usuarios que marcaron interés
                        </p>
                        <ul className="text-sm text-foreground space-y-1.5">
                          {users.map((u) => (
                            <li key={u.id} className="flex flex-wrap gap-x-2 gap-y-0">
                              <span className="font-medium">{u.nombre}</span>
                              {u.username && <span className="text-muted-foreground">@{u.username}</span>}
                              {u.correo && <span className="text-muted-foreground">{u.correo}</span>}
                            </li>
                          ))}
                        </ul>
                      </>
                    )
                  })()}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Desktop: tabla con Ver detalles */}
      <div className="hidden md:block overflow-x-auto rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[200px]">Nombre del evento</TableHead>
              <TableHead className="text-right w-28 whitespace-nowrap">
                Interesados
              </TableHead>
              <TableHead className="w-32"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedByInterested.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                  No hay eventos.
                </TableCell>
              </TableRow>
            ) : (
              sortedByInterested.map((event) => (
                <Fragment key={event.id}>
                  <TableRow>
                    <TableCell className="font-medium">{event.name}</TableCell>
                    <TableCell className="text-right">
                      <span className="inline-flex items-center justify-center rounded-full bg-primary/10 px-2.5 py-0.5 text-sm font-semibold text-primary">
                        {event.interested}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1.5 text-muted-foreground hover:text-foreground"
                        onClick={() => toggleDetails(event.id)}
                      >
                        {expandedId === event.id ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                        Ver detalles
                      </Button>
                    </TableCell>
                  </TableRow>
                  {expandedId === event.id && (
                    <TableRow className="bg-muted/40">
                      <TableCell colSpan={3} className="py-4">
                          {reportLoading ? (
                          <p className="text-sm text-muted-foreground">Cargando detalles...</p>
                        ) : (() => {
                          const users = getInterestedUsers(event.id)
                          if (users.length === 0) {
                            return <p className="text-sm italic text-muted-foreground">Ningún usuario ha marcado interés.</p>
                          }
                          return (
                            <div>
                              <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
                                <Users className="h-4 w-4" />
                                Usuarios que marcaron interés
                              </p>
                              <ul className="text-sm text-foreground space-y-1">
                                {users.map((u) => (
                                  <li key={u.id} className="flex flex-wrap gap-x-2 gap-y-0">
                                    <span className="font-medium">{u.nombre}</span>
                                    {u.username && <span className="text-muted-foreground">@{u.username}</span>}
                                    {u.correo && <span className="text-muted-foreground">{u.correo}</span>}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )
                        })()}
                      </TableCell>
                    </TableRow>
                  )}
                </Fragment>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </main>
  )
}
