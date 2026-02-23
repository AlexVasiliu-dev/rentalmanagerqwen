"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useTranslations } from 'next-intl';
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Edit, Trash2, X, Image as ImageIcon } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { PricingPrompt } from "@/components/PricingPrompt"
import { PropertyImageGallery } from "@/components/PropertyImageGallery"

interface Property {
  id: string
  address: string
  city: string
  type: string
  sqm: number
  monthlyRent: number
  available: boolean
  images: Array<{ url: string; isPrimary: boolean }>
  manager?: { name: string }
}

export default function PropertiesPage() {
  const t = useTranslations('properties');
  const tCommon = useTranslations('common');
  const router = useRouter()
  const { data: session } = useSession()
  const [properties, setProperties] = useState<Property[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingProperty, setEditingProperty] = useState<Property | null>(null)
  const [viewingImages, setViewingImages] = useState<string | null>(null)
  const [subscription, setSubscription] = useState<{ current: number; max: number } | null>(null)
  const [formData, setFormData] = useState({
    address: "",
    city: "",
    country: "Romania",
    type: "",
    sqm: "",
    monthlyRent: "",
    deposit: "",
    description: "",
  })

  useEffect(() => {
    fetchProperties()
    fetchSubscription()
  }, [])

  const fetchSubscription = async () => {
    try {
      const response = await fetch("/api/subscription")
      if (response.ok) {
        const data = await response.json()
        setSubscription({
          current: data.propertiesCount || 0,
          max: data.coveredProperties || data.trialProperties || 1,
        })
      }
    } catch (error) {
      console.error("Error fetching subscription:", error)
    }
  }

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

    const url = editingProperty
      ? `/api/properties/${editingProperty.id}`
      : "/api/properties"

    const method = editingProperty ? "PUT" : "POST"

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          sqm: parseFloat(formData.sqm),
          monthlyRent: parseFloat(formData.monthlyRent),
          deposit: formData.deposit ? parseFloat(formData.deposit) : undefined,
        }),
      })

      if (response.ok) {
        await fetchProperties()
        setShowForm(false)
        setEditingProperty(null)
        setFormData({
          address: "",
          city: "",
          country: "Romania",
          type: "",
          sqm: "",
          monthlyRent: "",
          deposit: "",
          description: "",
        })
      }
    } catch (error) {
      console.error("Error saving property:", error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm(tCommon('confirmDelete'))) return

    try {
      const response = await fetch(`/api/properties/${id}`, { method: "DELETE" })
      if (response.ok) {
        await fetchProperties()
      }
    } catch (error) {
      console.error("Error deleting property:", error)
    }
  }

  const handleEdit = (property: Property) => {
    setEditingProperty(property)
    setFormData({
      address: property.address,
      city: property.city,
      country: "Romania",
      type: property.type,
      sqm: property.sqm.toString(),
      monthlyRent: property.monthlyRent.toString(),
      deposit: "",
      description: "",
    })
    setShowForm(true)
  }

  if (session?.user.role !== "ADMIN") {
    return (
      <div>
        <h1 className="text-3xl font-bold mb-6">{t('title')}</h1>
        <Card>
          <CardContent className="py-8">
            <p className="text-gray-600">Only admins can manage properties.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('title')}</h1>
          <p className="text-gray-600">Manage your rental properties</p>
        </div>
        {subscription && subscription.current >= subscription.max ? (
          <Button onClick={() => router.push("/dashboard/subscription")} disabled>
            <Plus className="h-4 w-4 mr-2" />
            {t('addProperty')} (Upgrade Required)
          </Button>
        ) : (
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            {t('addProperty')}
          </Button>
        )}
      </div>

      {/* Subscription Status */}
      {subscription && (
        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Properties</p>
                  <p className="text-2xl font-bold">
                    {subscription.current} / {subscription.max}
                  </p>
                </div>
                <div className="text-right">
                  {subscription.current >= subscription.max ? (
                    <p className="text-sm text-red-600 font-medium">Limit Reached</p>
                  ) : (
                    <p className="text-sm text-green-600">
                      {subscription.max - subscription.current} remaining
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {subscription.current >= subscription.max && (
            <PricingPrompt
              currentProperties={subscription.current}
              maxProperties={subscription.max}
            />
          )}
        </div>
      )}

      {showForm && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{editingProperty ? t('editProperty') : t('addProperty')}</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => {
                setShowForm(false)
                setEditingProperty(null)
              }}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">{t('address')}</label>
                  <Input
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">{t('city')}</label>
                  <Input
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">{t('type')}</label>
                  <Input
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    placeholder="Apartment, House, Studio"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">{t('surface')}</label>
                  <Input
                    type="number"
                    value={formData.sqm}
                    onChange={(e) => setFormData({ ...formData, sqm: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">{t('rent')}</label>
                  <Input
                    type="number"
                    value={formData.monthlyRent}
                    onChange={(e) => setFormData({ ...formData, monthlyRent: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">{t('deposit')}</label>
                  <Input
                    type="number"
                    value={formData.deposit}
                    onChange={(e) => setFormData({ ...formData, deposit: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">{t('description')}</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit">
                  {editingProperty ? tCommon('save') : tCommon('create')}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false)
                    setEditingProperty(null)
                  }}
                >
                  {tCommon('cancel')}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Property</TableHead>
              <TableHead>{t('type')}</TableHead>
              <TableHead>{t('surface')}</TableHead>
              <TableHead>{t('rent')}</TableHead>
              <TableHead>{t('status')}</TableHead>
              <TableHead>{tCommon('actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {properties.map((property) => (
              <TableRow key={property.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{property.address}</div>
                    <div className="text-sm text-gray-600">{property.city}</div>
                  </div>
                </TableCell>
                <TableCell>{property.type}</TableCell>
                <TableCell>{property.sqm} sqm</TableCell>
                <TableCell>{formatCurrency(property.monthlyRent)}/month</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded text-xs ${
                    property.available
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}>
                    {property.available ? t('available') : t('occupied')}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setViewingImages(viewingImages === property.id ? null : property.id)}
                    >
                      <ImageIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(property)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(property.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Image Gallery View */}
      {viewingImages && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{t('images')}</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewingImages(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <PropertyImageGallery propertyId={viewingImages} editable />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
