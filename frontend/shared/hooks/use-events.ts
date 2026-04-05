"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { eventApi, userApi, type EventItem } from "@/shared/lib/api-client"
import { toast } from "sonner"

export const eventKeys = {
  all: ['events'] as const,
  lists: () => [...eventKeys.all, 'list'] as const,
  list: (filters: string) => [...eventKeys.lists(), { filters }] as const,
  adminList: () => [...eventKeys.all, 'admin-list'] as const,
  details: () => [...eventKeys.all, 'detail'] as const,
  detail: (id: string) => [...eventKeys.details(), id] as const,
  upcoming: () => [...eventKeys.all, 'upcoming'] as const,
  favorites: () => [...eventKeys.all, 'favorites'] as const,
  report: () => [...eventKeys.all, 'report'] as const,
}

export const adminKeys = {
  users: () => ['admin', 'users'] as const,
}

export function useEvents(options?: { enabled?: boolean }) {
  const enabled = options?.enabled ?? true
  return useQuery({
    queryKey: eventKeys.lists(),
    queryFn: () => eventApi.getEvents(),
    enabled,
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

export function useFavoriteEvents(options?: { enabled?: boolean }) {
  const enabled = options?.enabled ?? true

  return useQuery({
    queryKey: eventKeys.favorites(),
    queryFn: () => eventApi.getFavoriteEvents(),
    enabled,
  })
}

export function useTopSellingEvents() {
  return useQuery({
    queryKey: [...eventKeys.all, 'top-selling'] as const,
    queryFn: () => eventApi.getTopSellingEvents(),
  })
}

export function usePastEvents() {
  return useQuery({
    queryKey: [...eventKeys.all, 'past'] as const,
    queryFn: () => eventApi.getPastEvents(),
  })
}

export function useAdminEvents() {
  return useQuery({
    queryKey: eventKeys.adminList(),
    queryFn: () => eventApi.getAdminEvents(),
  })
}

export function useReportEvents() {
  return useQuery({
    queryKey: eventKeys.report(),
    queryFn: () => eventApi.getReportEvents(),
  })
}

export function useAdminUsers(options?: { enabled?: boolean }) {
  const enabled = options?.enabled ?? true
  return useQuery({
    queryKey: adminKeys.users(),
    queryFn: () => userApi.getAdminUsers(),
    enabled,
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
      queryClient.invalidateQueries({ queryKey: eventKeys.favorites() })
      queryClient.invalidateQueries({ queryKey: eventKeys.report() })
      toast.success('Has marcado tu interés en este evento')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al marcar interés')
    },
  })
}

export function useUnmarkInterested() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (eventId: string) => eventApi.unmarkInterested(eventId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() })
      queryClient.invalidateQueries({ queryKey: eventKeys.upcoming() })
      queryClient.invalidateQueries({ queryKey: eventKeys.favorites() })
      queryClient.invalidateQueries({ queryKey: eventKeys.report() })
      toast.success('Has quitado este evento de tus favoritos')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al quitar de favoritos')
    },
  })
}