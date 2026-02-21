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
  const [selectedRole, setSelectedRole] = useState<"RENTER" | "MANAGER" | "ADMIN">("RENTER")
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    ownerSlug: "",
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
          password: formData.password,
          role: selectedRole,
          ownerSlug: selectedRole === "ADMIN" ? formData.ownerSlug || undefined : undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || t('registerFailed'))
      }

      setSuccess(true)
    } catch (err: any) {
      setError(err.message || t('unexpectedError'))
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
            <CardTitle className="text-2xl">{t('registrationSuccess')}</CardTitle>
            <CardDescription>
              {t('registrationSuccessDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LocaleLink href="/auth/signin" className="block">
              <Button className="w-full">{t('backToSignIn')}</Button>
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
          <CardTitle className="text-2xl">{t('registerTitle')}</CardTitle>
          <CardDescription>
            {t('registerDescription')}
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
              <label className="text-sm font-medium">I am a...</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedRole("RENTER")}
                  className={`p-3 rounded-md border text-sm font-medium transition-colors ${
                    selectedRole === "RENTER"
                      ? "bg-blue-50 border-blue-500 text-blue-700"
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  🏠 Tenant
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
                <button
                  type="button"
                  onClick={() => setSelectedRole("ADMIN")}
                  className={`p-3 rounded-md border text-sm font-medium transition-colors ${
                    selectedRole === "ADMIN"
                      ? "bg-blue-50 border-blue-500 text-blue-700"
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  👑 Owner
                </button>
              </div>
              <p className="text-xs text-gray-500">
                {selectedRole === "RENTER" && "Looking for a rental property"}
                {selectedRole === "MANAGER" && "Managing properties for owners"}
                {selectedRole === "ADMIN" && "Own rental properties (auto-approved)"}
              </p>
            </div>

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
            
            {/* Owner Slug Field - Only for Owners */}
            {selectedRole === "ADMIN" && (
              <div className="space-y-2">
                <label htmlFor="ownerSlug" className="text-sm font-medium">
                  Owner Profile URL
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">rentalmanager.ro/owner/</span>
                  <Input
                    id="ownerSlug"
                    type="text"
                    placeholder="your-name"
                    value={formData.ownerSlug}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      ownerSlug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') 
                    })}
                    pattern="[a-z0-9-]+"
                    title="Lowercase letters, numbers, and hyphens only"
                    required
                  />
                </div>
                <p className="text-xs text-gray-500">
                  This will be your unique profile URL (e.g., rentalmanager.ro/owner/john-doe)
                </p>
              </div>
            )}
            
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
