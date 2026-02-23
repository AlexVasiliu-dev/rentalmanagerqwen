"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { User, Building, Mail, Phone, Save } from "lucide-react"

export default function OwnerProfilePage() {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    companyName: "",
    companyRegNumber: "",
    companyFiscalCode: "",
    workingEmail: "",
  })

  useEffect(() => {
    if (session?.user.id) {
      fetchProfile()
    }
  }, [session])

  const fetchProfile = async () => {
    try {
      const response = await fetch(`/api/owner-profile`)
      if (response.ok) {
        const data = await response.json()
        setFormData({
          name: data.name || "",
          phone: data.phone || "",
          companyName: data.companyName || "",
          companyRegNumber: data.companyRegNumber || "",
          companyFiscalCode: data.companyFiscalCode || "",
          workingEmail: data.workingEmail || "",
        })
      }
    } catch (error) {
      console.error("Error fetching profile:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setSaved(false)

    try {
      const response = await fetch("/api/owner-profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      } else {
        alert(data.error || "Eroare la salvarea profilului")
      }
    } catch (error) {
      console.error("Error saving profile:", error)
      alert("Eroare la salvarea profilului")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Profil Proprietar</h1>
        <p className="text-gray-600">Gestionează informațiile despre companie și contact</p>
      </div>

      {saved && (
        <div className="bg-green-50 text-green-800 p-4 rounded-md">
          Profil salvat cu succes!
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Informații Personale
          </CardTitle>
          <CardDescription>Detaliile tale de contact personal</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Nume</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Numele tău"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Număr de Telefon</label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+40 7xx xxx xxx"
                  type="tel"
                />
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Informații Companie
          </CardTitle>
          <CardDescription>Necesar pentru contractele de închiriere</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Nume Companie</label>
                <Input
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  placeholder="SC Nume Companie SRL"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Email de Lucru</label>
                <Input
                  value={formData.workingEmail}
                  onChange={(e) => setFormData({ ...formData, workingEmail: e.target.value })}
                  placeholder="contact@companie.ro"
                  type="email"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Număr Înregistrare Companie</label>
                <Input
                  value={formData.companyRegNumber}
                  onChange={(e) => setFormData({ ...formData, companyRegNumber: e.target.value })}
                  placeholder="J12/1234/2024"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Cod Fiscal (CIF)</label>
                <Input
                  value={formData.companyFiscalCode}
                  onChange={(e) => setFormData({ ...formData, companyFiscalCode: e.target.value })}
                  placeholder="RO12345678"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit" disabled={loading}>
                <Save className="h-4 w-4 mr-2" />
                {loading ? "Se salvează..." : "Salvează Profilul"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="bg-blue-50">
        <CardHeader>
          <CardTitle>De ce sunt importante aceste informații?</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span>Informațiile despre companie sunt necesare pentru generarea contractelor legale de închiriere în România</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span>Emailul tău de lucru va fi folosit pentru comunicările oficiale cu chiriașii</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span>Numărul de înregistrare și codul fiscal sunt necesare pentru scopuri fiscale</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
