"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { eventApi, type EventItem } from "@/lib/api-client"
import { toast } from "sonner"

// Query keys
export const eventKeys = {
  all: ['events'] as const,
  lists: () => [...eventKeys.all, 'list'] as const,
  list: (filters: string) => [...eventKeys.lists(), { filters }] as const,
  details: () => [...eventKeys.all, 'detail'] as const,
  detail: (id: string) => [...eventKeys.details(), id] as const,
  upcoming: () => [...eventKeys.all, 'upcoming'] as const,
}

// Hook para obtener todos los eventos
export function useEvents() {
  return useQuery({
    queryKey: eventKeys.lists(),
    queryFn: () => eventApi.getEvents(),
  })
}

// Hook para obtener un evento por ID
export function useEvent(id: string) {
  return useQuery({
    queryKey: eventKeys.detail(id),
    queryFn: () => eventApi.getEvent(id),
    enabled: !!id,
  })
}

// Hook para obtener próximos eventos
export function useUpcomingEvents(limit?: number) {
  return useQuery({
    queryKey: [...eventKeys.upcoming(), limit],
    queryFn: () => eventApi.getUpcomingEvents(limit),
  })
}

// Hook para crear un evento
export function useCreateEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (event: Omit<EventItem, 'id' | 'interested'>) => 
      eventApi.createEvent(event),
    onSuccess: () => {
      // Invalidar y refetch la lista de eventos
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() })
      toast.success('Evento creado correctamente')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al crear el evento')
    },
  })
}

// Hook para actualizar un evento
export function useUpdateEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, ...event }: { id: string } & Partial<Omit<EventItem, 'id' | 'interested'>>) =>
      eventApi.updateEvent(id, event),
    onSuccess: (data) => {
      // Actualizar el cache del evento específico
      queryClient.setQueryData(eventKeys.detail(data.id), data)
      // Invalidar la lista para asegurar consistencia
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() })
      toast.success('Evento actualizado correctamente')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al actualizar el evento')
    },
  })
}

// Hook para eliminar un evento
export function useDeleteEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => eventApi.deleteEvent(id),
    onSuccess: (_, id) => {
      // Remover el evento del cache
      queryClient.removeQueries({ queryKey: eventKeys.detail(id) })
      // Invalidar la lista
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() })
      toast.success('Evento eliminado correctamente')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al eliminar el evento')
    },
  })
}
