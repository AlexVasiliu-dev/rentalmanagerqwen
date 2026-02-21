"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useTranslations } from 'next-intl';
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Check, X, UserCheck, UserX, Plus, UserPlus } from "lucide-react"

interface User {
  id: string
  email: string
  name: string | null
  role: "ADMIN" | "MANAGER" | "RENTER"
  approved: boolean
  active: boolean
  createdAt: string
  _count: {
    rentedProperties: number
  }
}

interface Property {
  id: string
  address: string
  city: string
  monthlyRent: number
  deposit: number | null
  available: boolean
}

export default function UsersPage() {
  const t = useTranslations('dashboard');
  const tCommon = useTranslations('common');
  const tRoles = useTranslations('roles');
  const { data: session } = useSession()
  const [users, setUsers] = useState<User[]>([])
  const [filter, setFilter] = useState<"all" | "pending" | "active">("all")
  const [showAddForm, setShowAddForm] = useState(false)
  const [properties, setProperties] = useState<Property[]>([])
  const [selectedProperty, setSelectedProperty] = useState<string>("")
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    role: "RENTER" as "RENTER",
    startDate: "",
    endDate: "",
    monthlyRent: "",
    deposit: "",
  })

  useEffect(() => {
    fetchUsers()
    fetchProperties()
  }, [])

  const fetchProperties = async () => {
    try {
      const response = await fetch("/api/properties?available=true")
      if (response.ok) {
        const data = await response.json()
        setProperties(data)
      }
    } catch (error) {
      console.error("Error fetching properties:", error)
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/users")
      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      }
    } catch (error) {
      console.error("Error fetching users:", error)
    }
  }

  const updateUser = async (userId: string, updates: { approved?: boolean; active?: boolean }) => {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      })

      if (response.ok) {
        await fetchUsers()
      }
    } catch (error) {
      console.error("Error updating user:", error)
    }
  }

  const handleApprove = (userId: string) => {
    updateUser(userId, { approved: true })
  }

  const handleReject = (userId: string) => {
    updateUser(userId, { approved: false })
  }

  const handleActivate = (userId: string) => {
    updateUser(userId, { active: true })
  }

  const handleDeactivate = (userId: string) => {
    updateUser(userId, { active: false })
  }

  const handleAddTenant = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const payload: Record<string, unknown> = {
        email: formData.email,
        password: formData.password,
        name: formData.name || undefined,
        role: "RENTER",
        approved: true,
        active: true,
      }

      // Add lease information if property is selected
      if (selectedProperty && formData.startDate) {
        payload.propertyId = selectedProperty
        payload.startDate = formData.startDate
        if (formData.endDate) payload.endDate = formData.endDate
        if (formData.monthlyRent) payload.monthlyRent = parseFloat(formData.monthlyRent)
        if (formData.deposit) payload.deposit = parseFloat(formData.deposit)
      }

      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        const result = await response.json()
        await fetchUsers()
        await fetchProperties()
        // Redirect to contracts page with success message
        const leaseId = result.leaseId || ''
        if (leaseId) {
          // Redirect to contract view page
          window.location.href = `/${locale}/dashboard/contracts/${leaseId}?success=tenant-added`
        } else {
          setShowAddForm(false)
          resetForm()
          alert("Chiriaș creat fără contract")
        }
      } else {
        const error = await response.json()
        alert(error.error || "Eroare la crearea chiriașului")
      }
    } catch (error) {
      console.error("Error creating tenant:", error)
      alert("Eroare la crearea chiriașului")
    }
  }

  const resetForm = () => {
    setShowAddForm(false)
    setSelectedProperty("")
    setFormData({ email: "", password: "", name: "", role: "RENTER", startDate: "", endDate: "", monthlyRent: "", deposit: "" })
  }

  const handlePropertyChange = (propertyId: string) => {
    setSelectedProperty(propertyId)
    const property = properties.find(p => p.id === propertyId)
    if (property) {
      setFormData({
        ...formData,
        monthlyRent: property.monthlyRent.toString(),
        deposit: property.deposit?.toString() || "",
      })
    }
  }

  const filteredUsers = users.filter((user) => {
    if (filter === "pending") return !user.approved
    if (filter === "active") return user.active && user.approved
    return true
  })

  if (session?.user.role !== "ADMIN") {
    return (
      <div>
        <h1 className="text-3xl font-bold mb-6">{t('users')}</h1>
        <Card>
          <CardContent className="py-8">
            <p className="text-gray-600">Doar administratorii pot gestiona utilizatorii.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Utilizatori</h1>
          <p className="text-gray-600">Gestionează conturile utilizatorilor și aprobările</p>
        </div>
        <Button onClick={() => setShowAddForm(true)}>
          <UserPlus className="h-4 w-4 mr-2" />
          Adaugă Chiriaș
        </Button>
      </div>

      {/* Add Tenant Form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Adaugă Chiriaș</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={resetForm}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddTenant} className="space-y-4">
              <div className="space-y-4">
                <h3 className="font-semibold text-sm text-gray-600">Informații Chiriaș</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Email *</label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="chirias@exemplu.ro"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Nume</label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Ion Popescu"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Parolă *</label>
                    <Input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Minim 6 caractere"
                      required
                      minLength={6}
                    />
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="space-y-4">
                  <h3 className="font-semibold text-sm text-gray-600">Informații Contract (Opțional)</h3>
                  <p className="text-xs text-gray-500">Selectează o proprietate pentru a crea un contract pentru acest chiriaș</p>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-1 block">Proprietate</label>
                      <select
                        value={selectedProperty}
                        onChange={(e) => handlePropertyChange(e.target.value)}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      >
                        <option value="">-- Selectează Proprietatea --</option>
                        {properties.map((property) => (
                          <option key={property.id} value={property.id}>
                            {property.address}, {property.city}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Data Început *</label>
                      <Input
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        required={!!selectedProperty}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Data Sfârșit</label>
                      <Input
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Chirie Lunară (RON)</label>
                      <Input
                        type="number"
                        value={formData.monthlyRent}
                        onChange={(e) => setFormData({ ...formData, monthlyRent: e.target.value })}
                        placeholder="Completat automat din proprietate"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Garanție (RON)</label>
                      <Input
                        type="number"
                        value={formData.deposit}
                        onChange={(e) => setFormData({ ...formData, deposit: e.target.value })}
                        placeholder="Completat automat din proprietate"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Creează Profil Chiriaș
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForm}
                >
                  Anulează
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-2">
        <Button
          variant={filter === "all" ? "default" : "outline"}
          onClick={() => setFilter("all")}
        >
          Toți Utilizatorii
        </Button>
        <Button
          variant={filter === "pending" ? "default" : "outline"}
          onClick={() => setFilter("pending")}
        >
          În Așteptare
        </Button>
        <Button
          variant={filter === "active" ? "default" : "outline"}
          onClick={() => setFilter("active")}
        >
          Activi
        </Button>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>{tCommon('role')}</TableHead>
              <TableHead>{tCommon('status')}</TableHead>
              <TableHead>Properties</TableHead>
              <TableHead>{tCommon('created')}</TableHead>
              <TableHead>{tCommon('actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{user.name || "N/A"}</div>
                    <div className="text-sm text-gray-600">{user.email}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-800">
                    {user.role}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <span className={`px-2 py-1 rounded text-xs ${
                      user.approved
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}>
                      {user.approved ? "Aprobat" : "În Așteptare"}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      user.active
                        ? "bg-blue-100 text-blue-800"
                        : "bg-red-100 text-red-800"
                    }`}>
                      {user.active ? "Activ" : "Inactiv"}
                    </span>
                  </div>
                </TableCell>
                <TableCell>{user._count.rentedProperties}</TableCell>
                <TableCell>
                  {new Date(user.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    {!user.approved ? (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleApprove(user.id)}
                          title="Aprobă"
                        >
                          <Check className="h-4 w-4 text-green-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleReject(user.id)}
                          title="Respinge"
                        >
                          <X className="h-4 w-4 text-red-600" />
                        </Button>
                      </>
                    ) : (
                      <>
                        {user.active ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeactivate(user.id)}
                            title="Dezactivează"
                          >
                            <UserX className="h-4 w-4 text-orange-600" />
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleActivate(user.id)}
                            title="Activează"
                          >
                            <UserCheck className="h-4 w-4 text-green-600" />
                          </Button>
                        )}
                      </>
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
