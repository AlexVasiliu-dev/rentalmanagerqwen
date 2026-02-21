"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTranslations } from 'next-intl';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Home } from "lucide-react"
import { LocaleLink } from '@/components/LocaleLink'

export default function RegisterPage() {
  const t = useTranslations('auth');
  const pathname = usePathname()
  const locale = pathname?.split('/')[1] || 'en'
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    ownerSlug: "",
    // Business details (for owners)
    companyName: "",
    companyRegNumber: "",
    companyFiscalCode: "",
    workingEmail: "",
  })
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (formData.password !== formData.confirmPassword) {
      setError(t('passwordMismatch'))
      return
    }

    if (formData.password.length < 8) {
      setError(t('passwordTooShort'))
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          role: "ADMIN", // Only owners can register on main site
          ownerSlug: formData.ownerSlug || undefined,
          companyName: formData.companyName,
          companyRegNumber: formData.companyRegNumber,
          companyFiscalCode: formData.companyFiscalCode,
          workingEmail: formData.workingEmail,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || t('registerFailed'))
      }

      setSuccess(true)
      // Store slug for display on success page
      sessionStorage.setItem('businessSlug', data.user.ownerSlug || formData.ownerSlug)
      sessionStorage.setItem('registrationMessage', 'Contul de proprietar a fost creat! Te poți autentifica acum.')
    } catch (err: any) {
      setError(err.message || t('unexpectedError'))
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    const message = sessionStorage.getItem('registrationMessage') || 'Înregistrare reușită!'
    const businessSlug = sessionStorage.getItem('businessSlug') || ''
    sessionStorage.removeItem('registrationMessage')
    sessionStorage.removeItem('businessSlug')
    
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Home className="h-12 w-12 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Cont Proprietar Creat!</CardTitle>
            <CardDescription>
              {message}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {businessSlug && (
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <p className="text-sm font-semibold text-blue-900 mb-2">URL-ul Afacerii Tale:</p>
                <div className="bg-white border border-blue-300 rounded px-3 py-2 font-mono text-sm text-blue-700 break-all">
                  rentalmanager.ro/{businessSlug}
                </div>
                <p className="text-xs text-blue-700 mt-2">
                  Acesta este URL-ul pe care trebuie să îl partajezi cu managerii și chiriașii tăi pentru a se înregistra.
                </p>
              </div>
            )}
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
          <CardTitle className="text-2xl">Creează Cont Proprietar</CardTitle>
          <CardDescription>
            Înregistrează-ți afacerea și gestionează proprietățile profesional.
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
                {t('name')}
              </label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                {t('email')}
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
                Număr de Telefon
              </label>
              <Input
                id="phone"
                type="tel"
                placeholder="+40 7xx xxx xxx"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                pattern="[+0-9\s-]+"
                title="Introduceți un număr de telefon valid"
              />
            </div>

            {/* Owner/Business Details */}
            <div className="border-t pt-4 mt-4">
              <h3 className="font-semibold text-lg mb-4">Detalii Afacere</h3>
              <p className="text-xs text-gray-500 mb-4">
                Aceste informații sunt necesare pentru a-ți configura afacerea și a genera contracte legale.
                URL-ul afacerii va fi generat automat din numele companiei.
              </p>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label htmlFor="companyName" className="text-sm font-medium mb-1 block">
                    Nume Companie *
                  </label>
                  <Input
                    id="companyName"
                    value={formData.companyName}
                    onChange={(e) => {
                      const value = e.target.value
                      // Update both companyName and ownerSlug in one state update
                      setFormData({
                        ...formData,
                        companyName: value,
                        ownerSlug: value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
                      })
                    }}
                    placeholder="SC Nume Companie SRL"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    URL-ul afacerii va fi: <span className="font-mono bg-gray-100 px-2 py-0.5 rounded">rentalmanager.ro/{formData.ownerSlug || 'nume-companie'}</span>
                  </p>
                </div>

                <div>
                  <label htmlFor="companyRegNumber" className="text-sm font-medium mb-1 block">
                    Nr. Înregistrare (J..)
                  </label>
                  <Input
                    id="companyRegNumber"
                    value={formData.companyRegNumber}
                    onChange={(e) => setFormData({ ...formData, companyRegNumber: e.target.value })}
                    placeholder="J12/1234/2024"
                  />
                </div>

                <div>
                  <label htmlFor="companyFiscalCode" className="text-sm font-medium mb-1 block">
                    Cod Fiscal (CIF)
                  </label>
                  <Input
                    id="companyFiscalCode"
                    value={formData.companyFiscalCode}
                    onChange={(e) => setFormData({ ...formData, companyFiscalCode: e.target.value })}
                    placeholder="RO12345678"
                  />
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="workingEmail" className="text-sm font-medium mb-1 block">
                    Email Afacere
                  </label>
                  <Input
                    id="workingEmail"
                    type="email"
                    value={formData.workingEmail}
                    onChange={(e) => setFormData({ ...formData, workingEmail: e.target.value })}
                    placeholder="contact@companie.ro"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                {t('password')}
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
                {t('confirmPassword')}
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
              {loading ? t('creatingAccount') : t('createAccount')}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            <LocaleLink href="/auth/signin" className="text-blue-600 hover:underline">
              {t('hasAccount')} {t('signIn')}
            </LocaleLink>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
