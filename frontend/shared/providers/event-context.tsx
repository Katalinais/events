"use client"

import React, { createContext, useContext, useCallback } from "react"
import { toast } from "sonner"
import type { Category } from "@/shared/lib/store"
import { useAdminEvents } from "@/shared/hooks/use-events"
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from "@/shared/hooks/use-categories"

interface EventContextType {
  categories: Category[]
  addCategory: (name: string) => Promise<void>
  updateCategory: (id: string, name: string) => Promise<void>
  deleteCategory: (id: string) => Promise<boolean>
  canDeleteCategory: (id: string) => boolean
  getCategoryName: (categoryId: string) => string
}

const EventContext = createContext<EventContextType | undefined>(undefined)

export function EventProvider({ children }: { children: React.ReactNode }) {
  const { data: categories = [] } = useCategories()
  const { data: events = [] } = useAdminEvents()
  const createCategory = useCreateCategory({
    onSuccess: () => toast.success("Categoría creada correctamente"),
    onError: (error) => toast.error(error.message || "Error al crear la categoría"),
  })
  const updateCategoryMutation = useUpdateCategory({
    onSuccess: () => toast.success("Categoría actualizada correctamente"),
    onError: (error) => toast.error(error.message || "Error al actualizar la categoría"),
  })
  const deleteCategoryMutation = useDeleteCategory({
    onSuccess: () => toast.success("Categoría eliminada correctamente"),
    onError: (error) => toast.error(error.message || "Error al eliminar la categoría"),
  })

  const addCategory = useCallback(
    async (name: string) => {
      await createCategory.mutateAsync(name)
    },
    [createCategory]
  )

  const updateCategory = useCallback(
    async (id: string, name: string) => {
      await updateCategoryMutation.mutateAsync({ id, name })
    },
    [updateCategoryMutation]
  )

  const canDeleteCategory = useCallback(
    (id: string) => {
      return !events.some((event: { categoryId: string }) => event.categoryId === id)
    },
    [events]
  )

  const deleteCategory = useCallback(
    async (id: string) => {
      try {
        await deleteCategoryMutation.mutateAsync(id)
        return true
      } catch {
        return false
      }
    },
    [deleteCategoryMutation]
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
