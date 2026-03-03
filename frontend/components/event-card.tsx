"use client"

import { useState, useRef, useLayoutEffect, useEffect } from "react"
import Image from "next/image"
import { CalendarDays, Heart, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useEventContext } from "@/lib/event-context"
import { useAuth } from "@/lib/auth-context"
import { useMarkInterested, useUnmarkInterested } from "@/lib/hooks/use-events"
import type { EventItem } from "@/lib/api-client"

function isTruncated(el: HTMLElement | null): boolean {
  if (!el) return false
  return el.scrollHeight > el.clientHeight
}

interface EventCardProps {
  event: EventItem
  onRequestLogin?: () => void
  initialFavorite?: boolean
}

export function EventCard({ event, onRequestLogin, initialFavorite = false }: EventCardProps) {
  const { getCategoryName } = useEventContext()
  const { isAuthenticated } = useAuth()
  const markInterested = useMarkInterested()
  const unmarkInterested = useUnmarkInterested()
  const [expanded, setExpanded] = useState(false)
  const [needsVerMas, setNeedsVerMas] = useState(false)
  const [isFavorite, setIsFavorite] = useState(initialFavorite)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const descRef = useRef<HTMLParagraphElement>(null)

  const checkTruncation = () => {
    if (expanded) {
      setNeedsVerMas(false)
      return
    }
    const truncated = isTruncated(titleRef.current) || isTruncated(descRef.current)
    setNeedsVerMas(truncated)
  }

  useEffect(() => {
    setIsFavorite(initialFavorite)
  }, [initialFavorite])

  useLayoutEffect(() => {
    checkTruncation()
  }, [expanded, event.name, event.description])

  useEffect(() => {
    const titleEl = titleRef.current
    const descEl = descRef.current
    if (!titleEl && !descEl) return
    const observer = new ResizeObserver(checkTruncation)
    if (titleEl) observer.observe(titleEl)
    if (descEl) observer.observe(descEl)
    return () => observer.disconnect()
  }, [expanded, event.name, event.description])

  const formattedDate = new Date(event.date + "T00:00:00").toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })

  const formattedPrice = new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "COP",
  }).format(event.price)

  const handleInterested = () => {
    if (!isAuthenticated) {
      onRequestLogin?.()
      return
    }
    if (isFavorite) {
      unmarkInterested.mutate(event.id, {
        onSuccess: () => {
          setIsFavorite(false)
        },
      })
    } else {
      markInterested.mutate(event.id, {
        onSuccess: () => {
          setIsFavorite(true)
        },
      })
    }
  }

  const interestedButtonLabel = isAuthenticated
    ? (markInterested.isPending || unmarkInterested.isPending
        ? "..."
        : isFavorite
          ? "Quitar de favoritos"
          : "Marcar como favorito")
    : "Marcar como favorito"
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
            ref={titleRef}
            className={`text-lg font-semibold leading-snug text-foreground ${!expanded ? "line-clamp-2" : ""}`}
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {event.name}
          </h3>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <CalendarDays className="h-3.5 w-3.5" />
            <span className="text-sm">{formattedDate}</span>
          </div>
        </div>

        <p
          ref={descRef}
          className={`text-sm leading-relaxed text-muted-foreground ${!expanded ? "line-clamp-2" : ""}`}
        >
          {event.description}
        </p>

        {(needsVerMas || expanded) && (
          <button
            type="button"
            onClick={() => setExpanded((e) => !e)}
            className="-ml-1 flex w-fit items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            {expanded ? (
              <>
                <ChevronUp className="h-3.5 w-3.5" />
                Ver menos
              </>
            ) : (
              <>
                <ChevronDown className="h-3.5 w-3.5" />
                Ver más
              </>
            )}
          </button>
        )}

        <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Heart
            className={`h-4 w-4 ${isFavorite ? "text-red-500" : "text-primary"}`}
            fill={isFavorite ? "currentColor" : "none"}
          />
            <span className="font-medium">{event.interested}</span>
            <span className="hidden sm:inline">favoritos</span>
          </div>

          <Button
            size="sm"
            onClick={handleInterested}
            disabled={markInterested.isPending || unmarkInterested.isPending}
            className={`gap-1.5 ${
              isFavorite
                ? "bg-red-500 text-white hover:bg-red-600"
                : "bg-primary text-primary-foreground hover:bg-primary/90"
            }`}
          >
            <Heart
              className="h-3.5 w-3.5"
              fill={isFavorite ? "currentColor" : "none"}
            />
            {interestedButtonLabel}
          </Button>
        </div>
      </div>
    </article>
  )
}
