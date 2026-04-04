"use client"

  import { useCallback } from "react"
  import {
    useTicketCategories,
    useCreateTicketCategory,
    useUpdateTicketCategory,
    useDeleteTicketCategory,
  } from "@/shared/hooks/use-ticket-categories"
  import { CategoryManagerBase } from "./category-manager-base"

  export function TicketCategoryManager() {
    const { data: items = [] } = useTicketCategories()
    const createMutation = useCreateTicketCategory()
    const updateMutation = useUpdateTicketCategory()
    const deleteMutation = useDeleteTicketCategory()

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
        deleteBlockedMessage="No se puede eliminar: tiene boletas asociadas"
        items={items}
        canDeleteItem={() => true}
        onAdd={handleAdd}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
      />
    )
  }