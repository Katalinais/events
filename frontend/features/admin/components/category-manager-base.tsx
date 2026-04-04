"use client"

import { useState } from "react"
import { Plus, Pencil, Trash2, Tag, AlertCircle } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/shared/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/components/ui/alert-dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip"

interface CategoryItem {
  id: string
  name: string
}

interface CategoryManagerBaseProps {
  title: string
  description: string
  entityName: string
  placeholder: string
  deleteBlockedMessage?: string
  items: CategoryItem[]
  canDeleteItem: (id: string) => boolean
  onAdd: (name: string) => Promise<void>
  onUpdate: (id: string, name: string) => Promise<void>
  onDelete: (id: string) => Promise<void | boolean>
}

export function CategoryManagerBase({
  title,
  description,
  entityName,
  placeholder,
  deleteBlockedMessage = "No se puede eliminar: tiene elementos asociados",
  items,
  canDeleteItem,
  onAdd,
  onUpdate,
  onDelete,
}: CategoryManagerBaseProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<CategoryItem | null>(null)
  const [deletingItem, setDeletingItem] = useState<CategoryItem | null>(null)
  const [newName, setNewName] = useState("")
  const [editName, setEditName] = useState("")
  const [errors, setErrors] = useState<{ create?: string; edit?: string }>({})

  const handleCreate = async () => {
    if (!newName.trim()) {
      setErrors({ create: "El nombre es obligatorio" })
      return
    }
    try {
      await onAdd(newName.trim())
      setNewName("")
      setIsCreateOpen(false)
      setErrors({})
    } catch {}
  }

  const handleEdit = async () => {
    if (!editName.trim()) {
      setErrors({ edit: "El nombre es obligatorio" })
      return
    }
    if (!editingItem) return
    try {
      await onUpdate(editingItem.id, editName.trim())
      setEditingItem(null)
      setEditName("")
      setErrors({})
    } catch {}
  }

  const handleDelete = async () => {
    if (!deletingItem) return
    await onDelete(deletingItem.id)
    setDeletingItem(null)
  }

  const openEdit = (item: CategoryItem) => {
    setEditingItem(item)
    setEditName(item.name)
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
            {title}
          </h2>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <Button
          onClick={() => {
            setIsCreateOpen(true)
            setNewName("")
            setErrors({})
          }}
          size="icon"
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          <span className="sr-only">Nueva {entityName}</span>
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
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                  No hay {title.toLowerCase()} creadas.
                </TableCell>
              </TableRow>
            ) : (
              items.map((item, index) => {
                const isDeletable = canDeleteItem(item.id)
                return (
                  <TableRow key={item.id}>
                    <TableCell className="text-muted-foreground font-mono text-xs">
                      {index + 1}
                    </TableCell>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Tag className="h-4 w-4 text-primary" />
                        {item.name}
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
                                onClick={() => openEdit(item)}
                              >
                                <Pencil className="h-4 w-4" />
                                <span className="sr-only">Editar {entityName}</span>
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
                                onClick={() => setDeletingItem(item)}
                                disabled={!isDeletable}
                              >
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Eliminar {entityName}</span>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              {isDeletable ? "Eliminar" : deleteBlockedMessage}
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
            <DialogTitle>Nueva {entityName}</DialogTitle>
            <DialogDescription>
              Crea una nueva {entityName.toLowerCase()} para organizar tus entradas.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <Label htmlFor="item-name">Nombre</Label>
            <Input
              id="item-name"
              placeholder={placeholder}
              value={newName}
              onChange={(e) => {
                setNewName(e.target.value)
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
              Crear {entityName}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editingItem} onOpenChange={() => setEditingItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar {entityName}</DialogTitle>
            <DialogDescription>
              Modifica el nombre de la {entityName.toLowerCase()}.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <Label htmlFor="edit-item-name">Nombre</Label>
            <Input
              id="edit-item-name"
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
            <Button variant="outline" onClick={() => setEditingItem(null)}>
              Cancelar
            </Button>
            <Button onClick={handleEdit} className="bg-primary text-primary-foreground hover:bg-primary/90">
              Guardar Cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingItem} onOpenChange={() => setDeletingItem(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar {entityName}</AlertDialogTitle>
            <AlertDialogDescription>
              {"Esta accion no se puede deshacer. Se eliminara "}
              <strong>{deletingItem?.name}</strong>
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
