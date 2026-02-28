"use client"

import { useState } from "react"
import { Navbar, type NavView } from "@/components/navbar"
import { PublicEvents } from "@/components/public-events"
import { AdminDashboard } from "@/components/admin/admin-dashboard"
import { ReportView } from "@/components/admin/report-view"
import { LoginForm } from "@/components/login-form"
import { RegisterForm } from "@/components/register-form"
import { useAuth } from "@/lib/auth-context"

export default function Home() {
  const [currentView, setCurrentView] = useState<NavView>("public")
  const [authFormMode, setAuthFormMode] = useState<"login" | "register">("login")
  const { isAuthenticated, isLoading } = useAuth()

  const needsLogin =
    (currentView === "gestion" || currentView === "reporte") && !isAuthenticated && !isLoading

  return (
    <div className="min-h-screen bg-background">
      <Navbar currentView={currentView} onViewChange={setCurrentView} />
      {needsLogin && authFormMode === "login" && (
        <LoginForm onSwitchToRegister={() => setAuthFormMode("register")} />
      )}
      {needsLogin && authFormMode === "register" && (
        <RegisterForm
          onSwitchToLogin={() => setAuthFormMode("login")}
          onSuccess={() => setAuthFormMode("login")}
        />
      )}
      {!needsLogin && currentView === "public" && (
        <PublicEvents onRequestLogin={() => setCurrentView("gestion")} />
      )}
      {!needsLogin && currentView === "gestion" && <AdminDashboard />}
      {!needsLogin && currentView === "reporte" && <ReportView />}
    </div>
  )
}
