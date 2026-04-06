"use client"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import {
  Plus,
  Pencil,
  Trash2,
  CalendarDays,
  AlertCircle,
  ImageIcon,
  X,
} from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import { Textarea } from "@/shared/components/ui/textarea"
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select"
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
import { Badge } from "@/shared/components/ui/badge"
import { useEventContext } from "@/shared/providers/event-context"
import { useAdminEvents, useCreateEvent, useUpdateEvent, useDeleteEvent } from "@/shared/hooks/use-events"
import { useTicketCategories } from "@/shared/hooks/use-ticket-categories"
import { useEventoEntradas, useSaveEventoEntradas } from "@/shared/hooks/use-evento-entradas"
import { uploadEventImage, type EventItem } from "@/shared/lib/api-client"
import { toast } from "sonner"

interface EventFormData {
  name: string
  description: string
  date: string
  categoryId: string
  imageUrl: string
}

interface EntradaFormRow {
  categoriaEntradaId: string
  cantidadTotal: string
  precio: string
}

const defaultFormData: EventFormData = {
  name: "",
  description: "",
  date: "",
  categoryId: "",
  imageUrl: "",
}

export function EventManager() {
  const { categories, getCategoryName } = useEventContext()
  const { data: events = [] } = useAdminEvents()
  const { data: ticketCategories = [] } = useTicketCategories()
  const createEvent = useCreateEvent()
  const updateEvent = useUpdateEvent()
  const deleteEvent = useDeleteEvent()
  const saveEntradas = useSaveEventoEntradas()
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null)
  const [deletingEvent, setDeletingEvent] = useState<EventItem | null>(null)
  const [formData, setFormData] = useState<EventFormData>(defaultFormData)
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof EventFormData, string>>>({})
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [entradas, setEntradas] = useState<EntradaFormRow[]>([])
  const [entradasError, setEntradasError] = useState<string | null>(null)
  const imagePreviewUrlRef = useRef<string | null>(null)

  const { data: existingEntradas = [] } = useEventoEntradas(editingEvent?.id ?? null)

  const vendidasMap = Object.fromEntries(
    existingEntradas.map((e) => [e.categoriaEntradaId, e.cantidadTotal - e.cantidadDisponible]),
  )

  useEffect(() => {
    if (existingEntradas.length > 0) {
      setEntradas(
        existingEntradas.map((e) => ({
          categoriaEntradaId: e.categoriaEntradaId,
          cantidadTotal: String(e.cantidadTotal),
          precio: String(e.precio),
        })),
      )
    }
  }, [existingEntradas])

  const sortedEvents = [...events].sort((a, b) => b.interested - a.interested)

  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof EventFormData, string>> = {}
    if (!formData.name.trim()) errors.name = "El nombre es obligatorio"
    setFormErrors(errors)
    const validEntradas = entradas.filter((e) => e.categoriaEntradaId && e.cantidadTotal && e.precio)
    if (validEntradas.length === 0) {
      setEntradasError("Debes agregar al menos una boleta")
      return false
    }
    setEntradasError(null)
    return Object.keys(errors).length === 0
  }

  const buildEntradasPayload = () =>
    entradas
      .filter((e) => e.categoriaEntradaId && e.cantidadTotal && e.precio)
      .map((e) => ({
        categoriaEntradaId: Number(e.categoriaEntradaId),
        cantidadTotal: Number(e.cantidadTotal),
        precio: Number(e.precio),
      }))

  const handleCreate = async () => {
    if (!validateForm()) return
    setIsSubmitting(true)
    try {
      let imageUrl = formData.imageUrl
      if (imageFile) {
        imageUrl = await uploadEventImage(imageFile)
      }
      const newEvent = await createEvent.mutateAsync({
        name: formData.name.trim(),
        description: formData.description.trim(),
        date: formData.date || new Date().toISOString().slice(0, 10),
        categoryId: formData.categoryId === "none" ? "" : formData.categoryId,
        imageUrl: imageUrl || "",
        price: 0,
      })
      const payload = buildEntradasPayload()
      if (payload.length > 0) {
        await saveEntradas.mutateAsync({ eventoId: newEvent.id, entradas: payload })
      }
      setFormData(defaultFormData)
      setEntradas([])
      setImageFile(null)
      if (imagePreviewUrlRef.current) {
        URL.revokeObjectURL(imagePreviewUrlRef.current)
        imagePreviewUrlRef.current = null
      }
      setIsCreateOpen(false)
      setFormErrors({})
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error al crear el evento"
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdate = async () => {
    if (!validateForm() || !editingEvent) return
    setIsSubmitting(true)
    try {
      let imageUrl = formData.imageUrl
      if (imageFile) {
        imageUrl = await uploadEventImage(imageFile)
      }
      await updateEvent.mutateAsync({
        id: editingEvent.id,
        name: formData.name.trim(),
        description: formData.description.trim(),
        date: formData.date,
        categoryId: formData.categoryId === "none" ? "" : formData.categoryId,
        imageUrl,
        price: 0,
      })
      const payload = buildEntradasPayload()
      await saveEntradas.mutateAsync({ eventoId: editingEvent.id, entradas: payload })
      setEditingEvent(null)
      setFormData(defaultFormData)
      setEntradas([])
      setImageFile(null)
      if (imagePreviewUrlRef.current) {
        URL.revokeObjectURL(imagePreviewUrlRef.current)
        imagePreviewUrlRef.current = null
      }
      setFormErrors({})
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error al actualizar el evento"
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (deletingEvent) {
      try {
        await deleteEvent.mutateAsync(deletingEvent.id)
        setDeletingEvent(null)
      } catch (error) {
      }
    }
  }

  const openCreate = () => {
    setFormData(defaultFormData)
    setFormErrors({})
    setEntradas([])
    setEntradasError(null)
    setImageFile(null)
    if (imagePreviewUrlRef.current) {
      URL.revokeObjectURL(imagePreviewUrlRef.current)
      imagePreviewUrlRef.current = null
    }
    setIsCreateOpen(true)
  }

  const openEdit = (event: EventItem) => {
    setEditingEvent(event)
    setFormData({
      name: event.name,
      description: event.description,
      date: event.date,
      categoryId: event.categoryId || "none",
      imageUrl: event.imageUrl,
    })
    setFormErrors({})
    setEntradasError(null)
    setImageFile(null)
    if (imagePreviewUrlRef.current) {
      URL.revokeObjectURL(imagePreviewUrlRef.current)
      imagePreviewUrlRef.current = null
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith("image/")) {
      setFormErrors((prev) => ({ ...prev, imageUrl: "Solo se permiten imágenes" }))
      return
    }
    if (imagePreviewUrlRef.current) {
      URL.revokeObjectURL(imagePreviewUrlRef.current)
    }
    const url = URL.createObjectURL(file)
    imagePreviewUrlRef.current = url
    setImageFile(file)
    setFormData((prev) => ({ ...prev, imageUrl: url }))
    setFormErrors((prev) => {
      const next = { ...prev }
      delete next.imageUrl
      return next
    })
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
          <Label htmlFor="event-date">Fecha</Label>
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
          <Label htmlFor="event-category">Categoria</Label>
          <Select
            value={formData.categoryId || "none"}
            onValueChange={(v) => updateField("categoryId", v === "none" ? "" : v)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecciona categoria (opcional)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Sin categoria</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label>Imagen</Label>
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Input
              id="event-image"
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
              className="cursor-pointer"
              onChange={handleImageChange}
            />
            <span className="text-xs text-muted-foreground">JPEG, PNG, GIF o WebP (máx. 5 MB)</span>
          </div>
          {formData.imageUrl ? (
            <div className="relative aspect-video max-w-xs overflow-hidden rounded-md border border-border">
              <Image
                src={formData.imageUrl}
                alt="Vista previa"
                fill
                className="object-cover"
                sizes="320px"
                unoptimized={formData.imageUrl.startsWith("blob:")}
              />
            </div>
          ) : (
            <div className="flex aspect-video max-w-xs items-center justify-center rounded-md border border-dashed border-border bg-muted/50">
              <ImageIcon className="h-10 w-10 text-muted-foreground" />
            </div>
          )}
        </div>
        {formErrors.imageUrl && (
          <p className="flex items-center gap-1 text-sm text-destructive">
            <AlertCircle className="h-3.5 w-3.5" />
            {formErrors.imageUrl}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <Label>
            Boletas <span className="text-destructive">*</span>
          </Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-7 gap-1 text-xs"
            onClick={() =>
              setEntradas((prev) => [...prev, { categoriaEntradaId: "", cantidadTotal: "", precio: "" }])
            }
          >
            <Plus className="h-3.5 w-3.5" />
            Agregar
          </Button>
        </div>

        {entradasError && (
          <p className="flex items-center gap-1 text-sm text-destructive">
            <AlertCircle className="h-3.5 w-3.5" />
            {entradasError}
          </p>
        )}
        {entradas.length === 0 ? (
          <p className="text-xs text-muted-foreground">No se han agregado boletas.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {entradas.map((entrada, index) => {
              const vendidas = vendidasMap[entrada.categoriaEntradaId] ?? 0
              const minCantidad = Math.max(1, vendidas)
              return (
              <div key={index} className="grid grid-cols-[1fr_80px_90px_32px] items-start gap-2">
                <Select
                  value={entrada.categoriaEntradaId || "none"}
                  onValueChange={(v) =>
                    setEntradas((prev) =>
                      prev.map((e, i) => (i === index ? { ...e, categoriaEntradaId: v === "none" ? "" : v } : e)),
                    )
                  }
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Categoría</SelectItem>
                    {ticketCategories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex flex-col gap-0.5">
                  <Input
                    type="number"
                    min={minCantidad}
                    placeholder="Cant."
                    className="h-8 text-xs"
                    value={entrada.cantidadTotal}
                    onChange={(e) =>
                      setEntradas((prev) =>
                        prev.map((row, i) => (i === index ? { ...row, cantidadTotal: e.target.value } : row)),
                      )
                    }
                  />
                  {editingEvent && vendidas > 0 && (
                    <span className="text-[10px] text-muted-foreground">{vendidas} vendidas</span>
                  )}
                </div>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Precio"
                  className="h-8 text-xs"
                  value={entrada.precio}
                  onChange={(e) =>
                    setEntradas((prev) =>
                      prev.map((row, i) => (i === index ? { ...row, precio: e.target.value } : row)),
                    )
                  }
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={() => setEntradas((prev) => prev.filter((_, i) => i !== index))}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
              )
            })}
            <p className="text-xs text-muted-foreground">Categoría · Cantidad · Precio (COP)</p>
          </div>
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
          size="icon"
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          <span className="sr-only">Nuevo Evento</span>
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
              <TableHead className="w-[100px] text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedEvents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
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
            <Button variant="outline" onClick={() => setIsCreateOpen(false)} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleCreate}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Guardando..." : "Crear Evento"}
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
            <Button variant="outline" onClick={() => setEditingEvent(null)} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleUpdate}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Guardando..." : "Guardar Cambios"}
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
              className="bg-destructive text-primary-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}