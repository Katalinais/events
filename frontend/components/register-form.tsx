"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/lib/auth-context"
import { authApi } from "@/lib/api-client"
import { toast } from "sonner"

interface RegisterFormProps {
  onSuccess?: () => void
  onSwitchToLogin?: () => void
  onClose?: () => void
}

export function RegisterForm({ onSuccess, onSwitchToLogin, onClose }: RegisterFormProps) {
  const { setSession } = useAuth()
  const [nombre, setNombre] = useState("")
  const [apellido, setApellido] = useState("")
  const [correo, setCorreo] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nombre.trim()) {
      toast.error("El nombre es obligatorio")
      return
    }
    if (!username.trim()) {
      toast.error("El usuario es obligatorio")
      return
    }
    if (password.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres")
      return
    }
    setIsSubmitting(true)
    try {
      const res = await authApi.register({
        nombre,
        apellido,
        ...(correo.trim() && { correo: correo.trim() }),
        username,
        password,
      })
      setSession(res.access_token, res.usuario)
      toast.success("Cuenta creada correctamente")
      setPassword("")
      onSuccess?.()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al registrarse")
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
              <Label htmlFor="reg-nombre">Nombre *</Label>
              <Input
                id="reg-nombre"
                type="text"
                placeholder="Tu nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                autoComplete="given-name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reg-apellido">Apellido</Label>
              <Input
                id="reg-apellido"
                type="text"
                placeholder="Tu apellido"
                value={apellido}
                onChange={(e) => setApellido(e.target.value)}
                autoComplete="family-name"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="reg-correo">Correo (opcional)</Label>
            <Input
              id="reg-correo"
              type="email"
              placeholder="ejemplo@correo.com"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
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