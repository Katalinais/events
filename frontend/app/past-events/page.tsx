"use client"

import { PublicNavbar } from "@/features/navigation/components/public-navbar"
import { PastEvents } from "@/features/events/components/past-events"

export default function PastEventsPage() {
  return (
    <div className="h-screen overflow-hidden bg-background flex flex-col sm:flex-row">
      <PublicNavbar />
      <main className="flex-1 overflow-y-auto">
        <PastEvents />
      </main>
    </div>
  )
}
