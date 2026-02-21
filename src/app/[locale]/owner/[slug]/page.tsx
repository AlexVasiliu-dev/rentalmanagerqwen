import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Home, CheckCircle, Building, Mail, Phone } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { getTranslations } from 'next-intl/server';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { ContactOwner } from '@/components/ContactOwner';

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
      managedProperties: {
        where: { available: true },
        select: {
          id: true,
          address: true,
          city: true,
          type: true,
          available: true,
          monthlyRent: true,
          description: true,
          rooms: true,
          sqm: true,
          images: {
            where: { isPrimary: true },
            select: { url: true },
            take: 1,
          },
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-40">
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
            <div className="grid md:grid-cols-2 gap-4">
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
                  <p className="text-sm text-gray-600">Owner Status</p>
                  <p className="text-2xl font-bold text-green-900">
                    Verified Owner
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Properties List */}
        <h2 className="text-2xl font-bold mb-4">Available Properties</h2>

        {user.managedProperties.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {user.managedProperties.map((property) => (
              <Card key={property.id}>
                <CardHeader>
                  {property.images[0] && (
                    <div className="h-48 -mx-6 -mt-6 mb-4 overflow-hidden rounded-t-lg">
                      <img 
                        src={property.images[0].url} 
                        alt={property.address}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <CardTitle>{property.type}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {property.address}, {property.city}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {property.description && (
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {property.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Rooms</span>
                      <span className="font-medium">{property.rooms || '-'}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Area</span>
                      <span className="font-medium">{property.sqm} m²</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Rent</span>
                      <span className="font-bold text-lg text-blue-600">{property.monthlyRent} EUR/month</span>
                    </div>
                    <Link href={`/properties/${property.id}`}>
                      <Button className="w-full" variant="default">
                        View Details
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-8">
              <p className="text-center text-gray-600">
                No properties available at the moment. Check back soon!
              </p>
            </CardContent>
          </Card>
        )}

        {/* Contact Owner Section */}
        {user.managedProperties.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Contact Owner</CardTitle>
              <CardDescription>
                Interested in one of the properties? Send a message to {user.name || "the owner"}.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ContactOwner
                propertyId={user.managedProperties[0].id}
                tenantName=""
                tenantEmail=""
              />
            </CardContent>
          </Card>
        )}

        {/* CTA for new owners */}
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
                <p className="text-lg font-semibold mb-2">Get your owner page at:</p>
                <p className="text-blue-100 font-mono">rentalmanager.ro/owner/your-name</p>
              </div>
              <Link href="/auth/register">
                <Button size="lg" variant="secondary">
                  Register Free
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
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
