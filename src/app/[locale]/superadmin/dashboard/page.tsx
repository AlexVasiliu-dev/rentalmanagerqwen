"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Building, Users, FileText, TrendingUp, Activity, Shield, Server, AlertTriangle, LogOut, Calendar, CreditCard } from "lucide-react"
import { LocaleLink } from '@/components/LocaleLink'

interface Company {
  id: string
  ownerSlug: string
  companyName: string
  ownerName: string
  ownerEmail: string
  propertiesCount: number
  tenantsCount: number
  subscriptionType: string
  subscriptionStatus: string
  subscriptionStart: string | null
  subscriptionEnd: string | null
  createdAt: string
}

interface SystemMetrics {
  uptime: string
  totalUsers: number
  activeUsers: number
  failedLogins: number
  errorsLast24h: number
  databaseStatus: string
  apiStatus: string
}

export default function SuperadminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [companies, setCompanies] = useState<Company[]>([])
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null)
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

    if (session?.user.role === "SUPERADMIN") {
      fetchCompanies()
      fetchMetrics()
    }
  }, [session, status])

  const fetchCompanies = async () => {
    try {
      const response = await fetch("/api/superadmin/companies")
      if (response.ok) {
        const data = await response.json()
        setCompanies(data)
      }
    } catch (error) {
      console.error("Error fetching companies:", error)
    }
  }

  const fetchMetrics = async () => {
    try {
      const response = await fetch("/api/superadmin/metrics")
      if (response.ok) {
        const data = await response.json()
        setMetrics(data)
      }
    } catch (error) {
      console.error("Error fetching metrics:", error)
    } finally {
      setLoading(false)
    }
  }

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

  const filteredCompanies = companies.filter(company =>
    company.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.ownerSlug?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.ownerEmail?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Panou Super Administrator</h1>
          <p className="text-gray-600">Administrare companii, abonamente și metrici sistem</p>
        </div>
        <div className="flex gap-2">
          <LocaleLink href="/ro/superadmin/invoices">
            <Button variant="outline">
              <CreditCard className="h-4 w-4 mr-2" />
              Facturi
            </Button>
          </LocaleLink>
          <LocaleLink href="/ro/superadmin/analytics">
            <Button variant="outline">
              <TrendingUp className="h-4 w-4 mr-2" />
              Analytics
            </Button>
          </LocaleLink>
        </div>
      </div>

      {/* Companies Overview Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Companii Înregistrate
              </CardTitle>
              <CardDescription>
                Sumar al tuturor afacerilor, proprietăților și chiriașilor
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
                <TableHead>Proprietăți</TableHead>
                <TableHead>Chiriași Activi</TableHead>
                <TableHead>Abonament</TableHead>
                <TableHead>Expiră La</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Acțiuni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCompanies.map((company) => (
                <TableRow key={company.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {company.companyName || company.ownerSlug}
                      </div>
                      <div className="text-sm text-gray-500 font-mono">
                        /{company.ownerSlug}
                      </div>
                      <div className="text-xs text-gray-400">
                        {company.ownerEmail}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-gray-500" />
                      {company.propertiesCount}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-gray-500" />
                      {company.tenantsCount}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded text-xs capitalize ${
                      company.subscriptionType === "yearly"
                        ? "bg-purple-100 text-purple-800"
                        : company.subscriptionType === "monthly"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-gray-100 text-gray-800"
                    }`}>
                      {company.subscriptionType === "yearly" ? "Anual (250 EUR)" :
                       company.subscriptionType === "monthly" ? "Lunar (50 EUR)" :
                       "Free"}
                    </span>
                  </TableCell>
                  <TableCell>
                    {company.subscriptionEnd ? (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        {new Date(company.subscriptionEnd).toLocaleDateString('ro-RO')}
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded text-xs ${
                      company.subscriptionStatus === "active"
                        ? "bg-green-100 text-green-800"
                        : company.subscriptionStatus === "free"
                        ? "bg-gray-100 text-gray-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}>
                      {company.subscriptionStatus === "active" ? "Activ" :
                       company.subscriptionStatus === "free" ? "Free" :
                       "Expirat"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <LocaleLink href={`/ro/superadmin/company/${company.ownerSlug}`}>
                      <Button variant="ghost" size="sm">
                        Vezi Detalii
                      </Button>
                    </LocaleLink>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredCompanies.length === 0 && (
            <p className="text-center text-gray-500 py-8">
              Nu există companii de afișat.
            </p>
          )}
        </CardContent>
      </Card>

      {/* System Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            Metrici Sistem
          </CardTitle>
          <CardDescription>
            Status și performanță platformă
          </CardDescription>
        </CardHeader>
        <CardContent>
          {metrics ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Metrică</TableHead>
                  <TableHead>Valoare</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Uptime</TableCell>
                  <TableCell>{metrics.uptime}</TableCell>
                  <TableCell>
                    <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-800">
                      Online
                    </span>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Total Utilizatori</TableCell>
                  <TableCell>{metrics.totalUsers}</TableCell>
                  <TableCell>-</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Utilizatori Activi</TableCell>
                  <TableCell>{metrics.activeUsers}</TableCell>
                  <TableCell>
                    <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-800">
                      {Math.round((metrics.activeUsers / metrics.totalUsers) * 100)}% din total
                    </span>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Autentificări Eșuate</TableCell>
                  <TableCell>{metrics.failedLogins}</TableCell>
                  <TableCell>
                    {metrics.failedLogins > 10 ? (
                      <span className="px-2 py-1 rounded text-xs bg-red-100 text-red-800">
                        Ridicat
                      </span>
                    ) : (
                      <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-800">
                        Normal
                      </span>
                    )}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Erori (24h)</TableCell>
                  <TableCell>{metrics.errorsLast24h}</TableCell>
                  <TableCell>
                    {metrics.errorsLast24h > 5 ? (
                      <span className="px-2 py-1 rounded text-xs bg-yellow-100 text-yellow-800">
                        Atenție
                      </span>
                    ) : (
                      <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-800">
                        Normal
                      </span>
                    )}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Bază de Date</TableCell>
                  <TableCell>PostgreSQL</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded text-xs ${
                      metrics.databaseStatus === "connected"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}>
                      {metrics.databaseStatus === "connected" ? "Conectat" : "Deconectat"}
                    </span>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">API Status</TableCell>
                  <TableCell>REST API</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded text-xs ${
                      metrics.apiStatus === "operational"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}>
                      {metrics.apiStatus === "operational" ? "Operațional" : "Degradat"}
                    </span>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          ) : (
            <p className="text-gray-500 text-center py-8">Se încarcă metricile...</p>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Acțiuni Rapide</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <LocaleLink href="/ro/dashboard">
              <Button variant="outline">
                <Building className="h-4 w-4 mr-2" />
                Dashboard Principal
              </Button>
            </LocaleLink>
            <LocaleLink href="/ro/dashboard/users">
              <Button variant="outline">
                <Users className="h-4 w-4 mr-2" />
                Utilizatori
              </Button>
            </LocaleLink>
            <LocaleLink href="/ro/dashboard/leases">
              <Button variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                Contracte
              </Button>
            </LocaleLink>
            <LocaleLink href="/ro/superadmin/invoices">
              <Button variant="outline">
                <CreditCard className="h-4 w-4 mr-2" />
                Facturi Abonamente
              </Button>
            </LocaleLink>
            <LocaleLink href="/ro/superadmin/analytics">
              <Button variant="outline">
                <TrendingUp className="h-4 w-4 mr-2" />
                Analytics Website
              </Button>
            </LocaleLink>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
