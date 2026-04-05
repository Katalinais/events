"use client"

import { CalendarDays, CalendarCheck2, Users, TrendingUp } from "lucide-react"
import { useEvents, usePastEvents, useAdminUsers, useTotalEarnings } from "@/shared/hooks/use-events"

const COP = (n: number) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(n)

interface MetricCardProps {
  icon: React.ReactNode
  label: string
  value: string
  color: string
}

function MetricCard({ icon, label, value, color }: MetricCardProps) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${color}`}>
        {icon}
      </div>
      <div className="flex flex-col gap-0.5">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className="text-2xl font-bold tracking-tight text-foreground">{value}</span>
      </div>
    </div>
  )
}

export function AdminMetrics() {
  const { data: activeEvents = [] } = useEvents()
  const { data: pastEvents = [] } = usePastEvents()
  const { data: users = [] } = useAdminUsers()
  const { data: totalEarnings = 0 } = useTotalEarnings()

  return (
    <div className="grid grid-cols-1 gap-4 pb-8 sm:grid-cols-2 xl:grid-cols-4">
      <MetricCard
        icon={<TrendingUp className="h-6 w-6 text-emerald-600" />}
        label="Ganancias totales"
        value={COP(totalEarnings)}
        color="bg-emerald-50 dark:bg-emerald-950"
      />
      <MetricCard
        icon={<CalendarDays className="h-6 w-6 text-primary" />}
        label="Eventos activos"
        value={String(activeEvents.length)}
        color="bg-primary/10"
      />
      <MetricCard
        icon={<CalendarCheck2 className="h-6 w-6 text-orange-500" />}
        label="Eventos finalizados"
        value={String(pastEvents.length)}
        color="bg-orange-50 dark:bg-orange-950"
      />
      <MetricCard
        icon={<Users className="h-6 w-6 text-violet-500" />}
        label="Usuarios registrados"
        value={String(users.length)}
        color="bg-violet-50 dark:bg-violet-950"
      />
    </div>
  )
}
