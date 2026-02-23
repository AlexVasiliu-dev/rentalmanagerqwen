"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CreditCard, Download, Calendar, CheckCircle, XCircle } from "lucide-react"
import { LocaleLink } from '@/components/LocaleLink'

interface Invoice {
  id: string
  companySlug: string
  companyName: string
  subscriptionType: string
  amount: number
  currency: string
  status: string
  startDate: string
  endDate: string
  createdAt: string
  paidAt: string | null
}

export default function SuperadminInvoices() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/ro/auth/signin")
      return
    }

    if (session?.user.role !== "SUPERADMIN") {
      router.push("/ro/dashboard")
      return
    }

    fetchInvoices()
  }, [session, status])

  const fetchInvoices = async () => {
    try {
      const response = await fetch("/api/superadmin/invoices")
      if (response.ok) {
        const data = await response.json()
        setInvoices(data)
      }
    } catch (error) {
      console.error("Error fetching invoices:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredInvoices = invoices.filter(invoice =>
    invoice.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.companySlug?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Se încarcă...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Facturi Abonamente</h1>
          <p className="text-gray-600">Toate abonamentele companiilor înregistrate</p>
        </div>
        <LocaleLink href="/ro/superadmin/dashboard">
          <Button variant="outline">Înapoi la Dashboard</Button>
        </LocaleLink>
      </div>

      {/* Invoices Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Lista Abonamente
              </CardTitle>
              <CardDescription>
                Istoric complet al abonamentelor tuturor companiilor
              </CardDescription>
            </div>
            <Input
              placeholder="Caută companie..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Companie</TableHead>
                <TableHead>Slug Privat</TableHead>
                <TableHead>Tip Abonament</TableHead>
                <TableHead>Sumă</TableHead>
                <TableHead>Data Început</TableHead>
                <TableHead>Data Expirare</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data Înscrierii</TableHead>
                <TableHead>Acțiuni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">
                    {invoice.companyName}
                  </TableCell>
                  <TableCell>
                    <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                      /{invoice.companySlug}
                    </code>
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded text-xs capitalize ${
                      invoice.subscriptionType === "yearly"
                        ? "bg-purple-100 text-purple-800"
                        : invoice.subscriptionType === "monthly"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-gray-100 text-gray-800"
                    }`}>
                      {invoice.subscriptionType === "yearly" ? "Anual" :
                       invoice.subscriptionType === "monthly" ? "Lunar" :
                       "Free"}
                    </span>
                  </TableCell>
                  <TableCell>
                    {invoice.status === "free" ? (
                      <span className="text-gray-500">Free</span>
                    ) : (
                      <span className="font-medium">
                        {invoice.amount} {invoice.currency}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      {new Date(invoice.startDate).toLocaleDateString('ro-RO')}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      {new Date(invoice.endDate).toLocaleDateString('ro-RO')}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {invoice.status === "active" ? (
                        <>
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-green-800">Activ</span>
                        </>
                      ) : invoice.status === "cancelled" ? (
                        <>
                          <XCircle className="h-4 w-4 text-yellow-600" />
                          <span className="text-yellow-800">Anulat</span>
                        </>
                      ) : invoice.status === "expired" ? (
                        <>
                          <XCircle className="h-4 w-4 text-red-600" />
                          <span className="text-red-800">Expirat</span>
                        </>
                      ) : (
                        <span className="text-gray-500">Free</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {new Date(invoice.createdAt).toLocaleDateString('ro-RO')}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <LocaleLink href={`/ro/superadmin/company/${invoice.companySlug}`}>
                        <Button variant="ghost" size="sm">
                          Vezi Detalii
                        </Button>
                      </LocaleLink>
                      {invoice.status !== "free" && (
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredInvoices.length === 0 && (
            <p className="text-center text-gray-500 py-8">
              Nu există facturi de afișat.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Abonamente</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{invoices.length}</div>
            <p className="text-xs text-gray-600 mt-1">
              Companii înregistrate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Abonamente Active</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {invoices.filter(i => i.status === "active").length}
            </div>
            <p className="text-xs text-gray-600 mt-1">
              Plătite la zi
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Venituri Totale</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {invoices
                .filter(i => i.status !== "free")
                .reduce((sum, i) => sum + i.amount, 0)} {invoices[0]?.currency || "EUR"}
            </div>
            <p className="text-xs text-gray-600 mt-1">
              Din abonamente active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expiră Curând</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {invoices.filter(i => {
                if (!i.endDate || i.status !== "active") return false
                const end = new Date(i.endDate)
                const now = new Date()
                const daysUntilExpiry = (end.getTime() - now.getTime()) / (1000 * 3600 * 24)
                return daysUntilExpiry <= 30 && daysUntilExpiry > 0
              }).length}
            </div>
            <p className="text-xs text-gray-600 mt-1">
              În următoarele 30 zile
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
