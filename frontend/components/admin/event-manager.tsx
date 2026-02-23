"use client"

import { useState } from "react"
import Image from "next/image"
import {
  Plus,
  Pencil,
  Trash2,
  CalendarDays,
  AlertCircle,
  ImageIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
import { Badge } from "@/components/ui/badge"
import { useEvents } from "@/lib/event-context"
import { toast } from "sonner"
import type { EventItem } from "@/lib/store"

interface EventFormData {
  name: string
  description: string
  date: string
  categoryId: string
  imageUrl: string
  price: string
}

const defaultFormData: EventFormData = {
  name: "",
  description: "",
  date: "",
  categoryId: "",
  imageUrl: "",
  price: "",
}

const sampleImages = [
  "/images/event-music.jpg",
  "/images/event-tech.jpg",
  "/images/event-food.jpg",
  "/images/event-art.jpg",
  "/images/event-sports.jpg",
]

export function EventManager() {
  const { events, categories, addEvent, updateEvent, deleteEvent, getCategoryName } =
    useEvents()
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null)
  const [deletingEvent, setDeletingEvent] = useState<EventItem | null>(null)
  const [formData, setFormData] = useState<EventFormData>(defaultFormData)
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof EventFormData, string>>>({})

  const sortedEvents = [...events].sort((a, b) => b.interested - a.interested)

  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof EventFormData, string>> = {}
    if (!formData.name.trim()) errors.name = "El nombre es obligatorio"
    if (!formData.date) errors.date = "La fecha es obligatoria"
    if (!formData.categoryId) errors.categoryId = "Selecciona una categoria"
    if (!formData.imageUrl) errors.imageUrl = "Selecciona una imagen"
    if (formData.price && isNaN(Number(formData.price)))
      errors.price = "El precio debe ser un numero"
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleCreate = () => {
    if (!validateForm()) return
    addEvent({
      name: formData.name.trim(),
      description: formData.description.trim(),
      date: formData.date,
      categoryId: formData.categoryId,
      imageUrl: formData.imageUrl,
      price: formData.price ? Number(formData.price) : 0,
    })
    setFormData(defaultFormData)
    setIsCreateOpen(false)
    setFormErrors({})
    toast.success("Evento creado correctamente")
  }

  const handleUpdate = () => {
    if (!validateForm() || !editingEvent) return
    updateEvent(editingEvent.id, {
      name: formData.name.trim(),
      description: formData.description.trim(),
      date: formData.date,
      categoryId: formData.categoryId,
      imageUrl: formData.imageUrl,
      price: formData.price ? Number(formData.price) : 0,
    })
    setEditingEvent(null)
    setFormData(defaultFormData)
    setFormErrors({})
    toast.success("Evento actualizado correctamente")
  }

  const handleDelete = () => {
    if (deletingEvent) {
      deleteEvent(deletingEvent.id)
      setDeletingEvent(null)
      toast.success("Evento eliminado correctamente")
    }
  }

  const openCreate = () => {
    setFormData(defaultFormData)
    setFormErrors({})
    setIsCreateOpen(true)
  }

  const openEdit = (event: EventItem) => {
    setEditingEvent(event)
    setFormData({
      name: event.name,
      description: event.description,
      date: event.date,
      categoryId: event.categoryId,
      imageUrl: event.imageUrl,
      price: event.price.toString(),
    })
    setFormErrors({})
  }

  const updateField = (field: keyof EventFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (formErrors[field]) {
      setFormErrors((prev) => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    }
  }

  const renderForm = () => (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="event-name">
          Nombre <span className="text-destructive">*</span>
        </Label>
        <Input
          id="event-name"
          placeholder="Nombre del evento"
          value={formData.name}
          onChange={(e) => updateField("name", e.target.value)}
        />
        {formErrors.name && (
          <p className="flex items-center gap-1 text-sm text-destructive">
            <AlertCircle className="h-3.5 w-3.5" />
            {formErrors.name}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="event-description">Descripcion</Label>
        <Textarea
          id="event-description"
          placeholder="Descripcion del evento"
          value={formData.description}
          onChange={(e) => updateField("description", e.target.value)}
          rows={3}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="event-date">
            Fecha <span className="text-destructive">*</span>
          </Label>
          <Input
            id="event-date"
            type="date"
            value={formData.date}
            onChange={(e) => updateField("date", e.target.value)}
          />
          {formErrors.date && (
            <p className="flex items-center gap-1 text-sm text-destructive">
              <AlertCircle className="h-3.5 w-3.5" />
              {formErrors.date}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="event-category">
            Categoria <span className="text-destructive">*</span>
          </Label>
          <Select
            value={formData.categoryId}
            onValueChange={(v) => updateField("categoryId", v)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecciona categoria" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {formErrors.categoryId && (
            <p className="flex items-center gap-1 text-sm text-destructive">
              <AlertCircle className="h-3.5 w-3.5" />
              {formErrors.categoryId}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="event-price">Precio (USD)</Label>
        <Input
          id="event-price"
          type="number"
          step="0.01"
          min="0"
          placeholder="0.00"
          value={formData.price}
          onChange={(e) => updateField("price", e.target.value)}
        />
        {formErrors.price && (
          <p className="flex items-center gap-1 text-sm text-destructive">
            <AlertCircle className="h-3.5 w-3.5" />
            {formErrors.price}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label>
          Imagen <span className="text-destructive">*</span>
        </Label>
        <div className="grid grid-cols-5 gap-2">
          {sampleImages.map((img) => (
            <button
              key={img}
              type="button"
              onClick={() => updateField("imageUrl", img)}
              className={`relative aspect-video overflow-hidden rounded-md border-2 transition-all ${
                formData.imageUrl === img
                  ? "border-primary ring-2 ring-primary/30"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <Image
                src={img}
                alt="Imagen de evento"
                fill
                className="object-cover"
                sizes="80px"
              />
            </button>
          ))}
        </div>
        {formErrors.imageUrl && (
          <p className="flex items-center gap-1 text-sm text-destructive">
            <AlertCircle className="h-3.5 w-3.5" />
            {formErrors.imageUrl}
          </p>
        )}
      </div>
    </div>
  )

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2
            className="text-xl font-semibold text-foreground"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Eventos
          </h2>
          <p className="text-sm text-muted-foreground">
            Gestiona tus eventos y visualiza el interes del publico.
          </p>
        </div>
        <Button
          onClick={openCreate}
          className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Nuevo Evento</span>
        </Button>
      </div>

      <div className="rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16 hidden sm:table-cell">Imagen</TableHead>
              <TableHead>Evento</TableHead>
              <TableHead className="hidden md:table-cell">Categoria</TableHead>
              <TableHead className="hidden md:table-cell">Fecha</TableHead>
              <TableHead className="text-center">Interesados</TableHead>
              <TableHead className="w-[100px] text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedEvents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  No hay eventos creados.
                </TableCell>
              </TableRow>
            ) : (
              sortedEvents.map((event) => {
                const formattedDate = new Date(event.date + "T00:00:00").toLocaleDateString("es-ES", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })
                return (
                  <TableRow key={event.id}>
                    <TableCell className="hidden sm:table-cell">
                      <div className="relative h-10 w-14 overflow-hidden rounded-md">
                        <Image
                          src={event.imageUrl}
                          alt={event.name}
                          fill
                          className="object-cover"
                          sizes="56px"
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium text-foreground">{event.name}</span>
                        <span className="text-xs text-muted-foreground md:hidden">
                          {getCategoryName(event.categoryId)} · {formattedDate}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge variant="secondary" className="text-xs">
                        {getCategoryName(event.categoryId)}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <CalendarDays className="h-3.5 w-3.5" />
                        {formattedDate}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="inline-flex items-center justify-center rounded-full bg-primary/10 px-2.5 py-0.5 text-sm font-semibold text-primary">
                        {event.interested}
                      </span>
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
                                onClick={() => openEdit(event)}
                              >
                                <Pencil className="h-4 w-4" />
                                <span className="sr-only">Editar evento</span>
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
                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                onClick={() => setDeletingEvent(event)}
                              >
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Eliminar evento</span>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Eliminar</TooltipContent>
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
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Nuevo Evento</DialogTitle>
            <DialogDescription>
              Completa la informacion para crear un nuevo evento.
            </DialogDescription>
          </DialogHeader>
          {renderForm()}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreate} className="bg-primary text-primary-foreground hover:bg-primary/90">
              Crear Evento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editingEvent} onOpenChange={() => setEditingEvent(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar Evento</DialogTitle>
            <DialogDescription>
              Modifica la informacion del evento.
            </DialogDescription>
          </DialogHeader>
          {renderForm()}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingEvent(null)}>
              Cancelar
            </Button>
            <Button onClick={handleUpdate} className="bg-primary text-primary-foreground hover:bg-primary/90">
              Guardar Cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingEvent} onOpenChange={() => setDeletingEvent(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar Evento</AlertDialogTitle>
            <AlertDialogDescription>
              {"Esta accion no se puede deshacer. Se eliminara el evento "}
              <strong>{deletingEvent?.name}</strong>
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
