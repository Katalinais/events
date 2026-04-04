"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { ticketCategoryApi } from "@/shared/lib/api-client"
import { toast } from "sonner"

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

export function useCreateTicketCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (name: string) => ticketCategoryApi.createTicketCategory(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ticketCategoryKeys.lists() })
      toast.success("Categoría de boleta creada correctamente")
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al crear la categoría de boleta")
    },
  })
}

export function useUpdateTicketCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) =>
      ticketCategoryApi.updateTicketCategory(id, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ticketCategoryKeys.lists() })
      toast.success("Categoría de boleta actualizada correctamente")
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al actualizar la categoría de boleta")
    },
  })
}

export function useDeleteTicketCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => ticketCategoryApi.deleteTicketCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ticketCategoryKeys.lists() })
      toast.success("Categoría de boleta eliminada correctamente")
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al eliminar la categoría de boleta")
    },
  })
}
