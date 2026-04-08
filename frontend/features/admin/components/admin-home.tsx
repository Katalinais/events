"use client"

import { AdminMetrics } from "@/features/admin/components/admin-metrics"

export function AdminHome() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-2 pb-8">
        <h1
          className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Panel de Administración
        </h1>
        <p className="text-muted-foreground leading-relaxed">
          Resumen general de la plataforma.
        </p>
      </div>

      <AdminMetrics />
    </main>
  )
}
