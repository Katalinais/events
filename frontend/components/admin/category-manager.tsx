"use client"

import { useState } from "react"
import { Plus, Pencil, Trash2, Tag, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useEventContext } from "@/lib/event-context"
import { useEvents } from "@/lib/hooks/use-events"
import { toast } from "sonner"

export function CategoryManager() {
  const { categories, addCategory, updateCategory, deleteCategory, canDeleteCategory } = useEventContext()
  const { data: events = [] } = useEvents()
  
  const canDelete = (id: string) => {
    return !events.some((event) => event.categoryId === id)
  }
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<{ id: string; name: string } | null>(null)
  const [deletingCategory, setDeletingCategory] = useState<{ id: string; name: string } | null>(null)
  const [newCategoryName, setNewCategoryName] = useState("")
  const [editName, setEditName] = useState("")
  const [errors, setErrors] = useState<{ create?: string; edit?: string }>({})

  const handleCreate = () => {
    if (!newCategoryName.trim()) {
      setErrors({ create: "El nombre es obligatorio" })
      return
    }
    addCategory(newCategoryName.trim())
    setNewCategoryName("")
    setIsCreateOpen(false)
    setErrors({})
    toast.success("Categoria creada correctamente")
  }

  const handleEdit = () => {
    if (!editName.trim()) {
      setErrors({ edit: "El nombre es obligatorio" })
      return
    }
    if (editingCategory) {
      updateCategory(editingCategory.id, editName.trim())
      setEditingCategory(null)
      setEditName("")
      setErrors({})
      toast.success("Categoria actualizada correctamente")
    }
  }

  const handleDelete = () => {
    if (deletingCategory) {
      const success = deleteCategory(deletingCategory.id)
      if (success) {
        toast.success("Categoria eliminada correctamente")
      }
      setDeletingCategory(null)
    }
  }

  const openEdit = (category: { id: string; name: string }) => {
    setEditingCategory(category)
    setEditName(category.name)
    setErrors({})
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2
            className="text-xl font-semibold text-foreground"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Categorias
          </h2>
          <p className="text-sm text-muted-foreground">
            Gestiona las categorias de tus eventos.
          </p>
        </div>
        <Button
          onClick={() => {
            setIsCreateOpen(true)
            setNewCategoryName("")
            setErrors({})
          }}
          size="icon"
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          <span className="sr-only">Nueva Categoria</span>
        </Button>
      </div>

      <div className="rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead className="w-[120px] text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                  No hay categorias creadas.
                </TableCell>
              </TableRow>
            ) : (
              categories.map((category, index) => {
                const isDeletable = canDeleteCategory(category.id)
                return (
                  <TableRow key={category.id}>
                    <TableCell className="text-muted-foreground font-mono text-xs">
                      {index + 1}
                    </TableCell>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Tag className="h-4 w-4 text-primary" />
                        {category.name}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                onClick={() => openEdit(category)}
                              >
                                <Pencil className="h-4 w-4" />
                                <span className="sr-only">Editar categoria</span>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Editar</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-destructive disabled:opacity-40"
                                onClick={() => setDeletingCategory(category)}
                                disabled={!isDeletable}
                              >
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Eliminar categoria</span>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              {isDeletable
                                ? "Eliminar"
                                : "No se puede eliminar: tiene eventos asociados"}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nueva Categoria</DialogTitle>
            <DialogDescription>
              Crea una nueva categoria para organizar tus eventos.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <Label htmlFor="category-name">Nombre</Label>
            <Input
              id="category-name"
              placeholder="Ej: Conferencias"
              value={newCategoryName}
              onChange={(e) => {
                setNewCategoryName(e.target.value)
                if (errors.create) setErrors({})
              }}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            />
            {errors.create && (
              <p className="flex items-center gap-1 text-sm text-destructive">
                <AlertCircle className="h-3.5 w-3.5" />
                {errors.create}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreate} className="bg-primary text-primary-foreground hover:bg-primary/90">
              Crear Categoria
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editingCategory} onOpenChange={() => setEditingCategory(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Categoria</DialogTitle>
            <DialogDescription>
              Modifica el nombre de la categoria.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <Label htmlFor="edit-category-name">Nombre</Label>
            <Input
              id="edit-category-name"
              value={editName}
              onChange={(e) => {
                setEditName(e.target.value)
                if (errors.edit) setErrors({})
              }}
              onKeyDown={(e) => e.key === "Enter" && handleEdit()}
            />
            {errors.edit && (
              <p className="flex items-center gap-1 text-sm text-destructive">
                <AlertCircle className="h-3.5 w-3.5" />
                {errors.edit}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingCategory(null)}>
              Cancelar
            </Button>
            <Button onClick={handleEdit} className="bg-primary text-primary-foreground hover:bg-primary/90">
              Guardar Cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingCategory} onOpenChange={() => setDeletingCategory(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar Categoria</AlertDialogTitle>
            <AlertDialogDescription>
              {"Esta accion no se puede deshacer. Se eliminara la categoria "}
              <strong>{deletingCategory?.name}</strong>
              {" de forma permanente."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
