"use client"

import { PublicNavbar } from "@/features/navigation/components/public-navbar"
import { PurchaseHistory } from "@/features/events/components/purchase-history"
import { useAuth } from "@/shared/providers/auth-context"
import { ShoppingBag } from "lucide-react"

function PageContent() {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-3 py-20 text-center px-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <ShoppingBag className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground">Inicia sesión para ver tus compras</h3>
        <p className="max-w-sm text-sm text-muted-foreground">
          Aquí verás el historial de todas las boletas que hayas comprado.
        </p>
      </main>
    )
  }

  return <PurchaseHistory />
}

export default function PastEventsPage() {
  return (
    <div className="h-screen overflow-hidden bg-background flex flex-col sm:flex-row">
      <PublicNavbar />
      <main className="flex-1 overflow-y-auto">
        <PageContent />
      </main>
    </div>
  )
}
