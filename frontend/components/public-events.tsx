"use client"

import { CalendarDays, Search } from "lucide-react"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useEventContext } from "@/lib/event-context"
import { useAuth } from "@/lib/auth-context"
import { useEvents, useFavoriteEvents } from "@/lib/hooks/use-events"
import { EventCard } from "@/components/event-card"

interface PublicEventsProps {
  onRequestLogin?: () => void
}

export function PublicEvents({ onRequestLogin }: PublicEventsProps) {
  const { categories } = useEventContext()
  const { isAuthenticated } = useAuth()
  const { data: events = [], isLoading } = useEvents()
  const { data: favoriteEvents = [] } = useFavoriteEvents({ enabled: isAuthenticated })
  const [search, setSearch] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")

  const favoriteIds = new Set(favoriteEvents.map((e) => e.id))

  const filteredEvents = events.filter((event) => {
    const matchesSearch = event.name.toLowerCase().includes(search.toLowerCase())
    const matchesCategory =
      selectedCategory === "all" || event.categoryId === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-2 pb-8">
        <h1
          className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Descubre Eventos
        </h1>
        <p className="text-muted-foreground leading-relaxed">
          Explora los mejores eventos y marca tu interes en los que mas te gusten.
        </p>
      </div>

      <div className="flex flex-col gap-4 pb-8 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar eventos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las categorias</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <CalendarDays className="h-8 w-8 text-muted-foreground animate-pulse" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">Cargando eventos...</h3>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <CalendarDays className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">No se encontraron eventos</h3>
          <p className="max-w-sm text-sm text-muted-foreground">
            Intenta ajustar los filtros de busqueda para encontrar lo que buscas.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredEvents.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onRequestLogin={onRequestLogin}
              initialFavorite={isAuthenticated && favoriteIds.has(event.id)}
            />
          ))}
        </div>
      )}
    </main>
  )
}
