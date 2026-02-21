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

export default function UsersPage() {
  const t = useTranslations('dashboard');
  const tCommon = useTranslations('common');
  const { data: session } = useSession()
  const [users, setUsers] = useState<User[]>([])
  const [filter, setFilter] = useState<"all" | "pending" | "active">("all")
  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    role: "RENTER" as "RENTER",
  })

  useEffect(() => {
    fetchUsers()
  }, [])

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
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          name: formData.name || undefined,
          role: "RENTER",
          approved: true,
          active: true,
        }),
      })

      if (response.ok) {
        await fetchUsers()
        setShowAddForm(false)
        setFormData({ email: "", password: "", name: "", role: "RENTER" })
      } else {
        const error = await response.json()
        alert(error.error || "Failed to create tenant")
      }
    } catch (error) {
      console.error("Error creating tenant:", error)
      alert("Failed to create tenant")
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
            <p className="text-gray-600">Only admins can manage users.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('users')}</h1>
          <p className="text-gray-600">Manage user accounts and approvals</p>
        </div>
        <Button onClick={() => setShowAddForm(true)}>
          <UserPlus className="h-4 w-4 mr-2" />
          Add Tenant
        </Button>
      </div>

      {/* Add Tenant Form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Create New Tenant</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAddForm(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddTenant} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Email</label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="tenant@example.com"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Name</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Password</label>
                  <Input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Min 6 characters"
                    required
                    minLength={6}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Create Tenant Profile
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowAddForm(false)
                    setFormData({ email: "", password: "", name: "", role: "RENTER" })
                  }}
                >
                  Cancel
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
          All Users
        </Button>
        <Button
          variant={filter === "pending" ? "default" : "outline"}
          onClick={() => setFilter("pending")}
        >
          Pending Approval
        </Button>
        <Button
          variant={filter === "active" ? "default" : "outline"}
          onClick={() => setFilter("active")}
        >
          Active
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
                      {user.approved ? "Approved" : "Pending"}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      user.active
                        ? "bg-blue-100 text-blue-800"
                        : "bg-red-100 text-red-800"
                    }`}>
                      {user.active ? "Active" : "Inactive"}
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
                          title="Approve"
                        >
                          <Check className="h-4 w-4 text-green-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleReject(user.id)}
                          title="Reject"
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
                            title="Deactivate"
                          >
                            <UserX className="h-4 w-4 text-orange-600" />
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleActivate(user.id)}
                            title="Activate"
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
