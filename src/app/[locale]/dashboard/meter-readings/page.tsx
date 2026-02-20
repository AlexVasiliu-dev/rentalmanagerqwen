"use client"

import { useEffect, useState, useRef } from "react"
import { useSession } from "next-auth/react"
import { useTranslations } from 'next-intl';
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Camera } from "lucide-react"
import { formatCurrency, formatDateTime } from "@/lib/utils"

interface MeterReading {
  id: string
  meter: {
    id: string
    type: string
    pricePerUnit: number
  }
  readingType: "INITIAL" | "MONTHLY" | "FINAL"
  value: number
  consumption: number | null
  photoUrl: string | null
  isOCRProcessed: boolean
  ocrConfidence: number | null
  readingDate: string
  verified: boolean
}

interface Meter {
  id: string
  type: string
  pricePerUnit: number
}

export default function MeterReadingsPage() {
  const t = useTranslations('meters');
  const tCommon = useTranslations('common');
  const { data: session } = useSession()
  const [readings, setReadings] = useState<MeterReading[]>([])
  const [meters, setMeters] = useState<Meter[]>([])
  const [showForm, setShowForm] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [formData, setFormData] = useState({
    meterId: "",
    readingType: "MONTHLY" as "INITIAL" | "MONTHLY" | "FINAL",
    value: "",
    photoUrl: "",
    notes: "",
  })
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchData()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchData = async () => {
    try {
      const [readingsRes, metersRes] = await Promise.all([
        fetch("/api/meter-readings"),
        fetch("/api/meters"),
      ])

      if (readingsRes.ok) {
        const data = await readingsRes.json()
        setReadings(data)
      }

      if (metersRes.ok) {
        const data = await metersRes.json()
        setMeters(data)
        if (data.length > 0 && !formData.meterId) {
          setFormData((prev) => ({ ...prev, meterId: data[0].id }))
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error)
    }
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)

    try {
      const photoUrl = URL.createObjectURL(file)
      setFormData({ ...formData, photoUrl })
    } catch (error) {
      console.error("Error uploading photo:", error)
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const response = await fetch("/api/meter-readings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          meterId: formData.meterId,
          readingType: formData.readingType,
          value: parseFloat(formData.value),
          photoUrl: formData.photoUrl || undefined,
          notes: formData.notes || undefined,
        }),
      })

      if (response.ok) {
        await fetchData()
        setShowForm(false)
        setFormData({
          meterId: meters[0]?.id || "",
          readingType: "MONTHLY",
          value: "",
          photoUrl: "",
          notes: "",
        })
        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }
      }
    } catch (error) {
      console.error("Error submitting reading:", error)
    }
  }

  const getReadingTypeColor = (type: string) => {
    switch (type) {
      case "INITIAL":
        return "bg-blue-100 text-blue-800"
      case "MONTHLY":
        return "bg-green-100 text-green-800"
      case "FINAL":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getMeterTypeIcon = (type: string) => {
    switch (type) {
      case "ELECTRICITY":
        return "⚡"
      case "WATER":
        return "💧"
      case "GAS":
        return "🔥"
      default:
        return "📊"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('title')}</h1>
          <p className="text-gray-600">Track and submit utility meter readings</p>
        </div>
        {session?.user.role !== "RENTER" && (
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            {t('addReading')}
          </Button>
        )}
      </div>

      {session?.user.role === "RENTER" && (
        <Card>
          <CardHeader>
            <CardTitle>{t('addReading')}</CardTitle>
            <CardDescription>
              {t('photoRequired')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">{t('type')}</label>
                  <select
                    value={formData.meterId}
                    onChange={(e) => setFormData({ ...formData, meterId: e.target.value })}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    required
                  >
                    {meters.map((meter) => (
                      <option key={meter.id} value={meter.id}>
                        {getMeterTypeIcon(meter.type)} {meter.type}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">{t('readingType')}</label>
                  <select
                    value={formData.readingType}
                    onChange={(e) => setFormData({ ...formData, readingType: e.target.value as "INITIAL" | "MONTHLY" | "FINAL" })}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    required
                  >
                    <option value="MONTHLY">{t('monthly')}</option>
                    <option value="INITIAL">{t('initial')}</option>
                    <option value="FINAL">{t('final')}</option>
                  </select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">{t('reading')}</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    placeholder="Enter meter reading"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">{t('uploadPhoto')}</label>
                  <div className="flex gap-2">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      ref={fileInputRef}
                      className="flex-1"
                    />
                    <Button type="button" variant="outline" size="icon" onClick={() => fileInputRef.current?.click()}>
                      <Camera className="h-4 w-4" />
                    </Button>
                  </div>
                  {uploading && <p className="text-sm text-gray-600 mt-1">{tCommon('processing')}</p>}
                  {formData.photoUrl && <p className="text-sm text-green-600 mt-1">✓ {t('uploadSuccess')}</p>}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">{t('notes')}</label>
                <Input
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Any additional notes"
                />
              </div>

              <Button type="submit" disabled={uploading}>
                {uploading ? tCommon('processing') : t('submit')}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {showForm && session?.user.role !== "RENTER" && (
        <Card>
          <CardHeader>
            <CardTitle>{t('addReading')}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">{t('type')}</label>
                  <select
                    value={formData.meterId}
                    onChange={(e) => setFormData({ ...formData, meterId: e.target.value })}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    required
                  >
                    {meters.map((meter) => (
                      <option key={meter.id} value={meter.id}>
                        {getMeterTypeIcon(meter.type)} {meter.type}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">{t('readingType')}</label>
                  <select
                    value={formData.readingType}
                    onChange={(e) => setFormData({ ...formData, readingType: e.target.value as "INITIAL" | "MONTHLY" | "FINAL" })}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    required
                  >
                    <option value="MONTHLY">{t('monthly')}</option>
                    <option value="INITIAL">{t('initial')}</option>
                    <option value="FINAL">{t('final')}</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">{t('reading')}</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit">{tCommon('save')}</Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  {tCommon('cancel')}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Reading History</CardTitle>
        </CardHeader>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{tCommon('date')}</TableHead>
              <TableHead>{t('type')}</TableHead>
              <TableHead>{t('readingType')}</TableHead>
              <TableHead>{t('reading')}</TableHead>
              <TableHead>{t('consumption')}</TableHead>
              <TableHead>Estimated Cost</TableHead>
              <TableHead>{tCommon('status')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {readings.map((reading) => (
              <TableRow key={reading.id}>
                <TableCell>{formatDateTime(reading.readingDate)}</TableCell>
                <TableCell>
                  {getMeterTypeIcon(reading.meter.type)} {reading.meter.type}
                </TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded text-xs ${getReadingTypeColor(reading.readingType)}`}>
                    {reading.readingType}
                  </span>
                </TableCell>
                <TableCell className="font-medium">{reading.value}</TableCell>
                <TableCell>
                  {reading.consumption !== null ? reading.consumption.toFixed(2) : "-"}
                </TableCell>
                <TableCell>
                  {reading.consumption !== null
                    ? formatCurrency(reading.consumption * reading.meter.pricePerUnit)
                    : "-"}
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    {reading.verified && (
                      <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-800">
                        {t('verified')}
                      </span>
                    )}
                    {reading.isOCRProcessed && (
                      <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-800">
                        OCR
                      </span>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
