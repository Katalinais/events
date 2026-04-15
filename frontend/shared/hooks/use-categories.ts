"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { categoryApi, type CategoryItem } from "@/shared/lib/api-client"

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

interface MutationCallbacks {
  onSuccess?: () => void
  onError?: (error: Error) => void
}

export function useCreateCategory(callbacks?: MutationCallbacks) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (name: string) => categoryApi.createCategory(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() })
      callbacks?.onSuccess?.()
    },
    onError: (error: Error) => {
      callbacks?.onError?.(error)
    },
  })
}

export function useUpdateCategory(callbacks?: MutationCallbacks) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) =>
      categoryApi.updateCategory(id, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() })
      callbacks?.onSuccess?.()
    },
    onError: (error: Error) => {
      callbacks?.onError?.(error)
    },
  })
}

export function useDeleteCategory(callbacks?: MutationCallbacks) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => categoryApi.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() })
      callbacks?.onSuccess?.()
    },
    onError: (error: Error) => {
      callbacks?.onError?.(error)
    },
  })
}
