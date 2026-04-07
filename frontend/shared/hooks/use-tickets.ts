"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { ticketApi, type TicketPurchaseItem } from "@/shared/lib/api-client"
import { toast } from "sonner"
import { eventKeys } from "./use-events"

export const ticketKeys = {
  my: () => ["tickets", "my"] as const,
}

export function usePurchaseTickets() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (items: TicketPurchaseItem[]) => ticketApi.purchase(items),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ticketKeys.my() })
      queryClient.invalidateQueries({ queryKey: [...eventKeys.all, "top-selling"] })
      toast.success("¡Compra realizada con éxito!")
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al realizar la compra")
    },
  })
}

export function useMyTickets() {
  return useQuery({
    queryKey: ticketKeys.my(),
    queryFn: () => ticketApi.getMyTickets(),
  })
}
