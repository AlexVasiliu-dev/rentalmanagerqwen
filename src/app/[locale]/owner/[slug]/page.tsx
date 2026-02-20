import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Home, CheckCircle, Building } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { getTranslations } from 'next-intl/server';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

interface OwnerPageProps {
  params: {
    slug: string
  }
}

export default async function OwnerPage({ params }: OwnerPageProps) {
  const t = await getTranslations('subscription');
  const tCommon = await getTranslations('common');
  const tAuth = await getTranslations('auth');
  
  const user = await prisma.user.findUnique({
    where: { ownerSlug: params.slug },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      subscription: {
        select: {
          status: true,
          coveredProperties: true,
          paidProperties: true,
          currentPeriodEnd: true,
        },
      },
      managedProperties: {
        select: {
          id: true,
          address: true,
          city: true,
          type: true,
          available: true,
          monthlyRent: true,
        },
      },
      _count: {
        select: {
          managedProperties: true,
        },
      },
    },
  })

  if (!user) {
    notFound()
  }

  const isActive = user.subscription?.status === "ACTIVE"

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <div className="flex items-center gap-2 cursor-pointer">
                <Home className="h-6 w-6 text-blue-600" />
                <span className="text-xl font-bold text-gray-900">Property_mngmt.com</span>
              </div>
            </Link>
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        {/* Owner Profile */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-3xl">
              {user.name || "Property Owner"}
            </CardTitle>
            <CardDescription>
              Professional Property Management
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                <Building className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Properties Managed</p>
                  <p className="text-2xl font-bold text-blue-900">
                    {user._count.managedProperties}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Subscription Status</p>
                  <p className="text-2xl font-bold text-green-900">
                    {isActive ? "Active" : "Inactive"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg">
                <Home className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">Coverage</p>
                  <p className="text-2xl font-bold text-purple-900">
                    {user.subscription?.coveredProperties || 1} Properties
                  </p>
                </div>
              </div>
            </div>

            {isActive && user.subscription?.currentPeriodEnd && (
              <p className="text-sm text-gray-600 mt-4">
                Subscription valid until: {new Date(user.subscription.currentPeriodEnd).toLocaleDateString()}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Properties List */}
        <h2 className="text-2xl font-bold mb-4">Managed Properties</h2>

        {user.managedProperties.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {user.managedProperties.map((property) => (
              <Card key={property.id}>
                <CardHeader>
                  <CardTitle>{property.type}</CardTitle>
                  <CardDescription>
                    {property.address}, {property.city}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Status</span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        property.available
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}>
                        {property.available ? "Available" : "Occupied"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Rent</span>
                      <span className="font-semibold">{property.monthlyRent} EUR/month</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-8">
              <p className="text-center text-gray-600">
                No properties listed yet. Check back soon!
              </p>
            </CardContent>
          </Card>
        )}

        {/* CTA for new owners */}
        {!isActive && (
          <Card className="mt-8 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
            <CardHeader>
              <CardTitle className="text-2xl">Are you a property owner?</CardTitle>
              <CardDescription className="text-blue-100">
                Join Property_mngmt.com and manage your properties professionally
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <p className="text-lg font-semibold mb-2">Special Offer:</p>
                  <ul className="space-y-1 text-blue-100">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      First property FREE
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      Buy 1 Get 1 FREE on subscription
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      Only 50 EUR/year per property
                    </li>
                  </ul>
                </div>
                <Link href="/auth/register">
                  <Button size="lg" variant="secondary">
                    Get Started Free
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400">
            © 2026 Property_mngmt.com - Professional Property Management System
          </p>
        </div>
      </footer>
    </div>
  )
}
