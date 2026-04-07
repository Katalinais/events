"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { ticketEntriesApi } from "@/shared/lib/api-client"

export const ticketEntryKeys = {
  byEvent: (eventId: string) => ["ticket-entries", eventId] as const,
}

export function useTicketEntries(eventId: string | null) {
  return useQuery({
    queryKey: ticketEntryKeys.byEvent(eventId ?? ""),
    queryFn: () => ticketEntriesApi.getTicketEntries(eventId!),
    enabled: !!eventId,
  })
}

export function useSaveTicketEntries() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      eventId,
      entries,
    }: {
      eventId: string
      entries: { ticketCategoryId: number; totalQuantity: number; price: number }[]
    }) => ticketEntriesApi.saveTicketEntries(eventId, entries),
    onSuccess: (_data, { eventId }) => {
      queryClient.invalidateQueries({ queryKey: ticketEntryKeys.byEvent(eventId) })
    },
  })
}