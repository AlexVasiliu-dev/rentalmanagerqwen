"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useTranslations } from 'next-intl';
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Edit, Trash2, X, Image as ImageIcon, Home, FileText, Users, User } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { PricingPrompt } from "@/components/PricingPrompt"
import { PropertyImageGallery } from "@/components/PropertyImageGallery"

interface Property {
  id: string
  address: string
  city: string
  type: string
  sqm: number
  rooms?: number | null
  monthlyRent: number
  available: boolean
  images: Array<{ url: string; isPrimary: boolean }>
  manager?: { id: string; name: string; email: string }
  leases?: Array<{
    id: string
    startDate: string
    endDate: string | null
    isActive: boolean
    renter: { id: string; name: string; email: string; phone: string }
  }>
  _count?: { leases: number }
}

interface Manager {
  id: string
  name: string
  email: string
}

export default function PropertiesPage() {
  const t = useTranslations('properties');
  const tCommon = useTranslations('common');
  const router = useRouter()
  const { data: session } = useSession()
  const [properties, setProperties] = useState<Property[]>([])
  const [managers, setManagers] = useState<Manager[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingProperty, setEditingProperty] = useState<Property | null>(null)
  const [viewingImages, setViewingImages] = useState<string | null>(null)
  const [viewingMeterReadings, setViewingMeterReadings] = useState<string | null>(null)
  const [subscription, setSubscription] = useState<{ current: number; max: number } | null>(null)
  const [showTrialNotification, setShowTrialNotification] = useState(false)
  const [trialInfo, setTrialInfo] = useState<{ daysRemaining: number; trialEnd: string } | null>(null)
  const [formData, setFormData] = useState({
    address: "",
    city: "",
    country: "Romania",
    type: "",
    sqm: "",
    rooms: "",
    floor: "",
    monthlyRent: "",
    deposit: "",
    description: "",
    managerId: "",
    images: [] as string[],
  })

  useEffect(() => {
    fetchProperties()
    fetchSubscription()
    fetchManagers()
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

  const fetchManagers = async () => {
    try {
      const response = await fetch("/api/users?role=MANAGER")
      if (response.ok) {
        const data = await response.json()
        setManagers(data)
      }
    } catch (error) {
      console.error("Error fetching managers:", error)
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
          rooms: formData.rooms ? parseInt(formData.rooms) : undefined,
          floor: formData.floor ? parseInt(formData.floor) : undefined,
          monthlyRent: parseFloat(formData.monthlyRent),
          deposit: formData.deposit ? parseFloat(formData.deposit) : undefined,
          managerId: formData.managerId || undefined,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        await fetchProperties()
        setShowForm(false)
        setEditingProperty(null)
        setFormData({
          address: "",
          city: "",
          country: "Romania",
          type: "",
          sqm: "",
          rooms: "",
          floor: "",
          monthlyRent: "",
          deposit: "",
          description: "",
          images: [],
        })
        
        // Check if this triggered trial notification (2nd property added)
        if (data.trialInfo) {
          setTrialInfo({
            daysRemaining: data.trialInfo.daysRemaining,
            trialEnd: data.trialInfo.trialEnd,
          })
          setShowTrialNotification(true)
        }
      } else {
        const error = await response.json()
        alert(error.error || "Eroare la salvarea proprietății")
      }
    } catch (error) {
      console.error("Error saving property:", error)
      alert("Eroare la salvarea proprietății")
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
      rooms: property.rooms?.toString() || "",
      floor: property.floor?.toString() || "",
      monthlyRent: property.monthlyRent.toString(),
      deposit: "",
      description: "",
      managerId: property.manager?.id || "",
      images: property.images?.map(img => img.url) || [],
    })
    setShowForm(true)
  }

  if (session?.user.role !== "ADMIN") {
    return (
      <div>
        <h1 className="text-3xl font-bold mb-6">{t('title')}</h1>
        <Card>
          <CardContent className="py-8">
            <p className="text-gray-600">Doar administratorii pot gestiona proprietăți.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Trial Notification Banner */}
      {showTrialNotification && trialInfo && (
        <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
          <CardContent className="py-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="bg-green-600 text-white p-2 rounded-full">
                  <Check className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-green-900">Perioadă de Probă Activă!</h3>
                  <p className="text-sm text-green-700 mt-1">
                    Ai adăugat a 2-a proprietate. Ai început automat perioada de probă de 15 zile.
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-green-800">
                    <span className="font-semibold">📅 Zile rămase: {trialInfo.daysRemaining}</span>
                    <span className="font-semibold">⏰ Expiră: {new Date(trialInfo.trialEnd).toLocaleDateString('ro-RO')}</span>
                  </div>
                  <p className="text-xs text-green-600 mt-2">
                    💡 După cele 15 zile, va trebui să te abonezi pentru a continua să gestionezi proprietățile.
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowTrialNotification(false)}
                className="text-green-600 hover:text-green-800"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('title')}</h1>
          <p className="text-gray-600">Gestionează proprietățile tale de închiriere</p>
        </div>
        {subscription && subscription.current >= subscription.max ? (
          <Button onClick={() => router.push("/dashboard/subscription")} disabled>
            <Plus className="h-4 w-4 mr-2" />
            {t('addProperty')} (Necesar Upgrade)
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
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-600">Proprietăți</p>
                  <p className="text-2xl font-bold">
                    {subscription.current} / {subscription.max}
                  </p>
                </div>
                <div className="text-right">
                  {subscription.current >= subscription.max ? (
                    <p className="text-sm text-red-600 font-medium">Limită Atinsă</p>
                  ) : (
                    <p className="text-sm text-green-600">
                      {subscription.max - subscription.current} rămase
                    </p>
                  )}
                </div>
              </div>
              
              {/* Property Buttons */}
              {properties.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs text-gray-500 font-medium">Proprietățile Tale:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {properties.map((property, idx) => (
                      <button
                        key={property.id}
                        onClick={() => handleEdit(property)}
                        className="text-left p-2 bg-blue-50 hover:bg-blue-100 rounded text-sm transition-colors"
                      >
                        <p className="font-medium text-blue-900 truncate">{property.type}</p>
                        <p className="text-xs text-blue-700 truncate">{property.city}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {subscription.current >= subscription.max && (
            <PricingPrompt
              currentProperties={subscription.current}
              maxProperties={subscription.max}
              onUpgrade={() => router.push("/dashboard/subscription")}
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
              <div className="grid md:grid-cols-3 gap-4">
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
                    placeholder="Apartament, Casă, Garsonieră"
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
                  <label className="text-sm font-medium mb-1 block">Camere</label>
                  <Input
                    type="number"
                    value={formData.rooms}
                    onChange={(e) => setFormData({ ...formData, rooms: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Etaj</label>
                  <Input
                    type="number"
                    value={formData.floor}
                    onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
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

              {/* Manager Selection */}
              <div className="border-t pt-4">
                <label className="text-sm font-medium mb-2 block">Manager Proprietate</label>
                <select
                  value={formData.managerId}
                  onChange={(e) => setFormData({ ...formData, managerId: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">-- Fără Manager (Gestionezi tu) --</option>
                  {managers.map((manager) => (
                    <option key={manager.id} value={manager.id}>
                      {manager.name} ({manager.email})
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-2">
                  Selectează un manager care va gestiona această proprietate
                </p>
              </div>

              {/* Image Upload Section */}
              <div className="border-t pt-4">
                <label className="text-sm font-medium mb-2 block">Imagini (URL-uri)</label>
                <div className="space-y-2">
                  {formData.images.map((img, idx) => (
                    <div key={idx} className="flex gap-2">
                      <Input
                        value={img}
                        onChange={(e) => {
                          const newImages = [...formData.images]
                          newImages[idx] = e.target.value
                          setFormData({ ...formData, images: newImages })
                        }}
                        placeholder={`https://exemplu.ro/imagine${idx + 1}.jpg`}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newImages = formData.images.filter((_, i) => i !== idx)
                          setFormData({ ...formData, images: newImages })
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setFormData({ ...formData, images: [...formData.images, ""] })}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Adaugă Imagine (URL)
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Adaugă URL-urile imaginilor proprietății. Prima imagine va fi cea principală.
                </p>
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

      {/* Properties Grid */}
      {properties.length > 0 ? (
        <div className="grid md:grid-cols-2 gap-4">
          {properties.map((property) => {
            const activeLease = property.leases?.[0]
            const leaseProgress = activeLease && activeLease.startDate && activeLease.endDate
              ? Math.min(100, Math.max(0, 
                  ((Date.now() - new Date(activeLease.startDate).getTime()) / 
                   (new Date(activeLease.endDate).getTime() - new Date(activeLease.startDate).getTime())) * 100
                ))
              : null
            const daysRemaining = activeLease && activeLease.endDate
              ? Math.ceil((new Date(activeLease.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
              : null

            return (
              <Card key={property.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{property.type}</h3>
                      <p className="text-sm text-gray-600">{property.address}, {property.city}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      property.available
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}>
                      {property.available ? t('available') : t('occupied')}
                    </span>
                  </div>

                  {/* Manager Info */}
                  {property.manager && (
                    <div className="mb-3 p-2 bg-blue-50 rounded text-sm">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-blue-600" />
                        <span className="text-xs text-blue-700 font-medium">Manager:</span>
                        <span className="text-xs text-blue-900">{property.manager.name}</span>
                      </div>
                    </div>
                  )}

                  {/* Tenant Info with Lease Progress */}
                  {activeLease && (
                    <div className="mb-3 p-3 bg-green-50 rounded border border-green-200">
                      <div className="flex items-center gap-2 mb-2">
                        <User className="h-4 w-4 text-green-600" />
                        <span className="text-xs font-semibold text-green-900">Chiriaș:</span>
                        <span className="text-sm font-medium text-green-900">{activeLease.renter.name}</span>
                      </div>
                      
                      {/* Lease Progress Bar */}
                      {leaseProgress !== null && (
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs text-green-700">
                            <span>Progres contract: {Math.round(leaseProgress)}%</span>
                            <span className="font-semibold">
                              {daysRemaining !== null && daysRemaining > 0 
                                ? `${daysRemaining} zile rămase` 
                                : 'Expirat'}
                            </span>
                          </div>
                          <div className="w-full bg-green-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all duration-500 ${
                                leaseProgress > 80 ? 'bg-red-500' : 'bg-green-600'
                              }`}
                              style={{ width: `${leaseProgress}%` }}
                            />
                          </div>
                          <div className="flex justify-between text-xs text-green-600 mt-1">
                            <span>{new Date(activeLease.startDate).toLocaleDateString('ro-RO')}</span>
                            <span>{new Date(activeLease.endDate!).toLocaleDateString('ro-RO')}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Property Stats */}
                  <div className="grid grid-cols-3 gap-2 mb-4 text-sm">
                    <div className="text-center p-2 bg-gray-50 rounded">
                      <p className="text-xs text-gray-500">Suprafață</p>
                      <p className="font-semibold">{property.sqm} mp</p>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded">
                      <p className="text-xs text-gray-500">Chirie</p>
                      <p className="font-semibold text-blue-600">{formatCurrency(property.monthlyRent)}</p>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded">
                      <p className="text-xs text-gray-500">Camere</p>
                      <p className="font-semibold">{property.rooms || '-'}</p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-3 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => setViewingImages(viewingImages === property.id ? null : property.id)}
                    >
                      <ImageIcon className="h-4 w-4 mr-1" />
                      Imagini
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => setViewingMeterReadings(viewingMeterReadings === property.id ? null : property.id)}
                    >
                      <FileText className="h-4 w-4 mr-1" />
                      Contoare
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleEdit(property)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Editează
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 text-red-600 hover:text-red-700"
                      onClick={() => handleDelete(property.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Șterge
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Home className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Nu ai proprietăți adăugate încă</p>
            <Button className="mt-4" onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Adaugă Prima Proprietate
            </Button>
          </CardContent>
        </Card>
      )}

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

      {/* Meter Readings View */}
      {viewingMeterReadings && (
        <MeterReadingsView 
          propertyId={viewingMeterReadings} 
          onClose={() => setViewingMeterReadings(null)} 
        />
      )}
    </div>
  )
}

// Meter Readings View Component
function MeterReadingsView({ propertyId, onClose }: { propertyId: string; onClose: () => void }) {
  const [readings, setReadings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMeterReadings()
  }, [propertyId])

  const fetchMeterReadings = async () => {
    try {
      const response = await fetch(`/api/meters?propertyId=${propertyId}`)
      if (response.ok) {
        const data = await response.json()
        setReadings(data)
      }
    } catch (error) {
      console.error("Error fetching meter readings:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Citiri Contoare</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-gray-600 text-center py-8">Se încarcă...</p>
        ) : readings.length > 0 ? (
          <div className="space-y-4">
            {readings.map((meter: any) => (
              <Card key={meter.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">{meter.type}</h4>
                    <span className="text-sm text-gray-600">Serial: {meter.serialNumber || 'N/A'}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    Preț: {meter.pricePerUnit} RON/unitate
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-gray-600 text-center py-8">Nu există contoare pentru această proprietate</p>
        )}
      </CardContent>
    </Card>
  )
}
