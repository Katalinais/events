"use client"

import Image from "next/image"
import { CalendarDays, Tag, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useEvents } from "@/lib/event-context"
import { toast } from "sonner"
import type { EventItem } from "@/lib/store"

interface EventCardProps {
  event: EventItem
}

export function EventCard({ event }: EventCardProps) {
  const { getCategoryName, incrementInterested } = useEvents()

  const formattedDate = new Date(event.date + "T00:00:00").toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })

  const formattedPrice = new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "USD",
  }).format(event.price)

  const handleInterested = () => {
    incrementInterested(event.id)
    toast.success("Has marcado tu interes en este evento")
  }

  return (
    <article className="group overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all hover:shadow-md">
      <div className="relative aspect-[16/10] overflow-hidden">
        <Image
          src={event.imageUrl}
          alt={event.name}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        <div className="absolute top-3 left-3">
          <Badge className="bg-primary text-primary-foreground border-0 text-xs font-medium">
            {getCategoryName(event.categoryId)}
          </Badge>
        </div>
        <div className="absolute top-3 right-3">
          <span className="inline-flex items-center gap-1 rounded-full bg-card/90 px-2.5 py-1 text-xs font-semibold text-foreground backdrop-blur-sm">
            {formattedPrice}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-3 p-4">
        <div className="flex flex-col gap-1">
          <h3
            className="text-lg font-semibold leading-tight text-foreground text-balance"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {event.name}
          </h3>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <CalendarDays className="h-3.5 w-3.5" />
            <span className="text-sm">{formattedDate}</span>
          </div>
        </div>

        <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {event.description}
        </p>

        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Heart className="h-4 w-4 text-primary" />
            <span className="font-medium">{event.interested}</span>
            <span className="hidden sm:inline">interesados</span>
          </div>

          <Button
            size="sm"
            onClick={handleInterested}
            className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Heart className="h-3.5 w-3.5" />
            Estoy interesado
          </Button>
        </div>
      </div>
    </article>
  )
}
