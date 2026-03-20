"use client"

export function ReportUsersView() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-2 pb-6 sm:pb-8">
        <h1
          className="text-2xl font-bold tracking-tight text-foreground sm:text-4xl"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Reporte - Usuarios
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed sm:text-base">
          Usuarios registrados en la plataforma.
        </p>
      </div>

      <div className="rounded-lg border border-dashed border-border bg-muted/30 px-6 py-12 text-center">
        <p className="text-sm text-muted-foreground">
          Sin datos por ahora.
        </p>
      </div>
    </main>
  )
}
