"use client"

import { useState } from "react"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import { useAuth } from "@/shared/providers/auth-context"
import { toast } from "sonner"
import { AUTH_MESSAGES } from "@/shared/constants/messages"

interface RegisterFormProps {
  onSuccess?: () => void
  onSwitchToLogin?: () => void
  onClose?: () => void
}

export function RegisterForm({ onSuccess, onSwitchToLogin, onClose }: RegisterFormProps) {
  const { register } = useAuth()
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!firstName.trim()) {
      toast.error(AUTH_MESSAGES.NAME_REQUIRED)
      return
    }
    if (!username.trim()) {
      toast.error(AUTH_MESSAGES.USERNAME_REQUIRED)
      return
    }
    if (password.length < 6) {
      toast.error(AUTH_MESSAGES.PASSWORD_MIN_LENGTH)
      return
    }
    setIsSubmitting(true)
    try {
      await register({
        firstName,
        lastName,
        ...(email.trim() && { email: email.trim() }),
        username,
        password,
      })
      toast.success(AUTH_MESSAGES.REGISTER_SUCCESS)
      setPassword("")
      onSuccess?.()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : AUTH_MESSAGES.REGISTER_ERROR)
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
          Crear cuenta
        </h2>
        <p className="mb-6 text-sm text-muted-foreground">
          Regístrate para marcar interés en eventos y acceder a reportes.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="reg-first-name">Nombre *</Label>
              <Input
                id="reg-first-name"
                type="text"
                placeholder="Tu nombre"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                autoComplete="given-name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reg-last-name">Apellido</Label>
              <Input
                id="reg-last-name"
                type="text"
                placeholder="Tu apellido"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                autoComplete="family-name"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="reg-email">Correo (opcional)</Label>
            <Input
              id="reg-email"
              type="email"
              placeholder="ejemplo@correo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reg-username">Usuario *</Label>
            <Input
              id="reg-username"
              type="text"
              placeholder="nombre_de_usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reg-password">Contraseña * (mín. 6 caracteres)</Label>
            <Input
              id="reg-password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
            />
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Creando cuenta..." : "Registrarse"}
          </Button>
          {onSwitchToLogin && (
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="text-center text-sm text-muted-foreground underline hover:text-foreground"
            >
              ¿Ya tienes cuenta? Inicia sesión
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