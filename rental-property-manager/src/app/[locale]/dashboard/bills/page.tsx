"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useTranslations } from 'next-intl';
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Plus, Check } from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/utils"

interface Bill {
  id: string
  type: string
  description: string | null
  amount: number
  currency: string
  paid: boolean
  periodStart: string
  periodEnd: string
  dueDate: string
  createdAt: string
  lease?: {
    property: {
      address: string
      city: string
    }
    renter?: {
      name: string
      email: string
    }
  }
}

export default function BillsPage() {
  const t = useTranslations('bills');
  const tCommon = useTranslations('common');
  const { data: session } = useSession()
  const [bills, setBills] = useState<Bill[]>([])
  const [showForm, setShowForm] = useState(false)
  const [filter, setFilter] = useState<"all" | "paid" | "unpaid">("all")
  const [formData, setFormData] = useState({
    type: "utilities",
    description: "",
    amount: "",
    periodStart: "",
    periodEnd: "",
    dueDate: "",
  })

  useEffect(() => {
    fetchBills()
  }, [])

  const fetchBills = async () => {
    try {
      const response = await fetch("/api/bills")
      if (response.ok) {
        const data = await response.json()
        setBills(data)
      }
    } catch (error) {
      console.error("Error fetching bills:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const response = await fetch("/api/bills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount),
        }),
      })

      if (response.ok) {
        await fetchBills()
        setShowForm(false)
        setFormData({
          type: "utilities",
          description: "",
          amount: "",
          periodStart: "",
          periodEnd: "",
          dueDate: "",
        })
      }
    } catch (error) {
      console.error("Error creating bill:", error)
    }
  }

  const markAsPaid = async (billId: string) => {
    try {
      const response = await fetch(`/api/bills/${billId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paid: true }),
      })

      if (response.ok) {
        await fetchBills()
      }
    } catch (error) {
      console.error("Error updating bill:", error)
    }
  }

  const filteredBills = bills.filter((bill) => {
    if (filter === "paid") return bill.paid
    if (filter === "unpaid") return !bill.paid
    return true
  })

  const totalUnpaid = bills
    .filter((b) => !b.paid)
    .reduce((sum, b) => sum + b.amount, 0)

  const canCreateBills = session?.user.role === "ADMIN" || session?.user.role === "MANAGER"

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {session?.user.role === "RENTER" ? "Facturile Mele" : t('title')}
          </h1>
          <p className="text-gray-600">
            {session?.user.role === "RENTER" 
              ? "Vezi facturile pentru chirie și utilități" 
              : "Gestionează facturile pentru chirie și utilități"}
          </p>
        </div>
        {canCreateBills && (
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            {t('addBill')}
          </Button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Unpaid</CardDescription>
            <CardTitle className="text-2xl text-red-600">{formatCurrency(totalUnpaid)}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Paid Bills</CardDescription>
            <CardTitle className="text-2xl text-green-600">
              {bills.filter((b) => b.paid).length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Pending Bills</CardDescription>
            <CardTitle className="text-2xl text-orange-600">
              {bills.filter((b) => !b.paid).length}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {showForm && canCreateBills && (
        <Card>
          <CardHeader>
            <CardTitle>{t('addBill')}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">{t('type')}</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    required
                  >
                    <option value="utilities">Utilities</option>
                    <option value="rent">Rent</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">{t('totalAmount')}</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">{t('period')}</label>
                  <Input
                    type="date"
                    value={formData.periodStart}
                    onChange={(e) => setFormData({ ...formData, periodStart: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">{t('period')}</label>
                  <Input
                    type="date"
                    value={formData.periodEnd}
                    onChange={(e) => setFormData({ ...formData, periodEnd: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">{t('dueDate')}</label>
                  <Input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">{tCommon('description')}</label>
                  <Input
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Optional description"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit">{t('addBill')}</Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  {tCommon('cancel')}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="flex gap-2">
        <Button
          variant={filter === "all" ? "default" : "outline"}
          onClick={() => setFilter("all")}
        >
          All Bills
        </Button>
        <Button
          variant={filter === "unpaid" ? "default" : "outline"}
          onClick={() => setFilter("unpaid")}
        >
          {t('unpaid')}
        </Button>
        <Button
          variant={filter === "paid" ? "default" : "outline"}
          onClick={() => setFilter("paid")}
        >
          {t('paid')}
        </Button>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('type')}</TableHead>
              <TableHead>{t('period')}</TableHead>
              <TableHead>{t('dueDate')}</TableHead>
              <TableHead>{t('totalAmount')}</TableHead>
              <TableHead>{t('paymentStatus')}</TableHead>
              {session?.user.role === "RENTER" && <TableHead>{tCommon('actions')}</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBills.map((bill) => (
              <TableRow key={bill.id}>
                <TableCell>
                  <div>
                    <div className="font-medium capitalize">{bill.type}</div>
                    {bill.description && (
                      <div className="text-sm text-gray-600">{bill.description}</div>
                    )}
                    {bill.lease && (
                      <div className="text-sm text-gray-600">
                        {bill.lease.property.address}, {bill.lease.property.city}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {formatDate(bill.periodStart)} - {formatDate(bill.periodEnd)}
                </TableCell>
                <TableCell>
                  <span className={new Date(bill.dueDate) < new Date() && !bill.paid ? "text-red-600 font-medium" : ""}>
                    {formatDate(bill.dueDate)}
                  </span>
                </TableCell>
                <TableCell className="font-medium">{formatCurrency(bill.amount)}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded text-xs ${
                    bill.paid
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}>
                    {bill.paid ? t('paid') : t('unpaid')}
                  </span>
                </TableCell>
                {session?.user.role === "RENTER" && (
                  <TableCell>
                    {!bill.paid && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => markAsPaid(bill.id)}
                      >
                        <Check className="h-4 w-4" />
                        Mark Paid
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
