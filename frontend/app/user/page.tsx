"use client"

import { CalendarDays, Heart } from "lucide-react"
import { useMemo } from "react"
import { useSearchParams } from "next/navigation"
import { useEvents, useFavoriteEvents } from "@/lib/hooks/use-events"
import { EventCard } from "@/components/event-card"

export default function UserFavoritesPage() {
  const searchParams = useSearchParams()
  const tab = searchParams.get("tab")
  const isEventsTab = tab === "events"

  const { data: favorites = [], isLoading: favLoading } = useFavoriteEvents()
  const { data: events = [], isLoading: eventsLoading } = useEvents({
    enabled: isEventsTab,
  })

  const favoriteIds = useMemo(() => new Set(favorites.map((e) => e.id)), [favorites])
  const isLoading = favLoading || (isEventsTab && eventsLoading)

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          {isEventsTab ? (
            <CalendarDays className="h-8 w-8 text-muted-foreground animate-pulse" />
          ) : (
            <Heart className="h-8 w-8 text-muted-foreground animate-pulse" />
          )}
        </div>
        <h3 className="text-lg font-semibold text-foreground">
          {isEventsTab ? "Cargando eventos..." : "Cargando tus favoritos..."}
        </h3>
      </div>
    )
  }

  if (!isEventsTab && favorites.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <Heart className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground">Aún no tienes favoritos</h3>
        <p className="max-w-sm text-sm text-muted-foreground">
          Marca como favorito los eventos que te interesen para verlos aquí de forma rápida.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
            {isEventsTab ? (
              <CalendarDays className="h-5 w-5 text-primary" />
            ) : (
              <Heart className="h-5 w-5 text-primary" />
            )}
          </div>
          <div>
            <h1
              className="text-2xl font-semibold tracking-tight text-foreground"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {isEventsTab ? "Eventos" : "Mis favoritos"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {isEventsTab
                ? "Explora los eventos y marca los que te interesen."
                : "Eventos que marcaste como favoritos."}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {(isEventsTab ? events : favorites).map((event) => (
          <EventCard
            key={event.id}
            event={event}
            initialFavorite={isEventsTab ? favoriteIds.has(event.id) : true}
          />
        ))}
      </div>
    </div>
  )
}

