"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { eventoEntradasApi } from "@/shared/lib/api-client"

export const eventoEntradasKeys = {
  byEvent: (eventoId: string) => ["evento-entradas", eventoId] as const,
}

export function useEventoEntradas(eventoId: string | null) {
  return useQuery({
    queryKey: eventoEntradasKeys.byEvent(eventoId ?? ""),
    queryFn: () => eventoEntradasApi.getEntradas(eventoId!),
    enabled: !!eventoId,
  })
}

export function useSaveEventoEntradas() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      eventoId,
      entradas,
    }: {
      eventoId: string
      entradas: { categoriaEntradaId: number; cantidadTotal: number; precio: number }[]
    }) => eventoEntradasApi.saveEntradas(eventoId, entradas),
    onSuccess: (_data, { eventoId }) => {
      queryClient.invalidateQueries({ queryKey: eventoEntradasKeys.byEvent(eventoId) })
    },
  })
}
