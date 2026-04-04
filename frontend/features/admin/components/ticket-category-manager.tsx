"use client"

import { CategoryManagerBase } from "./category-manager-base"

export function TicketCategoryManager() {
  return (
    <CategoryManagerBase
      title="Categorias de Boletas"
      description="Gestiona las categorias de boletas para tus eventos."
      entityName="Categoria de Boleta"
      placeholder="Ej: VIP"
      deleteBlockedMessage="No se puede eliminar: tiene boletas asociadas"
      items={[]}
      canDeleteItem={() => true}
      onAdd={async () => {}}
      onUpdate={async () => {}}
      onDelete={async () => {}}
    />
  )
}
