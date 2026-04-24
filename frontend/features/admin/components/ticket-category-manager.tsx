"use client"

  import { useCallback } from "react"
  import { toast } from "sonner"
  import { TICKET_CATEGORY_MESSAGES } from "@/shared/constants/messages"
  import {
    useTicketCategories,
    useCreateTicketCategory,
    useUpdateTicketCategory,
    useDeleteTicketCategory,
  } from "@/shared/hooks/use-ticket-categories"
  import type { TicketCategoryItem } from "@/shared/lib/api-client"
  import { CategoryManagerBase } from "./category-manager-base"

  export function TicketCategoryManager() {
    const { data: items = [] } = useTicketCategories()
    const createMutation = useCreateTicketCategory({
      onSuccess: () => toast.success(TICKET_CATEGORY_MESSAGES.CREATE_SUCCESS),
      onError: (error) => toast.error(error.message || TICKET_CATEGORY_MESSAGES.CREATE_ERROR),
    })
    const updateMutation = useUpdateTicketCategory({
      onSuccess: () => toast.success(TICKET_CATEGORY_MESSAGES.UPDATE_SUCCESS),
      onError: (error) => toast.error(error.message || TICKET_CATEGORY_MESSAGES.UPDATE_ERROR),
    })
    const deleteMutation = useDeleteTicketCategory({
      onSuccess: () => toast.success(TICKET_CATEGORY_MESSAGES.DELETE_SUCCESS),
      onError: (error) => toast.error(error.message || TICKET_CATEGORY_MESSAGES.DELETE_ERROR),
    })

    const getSoldCount = (id: string) =>
      (items as TicketCategoryItem[]).find((i) => i.id === id)?.soldCount ?? 0

    const handleAdd = useCallback(
      async (name: string) => {
        await createMutation.mutateAsync(name)
      },
      [createMutation],
    )

    const handleUpdate = useCallback(
      async (id: string, name: string) => {
        await updateMutation.mutateAsync({ id, name })
      },
      [updateMutation],
    )

    const handleDelete = useCallback(
      async (id: string) => {
        await deleteMutation.mutateAsync(id)
      },
      [deleteMutation],
    )

    return (
      <CategoryManagerBase
        title="Categorias de Boletas"
        description="Gestiona las categorias de boletas para tus eventos."
        entityName="Categoria de Boleta"
        placeholder="Ej: VIP"
        items={items}
        canDeleteItem={(id) => getSoldCount(id) === 0}
        deleteBlockedMessage={(id) => {
          const count = getSoldCount(id)
          return `${count} ${count === 1 ? "boleta vendida" : "boletas vendidas"}`
        }}
        onAdd={handleAdd}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
      />
    )
  }