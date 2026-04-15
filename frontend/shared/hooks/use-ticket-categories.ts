"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { ticketCategoryApi } from "@/shared/lib/api-client"

export const ticketCategoryKeys = {
  all: ["ticket-categories"] as const,
  lists: () => [...ticketCategoryKeys.all, "list"] as const,
}

export function useTicketCategories() {
  return useQuery({
    queryKey: ticketCategoryKeys.lists(),
    queryFn: () => ticketCategoryApi.getTicketCategories(),
  })
}

interface MutationCallbacks {
  onSuccess?: () => void
  onError?: (error: Error) => void
}

export function useCreateTicketCategory(callbacks?: MutationCallbacks) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (name: string) => ticketCategoryApi.createTicketCategory(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ticketCategoryKeys.lists() })
      callbacks?.onSuccess?.()
    },
    onError: (error: Error) => {
      callbacks?.onError?.(error)
    },
  })
}

export function useUpdateTicketCategory(callbacks?: MutationCallbacks) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) =>
      ticketCategoryApi.updateTicketCategory(id, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ticketCategoryKeys.lists() })
      callbacks?.onSuccess?.()
    },
    onError: (error: Error) => {
      callbacks?.onError?.(error)
    },
  })
}

export function useDeleteTicketCategory(callbacks?: MutationCallbacks) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => ticketCategoryApi.deleteTicketCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ticketCategoryKeys.lists() })
      callbacks?.onSuccess?.()
    },
    onError: (error: Error) => {
      callbacks?.onError?.(error)
    },
  })
}
