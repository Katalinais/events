"use client"

import React, { createContext, useContext, useState, useCallback } from "react"
import {
  type Category,
  type EventItem,
  initialCategories,
  initialEvents,
} from "@/lib/store"

interface EventContextType {
  categories: Category[]
  events: EventItem[]
  addCategory: (name: string) => void
  updateCategory: (id: string, name: string) => void
  deleteCategory: (id: string) => boolean
  canDeleteCategory: (id: string) => boolean
  addEvent: (event: Omit<EventItem, "id" | "interested">) => void
  updateEvent: (id: string, event: Partial<EventItem>) => void
  deleteEvent: (id: string) => void
  incrementInterested: (id: string) => void
  getCategoryName: (categoryId: string) => string
}

const EventContext = createContext<EventContextType | undefined>(undefined)

export function EventProvider({ children }: { children: React.ReactNode }) {
  const [categories, setCategories] = useState<Category[]>(initialCategories)
  const [events, setEvents] = useState<EventItem[]>(initialEvents)

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
      return !events.some((event) => event.categoryId === id)
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

  const addEvent = useCallback(
    (event: Omit<EventItem, "id" | "interested">) => {
      const newEvent: EventItem = {
        ...event,
        id: `evt-${Date.now()}`,
        interested: 0,
      }
      setEvents((prev) => [...prev, newEvent])
    },
    []
  )

  const updateEvent = useCallback(
    (id: string, eventData: Partial<EventItem>) => {
      setEvents((prev) =>
        prev.map((evt) => (evt.id === id ? { ...evt, ...eventData } : evt))
      )
    },
    []
  )

  const deleteEvent = useCallback((id: string) => {
    setEvents((prev) => prev.filter((evt) => evt.id !== id))
  }, [])

  const incrementInterested = useCallback((id: string) => {
    setEvents((prev) =>
      prev.map((evt) =>
        evt.id === id ? { ...evt, interested: evt.interested + 1 } : evt
      )
    )
  }, [])

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
        events,
        addCategory,
        updateCategory,
        deleteCategory,
        canDeleteCategory,
        addEvent,
        updateEvent,
        deleteEvent,
        incrementInterested,
        getCategoryName,
      }}
    >
      {children}
    </EventContext.Provider>
  )
}

export function useEvents() {
  const context = useContext(EventContext)
  if (!context) {
    throw new Error("useEvents must be used within an EventProvider")
  }
  return context
}
