"use client"

import Image from "next/image"
import { CalendarDays, TrendingUp, Ticket } from "lucide-react"
import { Badge } from "@/shared/components/ui/badge"
import { useEventContext } from "@/shared/providers/event-context"
import { useTopSellingEvents } from "@/shared/hooks/use-events"

const MEDALS = ["🥇", "🥈", "🥉"]

export function TopSellingEvents() {
  const { getCategoryName } = useEventContext()
  const { data: events = [], isLoading } = useTopSellingEvents()

  if (isLoading) return null
  if (events.length === 0) return null

  return (
    <section className="pb-10">
      <div className="flex items-center gap-2 pb-4">
        <TrendingUp className="h-5 w-5 text-primary" />
        <h2
          className="text-xl font-bold tracking-tight text-foreground"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Los más vendidos
        </h2>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {events.map((event, index) => {
          const formattedDate = new Date(event.date + "T00:00:00").toLocaleDateString("es-ES", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })

          return (
            <div
              key={event.id}
              className="relative flex gap-3 overflow-hidden rounded-xl border border-border bg-card p-3 shadow-sm"
            >
              <div className="absolute top-2 right-2 text-lg leading-none">{MEDALS[index]}</div>

              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg">
                <Image
                  src={event.imageUrl}
                  alt={event.name}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              </div>

              <div className="flex min-w-0 flex-1 flex-col gap-1 pr-6">
                <Badge className="w-fit bg-primary/10 text-primary border-0 text-xs font-medium">
                  {getCategoryName(event.categoryId)}
                </Badge>
                <p
                  className="line-clamp-2 text-sm font-semibold leading-snug text-foreground"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  {event.name}
                </p>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <CalendarDays className="h-3 w-3 shrink-0" />
                  {formattedDate}
                </div>
                <div className="flex items-center gap-1 text-xs font-medium text-primary">
                  <Ticket className="h-3 w-3 shrink-0" />
                  {event.totalVendidas} {event.totalVendidas === 1 ? "boleta vendida" : "boletas vendidas"}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
