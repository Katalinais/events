"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import { TICKET_MESSAGES } from "@/shared/constants/messages"
import { Minus, Plus, ShoppingCart, Ticket, CheckCircle2, Download, CreditCard, Lock, ChevronLeft, Loader2, XCircle } from "lucide-react"
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
import { Separator } from "@/shared/components/ui/separator"
import { useTicketEntries } from "@/shared/hooks/use-evento-entradas"
import { useTicketCategories } from "@/shared/hooks/use-ticket-categories"
import { usePurchaseTickets, useDownloadPdf } from "@/shared/hooks/use-tickets"
import type { CardData } from "@/shared/lib/api-client"
import { useAuth } from "@/shared/providers/auth-context"
import { useSocketContext } from "@/shared/providers/socket-context"

type Step = "selection" | "billing" | "processing" | "success"
type ProcessingStage = "payment" | "ai" | "done"

const PURCHASE_STAGES = [
  { key: "validating", label: "Validando disponibilidad" },
  { key: "gateway",    label: "Verificando con la pasarela de pago" },
  { key: "creating",   label: "Generando boletas" },
] as const
type Network = "visa" | "mastercard" | "nu"

interface BillingForm {
  name: string
  cardNumber: string
  expiry: string
  cvv: string
}

interface PurchaseDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  eventId: string
  eventName: string
  onRequestLogin?: () => void
}

function formatCardNumber(value: string) {
  return value.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim()
}

function formatExpiry(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 4)
  if (digits.length >= 3) return digits.slice(0, 2) + "/" + digits.slice(2)
  return digits
}

export function PurchaseDialog({ open, onOpenChange, eventId, eventName, onRequestLogin }: PurchaseDialogProps) {
  const { isAuthenticated } = useAuth()
  const { socket } = useSocketContext()
  const { data: entries = [], isLoading } = useTicketEntries(open ? eventId : null)
  const { data: ticketCategories = [] } = useTicketCategories()
  const purchase = usePurchaseTickets({
    onError: (error) => toast.error(error.message || TICKET_MESSAGES.PURCHASE_ERROR),
  })

  const [step, setStep] = useState<Step>("selection")
  const [processingStage, setProcessingStage] = useState<ProcessingStage>("payment")
  const [reachedStageIndex, setReachedStageIndex] = useState<number>(-1)
  const [aiMessage, setAiMessage] = useState<{ type: string; message: string } | null>(null)
  const [quantities, setQuantities] = useState<Record<string, number>>({})
  const [billing, setBilling] = useState<BillingForm>({ name: "", cardNumber: "", expiry: "", cvv: "" })
  const [billingErrors, setBillingErrors] = useState<Partial<BillingForm> & { network?: string }>({})
  const [network, setNetwork] = useState<Network | null>(null)
  const [purchasedQR, setPurchasedQR] = useState<string | null>(null)
  const [purchasedId, setPurchasedId] = useState<number | null>(null)
  const { mutate: downloadPdf, isPending: isDownloading } = useDownloadPdf()

  useEffect(() => {
    if (!socket) return

    const onResult = (data: { type: string; message: string }) => {
      setAiMessage(data)
      setProcessingStage("done")
    }

    const onStage = (data: { stage: string }) => {
      const idx = PURCHASE_STAGES.findIndex((s) => s.key === data.stage)
      if (idx !== -1) setReachedStageIndex(idx)
    }

    socket.on("purchase:result", onResult)
    socket.on("purchase:stage", onStage)
    return () => {
      socket.off("purchase:result", onResult)
      socket.off("purchase:stage", onStage)
    }
  }, [socket])

  const getCategoryName = (ticketCategoryId: string) =>
    ticketCategories.find((c) => c.id === ticketCategoryId)?.name ?? "Boleta"

  const updateQuantity = (entryId: string, delta: number, max: number) => {
    setQuantities((prev) => {
      const current = prev[entryId] ?? 0
      const next = Math.min(max, Math.max(0, current + delta))
      return { ...prev, [entryId]: next }
    })
  }

  const total = entries.reduce((sum, entry) => {
    const qty = quantities[entry.id] ?? 0
    return sum + qty * entry.price
  }, 0)

  const totalItems = Object.values(quantities).reduce((a, b) => a + b, 0)

  const formattedTotal = new Intl.NumberFormat("es-ES", { style: "currency", currency: "COP" }).format(total)

  const handleClose = (o: boolean) => {
    onOpenChange(o)
    if (!o) {
      setStep("selection")
      setProcessingStage("payment")
      setReachedStageIndex(-1)
      setAiMessage(null)
      setQuantities({})
      setBilling({ name: "", cardNumber: "", expiry: "", cvv: "" })
      setBillingErrors({})
      setNetwork(null)
      setPurchasedQR(null)
      setPurchasedId(null)
    }
  }

  const handleGoToBilling = () => {
    if (!isAuthenticated) {
      onOpenChange(false)
      onRequestLogin?.()
      return
    }
    setStep("billing")
  }

  const validateBilling = (): boolean => {
    const errors: Partial<BillingForm> & { network?: string } = {}
    if (!network) errors.network = "Selecciona una red de pago"
    if (!billing.name.trim()) errors.name = TICKET_MESSAGES.BILLING_NAME_REQUIRED
    const digits = billing.cardNumber.replace(/\s/g, "")
    if (digits.length !== 16) errors.cardNumber = TICKET_MESSAGES.BILLING_CARD_LENGTH
    if (network !== "nu") {
      if (!/^\d{2}\/\d{2}$/.test(billing.expiry)) {
        errors.expiry = TICKET_MESSAGES.BILLING_EXPIRY_FORMAT
      } else {
        const [mm, yy] = billing.expiry.split("/")
        const expiry = new Date(2000 + parseInt(yy, 10), parseInt(mm, 10) - 1, 1)
        const now = new Date()
        if (expiry < new Date(now.getFullYear(), now.getMonth(), 1)) {
          errors.expiry = TICKET_MESSAGES.BILLING_EXPIRY_EXPIRED
        }
      }
    }
    if (billing.cvv.length < 3) errors.cvv = TICKET_MESSAGES.BILLING_CVV_REQUIRED
    setBillingErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handlePurchase = async () => {
    if (!validateBilling()) return

    const rawDigits = billing.cardNumber.replace(/\s/g, "")
    // TODO: cuando Nu envíe fecha de vencimiento real, eliminar los valores quemados
    const [mm, yy] = network === "nu" ? ["1", "99"] : billing.expiry.split("/")
    const payment: CardData = {
      card_number: rawDigits,
      expiry_month: parseInt(mm, 10),
      expiry_year: network === "nu" ? 2099 : 2000 + parseInt(yy, 10),
      cvv: billing.cvv,
      network: network!,
    }

    const items = entries
      .filter((e) => (quantities[e.id] ?? 0) > 0)
      .map((e) => ({ eventEntryId: Number(e.id), quantity: quantities[e.id] }))

    setStep("processing")
    setProcessingStage("payment")
    setReachedStageIndex(-1)

    const result = await purchase.mutateAsync({ items, payment }).catch(() => null)
    if (result) {
      setPurchasedQR(result.codigoQR)
      setPurchasedId(result.id)
      setProcessingStage("ai")
    }
  }

  const handleDownloadPdf = () => {
    if (purchasedId == null) return
    downloadPdf(purchasedId)
  }

  const stepTitles: Record<Step, string> = {
    selection: "Comprar boletas",
    billing: "Datos de pago",
    processing: "Procesando compra",
    success: "¡Compra exitosa!",
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {step === "billing" && (
              <button onClick={() => setStep("selection")} className="mr-1 text-muted-foreground hover:text-foreground">
                <ChevronLeft className="h-4 w-4" />
              </button>
            )}
            {step === "selection" && <Ticket className="h-5 w-5 text-primary" />}
            {step === "billing" && <CreditCard className="h-5 w-5 text-primary" />}
            {step === "processing" && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
            {step === "success" && <CheckCircle2 className="h-5 w-5 text-green-500" />}
            {stepTitles[step]}
          </DialogTitle>
          {step !== "success" && (
            <DialogDescription className="line-clamp-1">{eventName}</DialogDescription>
          )}
        </DialogHeader>

        {/* ── Step 1: Selección ── */}
        {step === "selection" && (
          <>
            <div className="flex flex-col gap-3 py-2">
              {isLoading ? (
                <div className="flex h-24 items-center justify-center text-sm text-muted-foreground">
                  Cargando boletas...
                </div>
              ) : entries.length === 0 ? (
                <div className="flex h-24 items-center justify-center text-sm text-muted-foreground">
                  No hay boletas disponibles para este evento.
                </div>
              ) : (
                entries.map((entry) => {
                  const qty = quantities[entry.id] ?? 0
                  const available = entry.availableQuantity
                  const formattedPrice = new Intl.NumberFormat("es-ES", { style: "currency", currency: "COP" }).format(entry.price)
                  return (
                    <div key={entry.id} className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-medium">{getCategoryName(entry.ticketCategoryId)}</span>
                        <span className="text-xs text-muted-foreground">{formattedPrice} · {available} disponibles</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button type="button" variant="outline" size="icon" className="h-7 w-7" disabled={qty === 0} onClick={() => updateQuantity(entry.id, -1, available)}>
                          <Minus className="h-3.5 w-3.5" />
                        </Button>
                        <span className="w-5 text-center text-sm tabular-nums">{qty}</span>
                        <Button type="button" variant="outline" size="icon" className="h-7 w-7" disabled={qty >= available} onClick={() => updateQuantity(entry.id, 1, available)}>
                          <Plus className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            {entries.length > 0 && (
              <>
                <Separator />
                <div className="flex items-center justify-between px-1 text-sm">
                  <span className="text-muted-foreground">{totalItems} {totalItems === 1 ? "boleta" : "boletas"}</span>
                  <span className="font-semibold text-foreground">{formattedTotal}</span>
                </div>
              </>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => handleClose(false)}>Cancelar</Button>
              <Button
                className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={totalItems === 0}
                onClick={handleGoToBilling}
              >
                <ShoppingCart className="h-4 w-4" />
                Comprar
              </Button>
            </DialogFooter>
          </>
        )}

        {/* ── Step 2: Facturación simulada ── */}
        {step === "billing" && (
          <>
            <div className="flex flex-col gap-4 py-2">
              <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
                <Lock className="h-3.5 w-3.5 shrink-0" />
                Simulación de pago — ningún dato es procesado ni almacenado
              </div>

              <div className="flex flex-col gap-1.5">
                <Label className="text-xs">Red de pago</Label>
                <div className="grid grid-cols-3 gap-2">
                  {(["visa", "mastercard", "nu"] as Network[]).map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setNetwork(n)}
                      className={`flex items-center justify-center rounded-lg border py-3 transition-all ${
                        network === n ? "ring-2 ring-offset-1" : "hover:bg-muted"
                      } ${
                        network === n && n === "visa" ? "ring-blue-600 border-blue-600" :
                        network === n && n === "mastercard" ? "ring-orange-500 border-orange-500" :
                        network === n && n === "nu" ? "ring-purple-600 border-purple-600" :
                        "border-border bg-muted/40"
                      }`}
                    >
                      {n === "visa" && (
                        <svg viewBox="0 0 48 16" className="h-5 w-auto" aria-label="Visa">
                          <text x="0" y="13" fontFamily="Arial" fontWeight="bold" fontStyle="italic" fontSize="16" fill="#1A1F71">VISA</text>
                        </svg>
                      )}
                      {n === "mastercard" && (
                        <svg viewBox="0 0 38 24" className="h-6 w-auto" aria-label="Mastercard">
                          <circle cx="14" cy="12" r="12" fill="#EB001B" />
                          <circle cx="24" cy="12" r="12" fill="#F79E1B" />
                          <path d="M19 4.8a12 12 0 0 1 0 14.4A12 12 0 0 1 19 4.8z" fill="#FF5F00" />
                        </svg>
                      )}
                      {n === "nu" && (
                        <svg viewBox="0 0 40 20" className="h-5 w-auto" aria-label="Nu">
                          <text x="2" y="15" fontFamily="Arial" fontWeight="bold" fontSize="16" fill="#820AD1">nu</text>
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
                {billingErrors.network && <p className="text-xs text-destructive">{billingErrors.network}</p>}
              </div>

              <div className="flex flex-col gap-1.5">
                <Label className="text-xs">Nombre en la tarjeta</Label>
                <Input
                  placeholder="Juan Pérez"
                  value={billing.name}
                  onChange={(e) => setBilling((b) => ({ ...b, name: e.target.value }))}
                  className={billingErrors.name ? "border-destructive" : ""}
                />
                {billingErrors.name && <p className="text-xs text-destructive">{billingErrors.name}</p>}
              </div>

              <div className="flex flex-col gap-1.5">
                <Label className="text-xs">Número de tarjeta</Label>
                <Input
                  placeholder="1234 5678 9012 3456"
                  value={billing.cardNumber}
                  onChange={(e) => setBilling((b) => ({ ...b, cardNumber: formatCardNumber(e.target.value) }))}
                  className={billingErrors.cardNumber ? "border-destructive" : ""}
                />
                {billingErrors.cardNumber && <p className="text-xs text-destructive">{billingErrors.cardNumber}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  {/* TODO: habilitar cuando Nu requiera fecha de vencimiento — quitar disabled y el texto "N/A" */}
                  <Label className={`text-xs ${network === "nu" ? "text-muted-foreground" : ""}`}>Vencimiento</Label>
                  <Input
                    placeholder={network === "nu" ? "N/A" : "MM/AA"}
                    value={network === "nu" ? "" : billing.expiry}
                    disabled={network === "nu"}
                    onChange={(e) => setBilling((b) => ({ ...b, expiry: formatExpiry(e.target.value) }))}
                    className={billingErrors.expiry ? "border-destructive" : ""}
                  />
                  {billingErrors.expiry && <p className="text-xs text-destructive">{billingErrors.expiry}</p>}
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs">CVV</Label>
                  <Input
                    placeholder="123"
                    maxLength={4}
                    value={billing.cvv}
                    onChange={(e) => setBilling((b) => ({ ...b, cvv: e.target.value.replace(/\D/g, "") }))}
                    className={billingErrors.cvv ? "border-destructive" : ""}
                  />
                  {billingErrors.cvv && <p className="text-xs text-destructive">{billingErrors.cvv}</p>}
                </div>
              </div>

              <Separator />
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Total a pagar</span>
                <span className="font-bold text-foreground">{formattedTotal}</span>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setStep("selection")}>Volver</Button>
              <Button
                className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={purchase.isPending}
                onClick={handlePurchase}
              >
                <CreditCard className="h-4 w-4" />
                {purchase.isPending ? "Procesando..." : "Pagar"}
              </Button>
            </DialogFooter>
          </>
        )}

        {/* ── Step 3: Procesando ── */}
        {step === "processing" && (
          <div className="flex flex-col gap-4 py-4">
            <div className="flex flex-col gap-3">
              {PURCHASE_STAGES.map((s, i) => {
                const isDone = processingStage !== "payment"
                  ? true
                  : i < reachedStageIndex
                const isActive = processingStage === "payment" && i === reachedStageIndex
                const isError = processingStage === "done" && aiMessage?.type === "error" && i === PURCHASE_STAGES.length - 1

                return (
                  <div key={s.key} className="flex items-center gap-3">
                    {isError ? (
                      <XCircle className="h-5 w-5 shrink-0 text-destructive" />
                    ) : isDone ? (
                      <CheckCircle2 className="h-5 w-5 shrink-0 text-green-500" />
                    ) : isActive ? (
                      <Loader2 className="h-5 w-5 shrink-0 animate-spin text-primary" />
                    ) : (
                      <div className="h-5 w-5 shrink-0 rounded-full border-2 border-muted" />
                    )}
                    <span className={`text-sm ${isActive ? "font-medium text-foreground" : isDone || isError ? "text-muted-foreground" : "text-muted-foreground/50"}`}>
                      {s.label}
                    </span>
                  </div>
                )
              })}

              {/* Spinner esperando resultado del worker */}
              {processingStage === "ai" && (
                <div className="flex items-center gap-3">
                  <Loader2 className="h-5 w-5 shrink-0 animate-spin text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Procesando resultado...</span>
                </div>
              )}
            </div>

            {/* Mensaje del worker */}
            {processingStage === "done" && aiMessage && (
              <div className={`rounded-lg border px-4 py-3 text-sm ${aiMessage.type === "error" ? "border-destructive/40 bg-destructive/10 text-destructive" : "border-green-500/40 bg-green-500/10 text-green-700 dark:text-green-400"}`}>
                {aiMessage.message}
              </div>
            )}

            {processingStage === "done" && (
              <div className="flex flex-col gap-2 pt-2">
                {purchasedId && aiMessage?.type !== "error" && (
                  <Button
                    className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                    disabled={isDownloading}
                    onClick={() => downloadPdf(purchasedId)}
                  >
                    <Download className="h-4 w-4" />
                    {isDownloading ? "Generando PDF..." : "Descargar boletas (PDF)"}
                  </Button>
                )}
                <Button variant="outline" className="w-full" onClick={() => handleClose(false)}>
                  Cerrar
                </Button>
              </div>
            )}
          </div>
        )}

        {/* ── Step 4: Éxito ── */}
        {step === "success" && (
          <div className="flex flex-col items-center gap-4 py-4 text-center">
            <CheckCircle2 className="h-12 w-12 text-green-500" />
            <div>
              <p className="text-base font-semibold text-foreground">¡Pago completado!</p>
              <p className="mt-1 text-sm text-muted-foreground">Tus boletas han sido generadas</p>
            </div>
            <Button
              className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={isDownloading}
              onClick={handleDownloadPdf}
            >
              <Download className="h-4 w-4" />
              {isDownloading ? "Generando PDF..." : "Descargar boletas (PDF)"}
            </Button>
            <Button variant="outline" className="w-full" onClick={() => handleClose(false)}>
              Cerrar
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}