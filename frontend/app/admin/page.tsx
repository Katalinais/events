"use client"

import { useState } from "react"
import type { AdminNavView } from "@/features/admin/types"
import { AdminNavbar } from "@/features/admin/components/admin-navbar"
import { AdminDashboard } from "@/features/admin/components/admin-dashboard"
import { ReportView } from "@/features/admin/components/report-view"
import { ReportUsersView } from "@/features/admin/components/report-users-view"

export default function AdminPage() {
  const [currentView, setCurrentView] = useState<AdminNavView>("gestion-eventos")

  return (
    <div className="min-h-screen bg-background flex flex-col sm:flex-row">
      <AdminNavbar currentView={currentView} onViewChange={setCurrentView} />
      <main className="flex-1">
        {currentView === "gestion-eventos" && <AdminDashboard section="events" />}
        {currentView === "categorias-eventos" && <AdminDashboard section="categories" />}
        {currentView === "categorias-boletas" && <AdminDashboard section="ticket-categories" />}
        {currentView === "reporte-eventos" && <ReportView />}
        {currentView === "reporte-usuarios" && <ReportUsersView />}
      </main>
    </div>
  )
}