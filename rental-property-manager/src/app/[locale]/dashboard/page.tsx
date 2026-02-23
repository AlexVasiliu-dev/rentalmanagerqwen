import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Home, Users, DollarSign, FileText, Mail, Phone } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ContactManager } from "@/components/ContactManager"
import { ContactOwner } from "@/components/ContactOwner"
import { getTranslations } from 'next-intl/server';
import { headers } from 'next/headers';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  const t = await getTranslations('dashboard');
  const tRoles = await getTranslations('roles');

  // Get locale from headers
  const headersList = headers()
  const pathname = headersList.get('x-pathname') || ''
  const locale = pathname.split('/')[1] || 'en'

  if (!session) {
    redirect(`/${locale}/auth/signin`)
  }

  // Fetch dashboard stats based on role
  let stats: Record<string, number | unknown> = {}
  let activeLeaseForRenter: Awaited<ReturnType<typeof prisma.lease.findFirst>> | null = null

  if (session.user.role === "ADMIN") {
    // Get ALL properties in the system (owner sees everything)
    const [allProperties, allLeases, monthlyRevenue] = await Promise.all([
      prisma.property.findMany({
        where: {},
        select: { id: true }
      }),
      prisma.lease.findMany({
        where: { isActive: true },
        select: { id: true, renterId: true }
      }),
      prisma.bill.aggregate({
        where: {
          paid: true,
          periodEnd: {
            gte: new Date(new Date().setMonth(new Date().getMonth() - 1)),
          },
        },
        _sum: { amount: true },
      }),
    ])
    
    const propertyCount = allProperties.length
    const activeLeases = allLeases.length
    
    // Get distinct renters
    const uniqueRenterIds = [...new Set(allLeases.map(l => l.renterId))]
    const userCount = uniqueRenterIds.length

    stats = {
      properties: propertyCount,
      renters: userCount,
      activeLeases,
      revenue: monthlyRevenue._sum.amount || 0,
    }
  } else if (session.user.role === "MANAGER") {
    const [propertyCount, activeLeases] = await Promise.all([
      prisma.property.count({ where: { managerId: session.user.id } }),
      prisma.lease.count({
        where: {
          isActive: true,
          property: {
            managerId: session.user.id,
          },
        },
      }),
    ])

    stats = {
      properties: propertyCount,
      activeLeases,
    }
  } else if (session.user.role === "RENTER") {
    const activeLease = await prisma.lease.findFirst({
      where: {
        renterId: session.user.id,
        isActive: true,
      },
      include: {
        property: {
          select: {
            address: true,
            city: true,
            manager: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
    })
    activeLeaseForRenter = activeLease

    const unpaidBills = await prisma.bill.aggregate({
      where: {
        lease: {
          renterId: session.user.id,
        },
        paid: false,
      },
      _sum: { amount: true },
    })

    stats = {
      activeLease,
      unpaidBills: unpaidBills._sum.amount || 0,
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t('title')}</h1>
        <p className="text-gray-600">
          {t('welcome')}, {session.user.name || session.user.email}
        </p>
      </div>

      {/* Stats Grid */}
      {session.user.role === "ADMIN" && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('properties')}</CardTitle>
              <Home className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{String(stats.properties)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('tenants')}</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{String(stats.renters)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('leases')}</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{String(stats.activeLeases)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('totalRevenue')}</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(Number(stats.revenue))}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Renter specific info */}
      {session.user.role === "RENTER" && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Proprietatea Ta</CardTitle>
            </CardHeader>
            <CardContent>
              {stats.activeLease ? (
                <div>
                  <p className="font-medium">{String((stats.activeLease as any).property.address)}</p>
                  <p className="text-sm text-gray-600">{String((stats.activeLease as any).property.city)}</p>
                  <p className="text-sm mt-2">
                    Chirie Lunară: <span className="font-medium">{formatCurrency(Number((stats.activeLease as any).monthlyRent))} RON</span>
                  </p>
                </div>
              ) : (
                <p className="text-gray-600">Nu s-a găsit niciun contract activ</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Facturi Neplătite</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(Number(stats.unpaidBills))} RON
              </div>
              <p className="text-sm text-gray-600 mt-1">Suma totală neplătită</p>
            </CardContent>
          </Card>

          {/* Contact Information */}
          {activeLeaseForRenter && (
            <>
              <ContactManager
                manager={{
                  name: (activeLeaseForRenter as any).property.manager?.name || null,
                  email: (activeLeaseForRenter as any).property.manager?.email || "manager@rentmanager.com",
                  phone: null,
                }}
              />
              <Card>
                <CardHeader>
                  <CardTitle>Property Owner</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    Need to reach the property owner? Send them a message directly.
                  </p>
                  <ContactOwner
                    propertyId={activeLeaseForRenter.propertyId}
                    tenantName={session.user.name || undefined}
                    tenantEmail={session.user.email}
                  />
                </CardContent>
              </Card>
            </>
          )}
        </div>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Acțiuni Rapide</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {session.user.role === "ADMIN" && (
              <>
                <a href={`/${locale}/dashboard/properties?action=add`} className="inline-flex">
                  <Button>Adaugă Proprietate</Button>
                </a>
                <a href={`/${locale}/dashboard/users`} className="inline-flex">
                  <Button variant="outline">Gestionează Utilizatori</Button>
                </a>
              </>
            )}
            {session.user.role === "RENTER" && (
              <a href={`/${locale}/dashboard/meter-readings?action=add`} className="inline-flex">
                <Button>Trimite Citire Contoare</Button>
              </a>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
