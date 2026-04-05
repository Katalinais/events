"use client"

import { useState } from "react"
import Image from "next/image"
import { CalendarDays } from "lucide-react"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog"
import { useEventContext } from "@/shared/providers/event-context"
import type { EventItem } from "@/features/events/types"

interface PastEventCardProps {
  event: EventItem
}

export function PastEventCard({ event }: PastEventCardProps) {
  const { getCategoryName } = useEventContext()
  const [open, setOpen] = useState(false)

  const formattedDate = new Date(event.date + "T00:00:00").toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })

  return (
    <>
      <article className="group flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all hover:shadow-md">
        <div className="relative aspect-[16/10] shrink-0 overflow-hidden">
          <Image
            src={event.imageUrl}
            alt={event.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          <div className="absolute top-3 left-3">
            <Badge variant="secondary" className="border-0 text-xs font-medium">
              {getCategoryName(event.categoryId)}
            </Badge>
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-3 p-4">
          <div className="flex flex-col gap-1">
            <h3
              className="line-clamp-2 text-lg font-semibold leading-snug text-foreground"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {event.name}
            </h3>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <CalendarDays className="h-3.5 w-3.5" />
              <span className="text-sm">{formattedDate}</span>
            </div>
          </div>

          <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
            {event.description}
          </p>

          <div className="mt-auto border-t border-border/60 pt-3">
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => setOpen(true)}
            >
              Ver detalles
            </Button>
          </div>
        </div>
      </article>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle style={{ fontFamily: "var(--font-heading)" }}>
              {event.name}
            </DialogTitle>
          </DialogHeader>

          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-lg">
            <Image
              src={event.imageUrl}
              alt={event.name}
              fill
              className="object-cover"
            />
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="border-0 text-xs">
                {getCategoryName(event.categoryId)}
              </Badge>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <CalendarDays className="h-3.5 w-3.5" />
                {formattedDate}
              </div>
            </div>

            {event.description && (
              <p className="text-sm leading-relaxed text-muted-foreground">
                {event.description}
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
