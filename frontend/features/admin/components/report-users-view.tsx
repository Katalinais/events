"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table"
import { useAdminUsers } from "@/shared/hooks/use-events"

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("es", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  } catch {
    return iso
  }
}

export function ReportUsersView() {
  const { data: users = [], isLoading, isError, error } = useAdminUsers()

  if (isLoading) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <p className="text-muted-foreground">Cargando usuarios...</p>
      </main>
    )
  }

  if (isError) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <p className="text-destructive">
          {error instanceof Error ? error.message : "No se pudo cargar el listado de usuarios."}
        </p>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-2 pb-6 sm:pb-8">
        <h1
          className="text-2xl font-bold tracking-tight text-foreground sm:text-4xl"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Reporte · Usuarios
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed sm:text-base">
          Usuarios registrados en la plataforma ({users.length}).
        </p>
      </div>

      <div className="flex flex-col gap-2 md:hidden">
        {users.length === 0 ? (
          <div className="rounded-lg border border-border bg-card px-4 py-12 text-center text-muted-foreground">
            No hay usuarios.
          </div>
        ) : (
          users.map((u) => (
            <div
              key={u.id}
              className="rounded-lg border border-border bg-card px-4 py-3 text-sm"
            >
              <p className="font-medium text-foreground">
                {u.nombre}
                {u.apellido ? ` ${u.apellido}` : ""}
              </p>
              <p className="text-muted-foreground">@{u.username}</p>
              {u.correo && <p className="text-muted-foreground">{u.correo}</p>}
              <div className="mt-2 text-xs text-muted-foreground">
                {formatDate(u.createdAt)}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="hidden md:block overflow-x-auto rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Usuario</TableHead>
              <TableHead>Correo</TableHead>
              <TableHead className="whitespace-nowrap">Registro</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                  No hay usuarios.
                </TableCell>
              </TableRow>
            ) : (
              users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">
                    {u.nombre}
                    {u.apellido ? ` ${u.apellido}` : ""}
                  </TableCell>
                  <TableCell>@{u.username}</TableCell>
                  <TableCell className="text-muted-foreground">{u.correo ?? "—"}</TableCell>
                  <TableCell className="text-muted-foreground whitespace-nowrap">
                    {formatDate(u.createdAt)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </main>
  )
}