"use client"

import { useState } from "react"
import { Navbar, type NavView } from "@/components/navbar"
import { PublicEvents } from "@/components/public-events"
import { AdminDashboard } from "@/components/admin/admin-dashboard"
import { ReportView } from "@/components/admin/report-view"

export default function Home() {
  const [currentView, setCurrentView] = useState<NavView>("public")

  return (
    <div className="min-h-screen bg-background">
      <Navbar currentView={currentView} onViewChange={setCurrentView} />
      {currentView === "public" && <PublicEvents />}
      {currentView === "gestion" && <AdminDashboard />}
      {currentView === "reporte" && <ReportView />}
    </div>
  )
}
