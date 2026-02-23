"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useTranslations } from 'next-intl';
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ArrowLeft, UserPlus, Users, Check, X } from "lucide-react"
import { LocaleLink } from '@/components/LocaleLink'

export default function AddManagerPage() {
  const t = useTranslations('auth');
  const { data: session } = useSession()
  const router = useRouter()
  const [properties, setProperties] = useState<Array<{ id: string; address: string; city: string; type: string }>>([])
  const [selectedPropertyIds, setSelectedPropertyIds] = useState<string[]>([])
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

  useEffect(() => {
    fetchProperties()
  }, [])

  const fetchProperties = async () => {
    try {
      const response = await fetch("/api/properties")
      if (response.ok) {
        const data = await response.json()
        setProperties(data)
      }
    } catch (error) {
      console.error("Error fetching properties:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (formData.password !== formData.confirmPassword) {
      setError("Parolele nu se potrivesc")
      return
    }

    if (formData.password.length < 6) {
      setError("Parola trebuie să aibă minim 6 caractere")
      return
    }

    if (selectedPropertyIds.length === 0) {
      setError("Selectează cel puțin o proprietate pentru manager")
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/managers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          role: "MANAGER",
          propertyIds: selectedPropertyIds,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(true)
        setFormData({
          name: "",
          email: "",
          phone: "",
          password: "",
          confirmPassword: "",
        })
      } else {
        setError(data.error || "Eroare la crearea managerului")
      }
    } catch (err: any) {
      setError(err.message || "A apărut o eroare neașteptată")
    } finally {
      setLoading(false)
    }
  }

  if (session?.user.role !== "ADMIN") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Acces Restricționat</CardTitle>
            <CardDescription>Doar proprietarii pot adăuga manageri</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <UserPlus className="h-12 w-12 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Manager Adăugat!</CardTitle>
            <CardDescription>
              Managerul a fost creat cu succes și poate gestiona proprietățile tale
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <p className="text-sm font-semibold text-blue-900 mb-2">Email Manager:</p>
              <div className="bg-white border border-blue-300 rounded px-3 py-2 font-mono text-sm text-blue-700">
                {formData.email || "email@exemplu.ro"}
              </div>
            </div>
            <div className="flex gap-2">
              <LocaleLink href="/dashboard/users" className="flex-1">
                <Button className="w-full">Vezi Utilizatori</Button>
              </LocaleLink>
              <LocaleLink href="/dashboard" className="flex-1">
                <Button variant="outline" className="w-full">Înapoi la Dashboard</Button>
              </LocaleLink>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <div className="p-4">
          <LocaleLink href="/dashboard" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Înapoi
          </LocaleLink>
        </div>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <UserPlus className="h-12 w-12 text-blue-600" />
          </div>
          <CardTitle className="text-2xl">Adaugă Manager</CardTitle>
          <CardDescription>
            Creează un cont de manager pentru a-ți gestiona proprietățile
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Nume Complet
              </label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ion Popescu"
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
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="manager@exemplu.ro"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="phone" className="text-sm font-medium">
                Telefon
              </label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+40 7xx xxx xxx"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Parolă
              </label>
              <Input
                id="password"
                type="password"
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
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
              />
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold text-sm text-gray-700 mb-3">Proprietăți de Gestionat</h3>
              <p className="text-xs text-gray-500 mb-3">Selectează proprietățile pe care acest manager le va gestiona</p>
              
              <div className="space-y-2 max-h-64 overflow-y-auto border rounded-md p-3">
                {properties.map((property) => (
                  <label
                    key={property.id}
                    className="flex items-start gap-3 p-3 rounded-md hover:bg-gray-50 cursor-pointer border"
                  >
                    <input
                      type="checkbox"
                      checked={selectedPropertyIds.includes(property.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedPropertyIds([...selectedPropertyIds, property.id])
                        } else {
                          setSelectedPropertyIds(selectedPropertyIds.filter(id => id !== property.id))
                        }
                      }}
                      className="mt-1 h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{property.type}</p>
                      <p className="text-xs text-gray-600">{property.address}, {property.city}</p>
                    </div>
                  </label>
                ))}
                {properties.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">
                    Nu ai proprietăți. Adaugă mai întâi o proprietate.
                  </p>
                )}
              </div>
              
              {selectedPropertyIds.length > 0 && (
                <p className="text-xs text-green-600 mt-2">
                  ✓ {selectedPropertyIds.length} proprietăț{selectedPropertyIds.length === 1 ? "i" : "i"} selectate
                </p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Se creează..." : "Adaugă Manager"}
            </Button>

            <p className="text-xs text-center text-gray-500">
              Managerul va putea gestiona proprietățile tale, vedea chiriașii și citirile de contoare
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
