"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { categoryApi, type CategoryItem } from "@/lib/api-client"
import { toast } from "sonner"

export const categoryKeys = {
  all: ["categories"] as const,
  lists: () => [...categoryKeys.all, "list"] as const,
}

export function useCategories() {
  return useQuery({
    queryKey: categoryKeys.lists(),
    queryFn: () => categoryApi.getCategories(),
  })
}

export function useCreateCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (name: string) => categoryApi.createCategory(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() })
      toast.success("Categoría creada correctamente")
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al crear la categoría")
    },
  })
}

export function useUpdateCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) =>
      categoryApi.updateCategory(id, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() })
      toast.success("Categoría actualizada correctamente")
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al actualizar la categoría")
    },
  })
}

export function useDeleteCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => categoryApi.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() })
      toast.success("Categoría eliminada correctamente")
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al eliminar la categoría")
    },
  })
}
