"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { eventApi, type EventItem } from "@/lib/api-client"
import { toast } from "sonner"

export const eventKeys = {
  all: ['events'] as const,
  lists: () => [...eventKeys.all, 'list'] as const,
  list: (filters: string) => [...eventKeys.lists(), { filters }] as const,
  details: () => [...eventKeys.all, 'detail'] as const,
  detail: (id: string) => [...eventKeys.details(), id] as const,
  upcoming: () => [...eventKeys.all, 'upcoming'] as const,
}

export function useEvents() {
  return useQuery({
    queryKey: eventKeys.lists(),
    queryFn: () => eventApi.getEvents(),
  })
}

export function useEvent(id: string) {
  return useQuery({
    queryKey: eventKeys.detail(id),
    queryFn: () => eventApi.getEvent(id),
    enabled: !!id,
  })
}

export function useUpcomingEvents(limit?: number) {
  return useQuery({
    queryKey: [...eventKeys.upcoming(), limit],
    queryFn: () => eventApi.getUpcomingEvents(limit),
  })
}

export function useCreateEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (event: Omit<EventItem, 'id' | 'interested'>) => 
      eventApi.createEvent(event),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() })
      toast.success('Evento creado correctamente')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al crear el evento')
    },
  })
}

export function useUpdateEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, ...event }: { id: string } & Partial<Omit<EventItem, 'id' | 'interested'>>) =>
      eventApi.updateEvent(id, event),
    onSuccess: (data) => {
      queryClient.setQueryData(eventKeys.detail(data.id), data)
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() })
      toast.success('Evento actualizado correctamente')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al actualizar el evento')
    },
  })
}

export function useDeleteEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => eventApi.deleteEvent(id),
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: eventKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() })
      toast.success('Evento eliminado correctamente')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al eliminar el evento')
    },
  })
}

export function useMarkInterested() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (eventId: string) => eventApi.markInterested(eventId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() })
      queryClient.invalidateQueries({ queryKey: eventKeys.upcoming() })
      toast.success('Has marcado tu interés en este evento')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al marcar interés')
    },
  })
}
