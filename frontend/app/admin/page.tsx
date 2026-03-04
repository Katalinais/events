"use client"

import { useState } from "react"
import { AdminNavbar, type AdminNavView } from "@/components/admin-navbar"
import { AdminDashboard } from "@/components/admin/admin-dashboard"
import { ReportView } from "@/components/admin/report-view"

export default function AdminPage() {
  const [currentView, setCurrentView] = useState<AdminNavView>("gestion")

  return (
    <div className="min-h-screen bg-background">
      <AdminNavbar currentView={currentView} onViewChange={setCurrentView} />
      {currentView === "gestion" && <AdminDashboard />}
      {currentView === "reporte" && <ReportView />}
    </div>
  )
}
