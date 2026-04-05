"use client"

  import { CategoryManager } from "@/features/admin/components/category-manager"
  import { EventManager } from "@/features/admin/components/event-manager"
  import { TicketCategoryManager } from "@/features/admin/components/ticket-category-manager"
  import { AdminMetrics } from "@/features/admin/components/admin-metrics"

  interface AdminDashboardProps {
    section: "events" | "categories" | "event-categories" | "ticket-categories"
  }

  export function AdminDashboard({ section }: AdminDashboardProps) {
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

        {section === "events" && <AdminMetrics />}
        {section === "events" && <EventManager />}
        {section === "categories" && <CategoryManager />}
        {section === "event-categories" && <CategoryManager />}
        {section === "ticket-categories" && <TicketCategoryManager />}
      </main>
    )
  }