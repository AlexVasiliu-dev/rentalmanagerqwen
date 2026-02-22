"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Home } from "lucide-react"
import { LocaleLink } from '@/components/LocaleLink'

export default function TestRegisterPage() {
  const router = useRouter()
  const [selectedRole, setSelectedRole] = useState<"MANAGER" | "RENTER">("RENTER")
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  })
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (formData.password !== formData.confirmPassword) {
      setError("Parolele nu se potrivesc")
      return
    }

    if (formData.password.length < 8) {
      setError("Parola trebuie să aibă minim 8 caractere")
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          role: selectedRole,
          approved: false, // Needs owner approval
          active: true,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Înregistrarea a eșuat")
      }

      setSuccess(true)
    } catch (err: any) {
      setError(err.message || "A apărut o eroare neașteptată")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Home className="h-12 w-12 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Înregistrare Reușită!</CardTitle>
            <CardDescription>
              Contul tău a fost creat și așteaptă aprobarea proprietarului.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LocaleLink href="/auth/signin" className="block">
              <Button className="w-full">Autentificare</Button>
            </LocaleLink>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Home className="h-12 w-12 text-blue-600" />
          </div>
          <CardTitle className="text-2xl">Înregistrare Test</CardTitle>
          <CardDescription>
            Pagină temporară pentru testare Manager/Chiriaș
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
                {error}
              </div>
            )}

            {/* Role Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Sunt...</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedRole("RENTER")}
                  className={`p-3 rounded-md border text-sm font-medium transition-colors ${
                    selectedRole === "RENTER"
                      ? "bg-blue-50 border-blue-500 text-blue-700"
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  🏠 Chiriaș
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRole("MANAGER")}
                  className={`p-3 rounded-md border text-sm font-medium transition-colors ${
                    selectedRole === "MANAGER"
                      ? "bg-blue-50 border-blue-500 text-blue-700"
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  📋 Manager
                </button>
              </div>
              <p className="text-xs text-gray-500">
                {selectedRole === "RENTER" && "Caut o proprietate de închiriat (necesită aprobare)"}
                {selectedRole === "MANAGER" && "Administrez proprietăți (necesită aprobare)"}
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Nume
              </label>
              <Input
                id="name"
                type="text"
                placeholder="Ion Popescu"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="phone" className="text-sm font-medium">
                Telefon
              </label>
              <Input
                id="phone"
                type="tel"
                placeholder="+40 7xx xxx xxx"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Parolă
              </label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium">
                Confirmă Parola
              </label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Se înregistrează..." : "Înregistrare"}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            <LocaleLink href="/auth/signin" className="text-blue-600 hover:underline">
              Ai deja cont? Autentificare
            </LocaleLink>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
