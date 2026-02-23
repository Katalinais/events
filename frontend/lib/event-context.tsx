"use client"

import React, { createContext, useContext, useState, useCallback } from "react"
import {
  type Category,
  initialCategories,
} from "@/lib/store"
import { useEvents as useEventsQuery } from "@/lib/hooks/use-events"

interface EventContextType {
  categories: Category[]
  addCategory: (name: string) => void
  updateCategory: (id: string, name: string) => void
  deleteCategory: (id: string) => boolean
  canDeleteCategory: (id: string) => boolean
  getCategoryName: (categoryId: string) => string
}

const EventContext = createContext<EventContextType | undefined>(undefined)

export function EventProvider({ children }: { children: React.ReactNode }) {
  const [categories, setCategories] = useState<Category[]>(initialCategories)
  
  // Usar React Query para obtener eventos
  const { data: events = [] } = useEventsQuery()

  const addCategory = useCallback((name: string) => {
    const newCategory: Category = {
      id: `cat-${Date.now()}`,
      name,
    }
    setCategories((prev) => [...prev, newCategory])
  }, [])

  const updateCategory = useCallback((id: string, name: string) => {
    setCategories((prev) =>
      prev.map((cat) => (cat.id === id ? { ...cat, name } : cat))
    )
  }, [])

  const canDeleteCategory = useCallback(
    (id: string) => {
      return !events.some((event: { categoryId: string }) => event.categoryId === id)
    },
    [events]
  )

  const deleteCategory = useCallback(
    (id: string) => {
      if (!canDeleteCategory(id)) return false
      setCategories((prev) => prev.filter((cat) => cat.id !== id))
      return true
    },
    [canDeleteCategory]
  )


  const getCategoryName = useCallback(
    (categoryId: string) => {
      return categories.find((cat) => cat.id === categoryId)?.name ?? "Sin categoria"
    },
    [categories]
  )

  return (
    <EventContext.Provider
      value={{
        categories,
        addCategory,
        updateCategory,
        deleteCategory,
        canDeleteCategory,
        getCategoryName,
      }}
    >
      {children}
    </EventContext.Provider>
  )
}

export function useEventContext() {
  const context = useContext(EventContext)
  if (!context) {
    throw new Error("useEventContext must be used within an EventProvider")
  }
  return context
}
