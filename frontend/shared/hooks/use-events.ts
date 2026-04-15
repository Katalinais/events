"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { eventApi, ticketApi, userApi, type EventItem } from "@/shared/lib/api-client"

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

export function useTotalEarnings() {
  return useQuery({
    queryKey: [...eventKeys.all, 'total-earnings'] as const,
    queryFn: () => ticketApi.getTotalEarnings(),
  })
}

export function useAllEventsSalesSummary() {
  return useQuery({
    queryKey: [...eventKeys.all, 'sales-summary'] as const,
    queryFn: () => eventApi.getAllEventsSalesSummary(),
  })
}

export function useEventSalesReport(eventId: string | null) {
  return useQuery({
    queryKey: [...eventKeys.all, 'sales-report', eventId] as const,
    queryFn: () => eventApi.getEventSalesReport(eventId!),
    enabled: !!eventId,
  })
}

export function useTopSellingEvents() {
  return useQuery({
    queryKey: [...eventKeys.all, 'top-selling'] as const,
    queryFn: () => eventApi.getTopSellingEvents(),
    refetchInterval: 60_000,
    refetchIntervalInBackground: false,
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

interface MutationCallbacks {
  onSuccess?: () => void
  onError?: (error: Error) => void
}

export function useCreateEvent(callbacks?: MutationCallbacks) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (event: Omit<EventItem, 'id' | 'interested'>) =>
      eventApi.createEvent(event),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() })
      callbacks?.onSuccess?.()
    },
    onError: (error: Error) => {
      callbacks?.onError?.(error)
    },
  })
}

export function useUpdateEvent(callbacks?: MutationCallbacks) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, ...event }: { id: string } & Partial<Omit<EventItem, 'id' | 'interested'>>) =>
      eventApi.updateEvent(id, event),
    onSuccess: (data) => {
      queryClient.setQueryData(eventKeys.detail(data.id), data)
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() })
      callbacks?.onSuccess?.()
    },
    onError: (error: Error) => {
      callbacks?.onError?.(error)
    },
  })
}

export function useDeleteEvent(callbacks?: MutationCallbacks) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => eventApi.deleteEvent(id),
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: eventKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() })
      callbacks?.onSuccess?.()
    },
    onError: (error: Error) => {
      callbacks?.onError?.(error)
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
    },
  })
}