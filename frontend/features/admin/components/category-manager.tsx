"use client"

import { useEventContext } from "@/shared/providers/event-context"
import { CategoryManagerBase } from "./category-manager-base"

export function CategoryManager() {
  const { categories, addCategory, updateCategory, deleteCategory, canDeleteCategory } = useEventContext()

  return (
    <CategoryManagerBase
      title="Categorias"
      description="Gestiona las categorias de tus eventos."
      entityName="Categoria"
      placeholder="Ej: Conferencias"
      deleteBlockedMessage="No se puede eliminar: tiene eventos asociados"
      items={categories}
      canDeleteItem={canDeleteCategory}
      onAdd={addCategory}
      onUpdate={updateCategory}
      onDelete={deleteCategory}
    />
  )
}