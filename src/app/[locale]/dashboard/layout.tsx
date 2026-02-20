"use client"

import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { signOut } from "next-auth/react"
import { usePathname } from "next/navigation"
import { useTranslations } from 'next-intl';
import { Button } from "@/components/ui/button"
import { Home, Users, FileText, DollarSign, LogOut, Menu, LayoutDashboard, CreditCard } from "lucide-react"
import { useState } from "react"
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { LocaleLink } from '@/components/LocaleLink';

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { data: session, status } = useSession()
  const t = useTranslations('dashboard');
  const tNav = useTranslations('navigation');
  const tAuth = useTranslations('auth');
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Get locale at the top
  const locale = pathname?.split('/')[1] || 'en'

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (status === "unauthenticated") {
    redirect(`/${locale}/auth/signin`)
  }

  const navigation = [
    { name: t('title'), href: "/dashboard", icon: LayoutDashboard },
    { name: t('properties'), href: "/dashboard/properties", icon: Home },
    { name: tNav('users') || "Users", href: "/dashboard/users", icon: Users, roles: ["ADMIN"] },
    { name: t('leases'), href: "/dashboard/leases", icon: FileText },
    { name: t('meterReadings'), href: "/dashboard/meter-readings", icon: FileText },
    { name: t('bills'), href: "/dashboard/bills", icon: DollarSign },
    { name: t('reports'), href: "/dashboard/reports", icon: DollarSign, roles: ["ADMIN", "MANAGER"] },
    { name: t('subscription'), href: "/dashboard/subscription", icon: CreditCard },
  ]

  const filteredNavigation = navigation.filter(
    (item) => !item.roles || (session?.user.role && item.roles.includes(session.user.role))
  )

  // Add locale prefix to all navigation links
  const localizedNavigation = filteredNavigation.map(item => ({
    ...item,
    href: `/${locale}${item.href}`
  }))

  const handleSignOut = () => {
    signOut({ callbackUrl: `/${locale}` })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white border-b sticky top-0 z-40">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-md hover:bg-gray-100"
              >
                <Menu className="h-5 w-5" />
              </button>
              <LocaleLink href="/dashboard" className="flex items-center gap-2">
                <Home className="h-6 w-6 text-blue-600" />
                <span className="font-bold text-lg hidden sm:inline">RentManager</span>
              </LocaleLink>
            </div>

            <div className="flex items-center gap-4">
              <LanguageSwitcher />
              <div className="text-sm text-gray-600 hidden sm:block">
                <span className="font-medium">{session?.user.name}</span>
                <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                  {session?.user.role}
                </span>
              </div>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">{tAuth('signOut')}</span>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Sidebar */}
          <aside className={`
            fixed inset-y-0 left-0 z-30 w-64 bg-white border-r transform transition-transform duration-200 ease-in-out
            lg:translate-x-0 lg:static lg:h-auto
            ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
          `}>
            <div className="h-full overflow-y-auto py-6 px-4">
              <nav className="space-y-1">
                {localizedNavigation.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
                  return (
                    <LocaleLink
                      key={item.name}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`
                        flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors
                        ${isActive
                          ? "bg-blue-50 text-blue-600"
                          : "text-gray-700 hover:bg-gray-100"
                        }
                      `}
                    >
                      <item.icon className="h-5 w-5" />
                      {item.name}
                    </LocaleLink>
                  )
                })}
              </nav>
            </div>
          </aside>

          {/* Overlay for mobile */}
          {mobileMenuOpen && (
            <div
              className="fixed inset-0 bg-black/50 z-20 lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
          )}

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
