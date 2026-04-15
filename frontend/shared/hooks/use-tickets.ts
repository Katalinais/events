"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { ticketApi, type TicketPurchaseItem } from "@/shared/lib/api-client"
import { eventKeys } from "./use-events"

export const ticketKeys = {
  my: () => ["tickets", "my"] as const,
}

interface MutationCallbacks {
  onSuccess?: () => void
  onError?: (error: Error) => void
}

export function usePurchaseTickets(callbacks?: MutationCallbacks) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (items: TicketPurchaseItem[]) => ticketApi.purchase(items),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ticketKeys.my() })
      queryClient.invalidateQueries({ queryKey: [...eventKeys.all, "top-selling"] })
      callbacks?.onSuccess?.()
    },
    onError: (error: Error) => {
      callbacks?.onError?.(error)
    },
  })
}

export function useMyTickets() {
  return useQuery({
    queryKey: ticketKeys.my(),
    queryFn: () => ticketApi.getMyTickets(),
  })
}