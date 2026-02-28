"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/lib/auth-context"
import { toast } from "sonner"

interface LoginFormProps {
  onSuccess?: () => void
  onSwitchToRegister?: () => void
  onClose?: () => void
}

export function LoginForm({ onSuccess, onSwitchToRegister, onClose }: LoginFormProps) {
  const { login } = useAuth()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username.trim() || !password) {
      toast.error("Ingresa usuario y contraseña")
      return
    }
    setIsSubmitting(true)
    try {
      await login(username, password)
      toast.success("Sesión iniciada")
      setPassword("")
      onSuccess?.()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al iniciar sesión")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="mx-auto flex min-h-[60vh] max-w-md flex-col justify-center px-4 py-12">
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <h2
          className="mb-1 text-xl font-semibold text-foreground"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Iniciar sesión
        </h2>
        <p className="mb-6 text-sm text-muted-foreground">
          Ingresa tus datos para acceder a Gestión y Reportes.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="space-y-2">
            <Label htmlFor="login-username">Usuario</Label>
            <Input
              id="login-username"
              type="text"
              placeholder="nombre_de_usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="login-password">Contraseña</Label>
            <Input
              id="login-password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Entrando..." : "Entrar"}
          </Button>
          {onSwitchToRegister && (
            <button
              type="button"
              onClick={onSwitchToRegister}
              className="text-center text-sm text-muted-foreground underline hover:text-foreground"
            >
              ¿No tienes cuenta? Regístrate
            </button>
          )}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="text-center text-sm text-muted-foreground underline hover:text-foreground"
            >
              Ver eventos sin iniciar sesión
            </button>
          )}
        </form>
      </div>
    </main>
  )
}