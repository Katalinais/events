"use client"

  import { useCallback } from "react"
  import { toast } from "sonner"
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
      onSuccess: () => toast.success("Categoría de boleta creada correctamente"),
      onError: (error) => toast.error(error.message || "Error al crear la categoría de boleta"),
    })
    const updateMutation = useUpdateTicketCategory({
      onSuccess: () => toast.success("Categoría de boleta actualizada correctamente"),
      onError: (error) => toast.error(error.message || "Error al actualizar la categoría de boleta"),
    })
    const deleteMutation = useDeleteTicketCategory({
      onSuccess: () => toast.success("Categoría de boleta eliminada correctamente"),
      onError: (error) => toast.error(error.message || "Error al eliminar la categoría de boleta"),
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