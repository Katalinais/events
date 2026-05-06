"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { ticketApi, type TicketPurchaseItem, type PurchasedEvent } from "@/shared/lib/api-client"
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

export function useDownloadEventPdf() {
  return useMutation({
    mutationFn: async (eventId: number) => {
      const blob = await ticketApi.getEventPdf(eventId)
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `boletas-evento-${eventId}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    },
  })
}

export function useMyPurchasedEvents() {
  return useQuery<PurchasedEvent[]>({
    queryKey: [...ticketKeys.my(), 'events'] as const,
    queryFn: () => ticketApi.getMyPurchasedEvents(),
  })
}

export function useDownloadPdf() {
  return useMutation({
    mutationFn: async (ticketId: number) => {
      const blob = await ticketApi.downloadPdf(ticketId)
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `boletas-${ticketId}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    },
  })
}