"use client"

import { useState } from "react"
import { AdminNavbar, type AdminNavView } from "@/components/admin-navbar"
import { AdminDashboard } from "@/components/admin/admin-dashboard"
import { ReportView } from "@/components/admin/report-view"

export default function AdminPage() {
  const [currentView, setCurrentView] = useState<AdminNavView>("gestion-eventos")

  return (
    <div className="min-h-screen bg-background">
      <AdminNavbar currentView={currentView} onViewChange={setCurrentView} />
      {currentView === "gestion-eventos" && <AdminDashboard section="events" />}
      {currentView === "gestion-categorias" && <AdminDashboard section="categories" />}
      {currentView === "reporte" && <ReportView />}
    </div>
  )
}