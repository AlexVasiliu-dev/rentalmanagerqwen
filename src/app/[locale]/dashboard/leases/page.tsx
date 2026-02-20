"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useTranslations } from 'next-intl';
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Plus, X } from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/utils"

interface Lease {
  id: string
  startDate: string
  endDate: string | null
  isActive: boolean
  monthlyRent: number
  deposit: number | null
  property: {
    id: string
    address: string
    city: string
    type: string
  }
  renter: {
    id: string
    name: string | null
    email: string
  }
}

interface User {
  id: string
  name: string | null
  email: string
  role: string
  approved: boolean
}

interface Property {
  id: string
  address: string
  city: string
}

export default function LeasesPage() {
  const t = useTranslations('leases');
  const tCommon = useTranslations('common');
  const { data: session } = useSession()
  const [leases, setLeases] = useState<Lease[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [properties, setProperties] = useState<Property[]>([])
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    propertyId: "",
    renterId: "",
    startDate: "",
    endDate: "",
    monthlyRent: "",
    deposit: "",
  })

  useEffect(() => {
    fetchData()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchData = async () => {
    try {
      const [leasesRes, usersRes, propertiesRes] = await Promise.all([
        fetch("/api/leases"),
        fetch("/api/users"),
        fetch("/api/properties"),
      ])

      if (leasesRes.ok) {
        const data = await leasesRes.json()
        setLeases(data)
      }

      if (usersRes.ok) {
        const data = await usersRes.json()
        setUsers(data.filter((u: User) => u.role === "RENTER" && u.approved))
      }

      if (propertiesRes.ok) {
        const data = await propertiesRes.json()
        setProperties(data)
        if (data.length > 0 && !formData.propertyId) {
          setFormData((prev) => ({ ...prev, propertyId: data[0].id }))
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const response = await fetch("/api/leases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          monthlyRent: parseFloat(formData.monthlyRent),
          deposit: formData.deposit ? parseFloat(formData.deposit) : undefined,
        }),
      })

      if (response.ok) {
        await fetchData()
        setShowForm(false)
        setFormData({
          propertyId: properties[0]?.id || "",
          renterId: "",
          startDate: "",
          endDate: "",
          monthlyRent: "",
          deposit: "",
        })
      }
    } catch (error) {
      console.error("Error creating lease:", error)
    }
  }

  const updateLease = async (leaseId: string, updates: { isActive?: boolean; endDate?: string }) => {
    try {
      const response = await fetch(`/api/leases/${leaseId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      })

      if (response.ok) {
        await fetchData()
      }
    } catch (error) {
      console.error("Error updating lease:", error)
    }
  }

  const handleEndLease = (leaseId: string) => {
    if (confirm(tCommon('confirmDelete'))) {
      updateLease(leaseId, {
        isActive: false,
        endDate: new Date().toISOString().split("T")[0],
      })
    }
  }

  const canManageLeases = session?.user.role === "ADMIN"

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('title')}</h1>
          <p className="text-gray-600">Manage rental agreements</p>
        </div>
        {canManageLeases && (
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            {t('addLease')}
          </Button>
        )}
      </div>

      {showForm && canManageLeases && (
        <Card>
          <CardHeader>
            <CardTitle>{t('addLease')}</CardTitle>
            <CardDescription>{t('leaseDetails')}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">{t('property')}</label>
                  <select
                    value={formData.propertyId}
                    onChange={(e) => setFormData({ ...formData, propertyId: e.target.value })}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    required
                  >
                    {properties.map((property) => (
                      <option key={property.id} value={property.id}>
                        {property.address}, {property.city}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">{t('tenant')}</label>
                  <select
                    value={formData.renterId}
                    onChange={(e) => setFormData({ ...formData, renterId: e.target.value })}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    required
                  >
                    <option value="">Select a renter</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name || user.email}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">{t('startDate')}</label>
                  <Input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">{t('endDate')}</label>
                  <Input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">{t('monthlyRent')}</label>
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
              <div className="flex gap-2">
                <Button type="submit">{t('addLease')}</Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
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
              <TableHead>{t('property')}</TableHead>
              <TableHead>{t('tenant')}</TableHead>
              <TableHead>{t('startDate')}</TableHead>
              <TableHead>{t('monthlyRent')}</TableHead>
              <TableHead>{t('status')}</TableHead>
              {canManageLeases && <TableHead>{tCommon('actions')}</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {leases.map((lease) => (
              <TableRow key={lease.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{lease.property.address}</div>
                    <div className="text-sm text-gray-600">{lease.property.city}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{lease.renter.name || "N/A"}</div>
                    <div className="text-sm text-gray-600">{lease.renter.email}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <div>{formatDate(lease.startDate)}</div>
                    {lease.endDate && (
                      <div className="text-sm text-gray-600">{formatDate(lease.endDate)}</div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="font-medium">
                  {formatCurrency(lease.monthlyRent)}/month
                </TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded text-xs ${
                    lease.isActive
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}>
                    {lease.isActive ? t('active') : t('terminated')}
                  </span>
                </TableCell>
                {canManageLeases && (
                  <TableCell>
                    {lease.isActive && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEndLease(lease.id)}
                      >
                        <X className="h-4 w-4" />
                        End Lease
                      </Button>
                    )}
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
