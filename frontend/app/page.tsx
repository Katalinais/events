"use client"

import { useState } from "react"
import { Navbar } from "@/components/navbar"
import { PublicEvents } from "@/components/public-events"
import { AdminDashboard } from "@/components/admin/admin-dashboard"

export default function Home() {
  const [currentView, setCurrentView] = useState<"public" | "admin">("public")

  return (
    <div className="min-h-screen bg-background">
      <Navbar currentView={currentView} onViewChange={setCurrentView} />
      {currentView === "public" ? <PublicEvents /> : <AdminDashboard />}
    </div>
  )
}
