"use client"

import { Heart } from "lucide-react"
import { useFavoriteEvents, useUnmarkInterested } from "@/lib/hooks/use-events"
import { EventCard } from "@/components/event-card"
import { Button } from "@/components/ui/button"

export default function UserFavoritesPage() {
  const { data: events = [], isLoading } = useFavoriteEvents()
  const unmarkMutation = useUnmarkInterested()

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <Heart className="h-8 w-8 text-muted-foreground animate-pulse" />
        </div>
        <h3 className="text-lg font-semibold text-foreground">Cargando tus favoritos...</h3>
      </div>
    )
  }

  if (events.length === 0) {
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
            <Heart className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1
              className="text-2xl font-semibold tracking-tight text-foreground"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Mis favoritos
            </h1>
            <p className="text-sm text-muted-foreground">
              Eventos que marcaste como favoritos.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => (
          <div key={event.id} className="flex flex-col gap-3">
            <EventCard event={event} />
            <Button
              variant="outline"
              size="sm"
              className="justify-center"
              disabled={unmarkMutation.isPending}
              onClick={() => unmarkMutation.mutate(event.id)}
            >
              Quitar de favoritos
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}

