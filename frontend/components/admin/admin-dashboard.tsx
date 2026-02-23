"use client"

import { BarChart3, CalendarDays, Heart, Tag } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CategoryManager } from "@/components/admin/category-manager"
import { EventManager } from "@/components/admin/event-manager"
import { useEvents } from "@/lib/event-context"

export function AdminDashboard() {
  const { events, categories } = useEvents()

  const totalInterested = events.reduce((sum, evt) => sum + evt.interested, 0)
  const topEvent = events.reduce(
    (top, evt) => (evt.interested > (top?.interested ?? 0) ? evt : top),
    events[0]
  )

  const stats = [
    {
      label: "Total Eventos",
      value: events.length,
      icon: CalendarDays,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      label: "Categorias",
      value: categories.length,
      icon: Tag,
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
    {
      label: "Total Interesados",
      value: totalInterested,
      icon: Heart,
      color: "text-destructive",
      bgColor: "bg-destructive/10",
    },
    {
      label: "Evento Popular",
      value: topEvent?.name ?? "N/A",
      icon: BarChart3,
      color: "text-primary",
      bgColor: "bg-primary/10",
      isText: true,
    },
  ]

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-2 pb-8">
        <h1
          className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Panel de Administracion
        </h1>
        <p className="text-muted-foreground leading-relaxed">
          Gestiona categorias, eventos y monitorea el interes del publico.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 pb-8 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 shadow-sm"
          >
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${stat.bgColor}`}
            >
              <stat.icon className={`h-6 w-6 ${stat.color}`} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {stat.label}
              </p>
              {stat.isText ? (
                <p className="truncate text-sm font-semibold text-foreground">
                  {stat.value}
                </p>
              ) : (
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="events" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="events" className="gap-2">
            <CalendarDays className="h-4 w-4" />
            Eventos
          </TabsTrigger>
          <TabsTrigger value="categories" className="gap-2">
            <Tag className="h-4 w-4" />
            Categorias
          </TabsTrigger>
        </TabsList>

        <TabsContent value="events">
          <EventManager />
        </TabsContent>

        <TabsContent value="categories">
          <CategoryManager />
        </TabsContent>
      </Tabs>
    </main>
  )
}
