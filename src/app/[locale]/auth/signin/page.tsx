"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter, usePathname } from "next/navigation"
import { useTranslations } from 'next-intl';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Home } from "lucide-react"
import { LocaleLink } from '@/components/LocaleLink'

export default function SignInPage() {
  const t = useTranslations('auth');
  const router = useRouter()
  const pathname = usePathname()
  const locale = pathname?.split('/')[1] || 'en'
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError(result.error)
      } else {
        // Fetch user info after successful login to get ownerSlug
        try {
          const userResponse = await fetch("/api/auth/me")
          if (userResponse.ok) {
            const userData = await userResponse.json()
            // Redirect owners to properties page, SUPERADMIN and others to dashboard
            if (userData.role === "SUPERADMIN") {
              router.push(`/${locale}/dashboard`)
            } else if (userData.role === "ADMIN" && userData.ownerSlug) {
              // For now, redirect to dashboard - business pages coming soon
              router.push(`/${locale}/dashboard`)
            } else {
              router.push(`/${locale}/dashboard`)
            }
          } else {
            // Fallback to dashboard if we can't get user info
            router.push(`/${locale}/dashboard`)
          }
        } catch {
          // If fetch fails, still redirect to dashboard
          router.push(`/${locale}/dashboard`)
        }
        router.refresh()
      }
    } catch {
      setError("A apărut o eroare neașteptată")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Home className="h-12 w-12 text-blue-600" />
          </div>
          <CardTitle className="text-2xl">{t('signInTitle')}</CardTitle>
          <CardDescription>
            {t('signInDescription')}
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
              <label htmlFor="email" className="text-sm font-medium">
                {t('email')}
              </label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                {t('password')}
              </label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? `${t('signIn')}...` : t('signIn')}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            <LocaleLink href="/auth/register" className="text-blue-600 hover:underline">
              {t('noAccount')} {t('register')}
            </LocaleLink>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
