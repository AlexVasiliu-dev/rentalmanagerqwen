"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { TrendingUp, Users, Building, Eye, MousePointer, Clock, Calendar } from "lucide-react"
import { LocaleLink } from '@/components/LocaleLink'

interface Analytics {
  pageViews: {
    page: string
    views: number
    uniqueVisitors: number
    avgTimeOnPage: string
  }[]
  topReferrers: {
    source: string
    visits: number
  }[]
  userActivity: {
    date: string
    activeUsers: number
    newRegistrations: number
  }[]
  popularFeatures: {
    feature: string
    usage: number
  }[]
}

export default function SuperadminAnalytics() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/ro/auth/signin")
      return
    }

    if (session?.user.role !== "SUPERADMIN") {
      router.push("/ro/dashboard")
      return
    }

    fetchAnalytics()
  }, [session, status])

  const fetchAnalytics = async () => {
    try {
      const response = await fetch("/api/superadmin/analytics")
      if (response.ok) {
        const data = await response.json()
        setAnalytics(data)
      }
    } catch (error) {
      console.error("Error fetching analytics:", error)
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics Website</h1>
          <p className="text-gray-600">Statistici și metrici de utilizare</p>
        </div>
        <LocaleLink href="/ro/superadmin/dashboard">
          <Button variant="outline">Înapoi la Dashboard</Button>
        </LocaleLink>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Vizualizări</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics?.pageViews.reduce((sum, p) => sum + p.views, 0) || 0}
            </div>
            <p className="text-xs text-gray-600 mt-1">
              În ultimele 30 zile
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vizitatori Unici</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics?.pageViews.reduce((sum, p) => sum + p.uniqueVisitors, 0) || 0}
            </div>
            <p className="text-xs text-gray-600 mt-1">
              Utilizatori distincți
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Timp Mediu</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3:24</div>
            <p className="text-xs text-gray-600 mt-1">
              Minute per sesiune
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rată de Convertire</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12.5%</div>
            <p className="text-xs text-gray-600 mt-1">
              Vizitatori → Înregistrări
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Page Views Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Vizualizări Pagini
          </CardTitle>
          <CardDescription>
            Cele mai accesate pagini ale platformei
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pagină</TableHead>
                <TableHead>Vizualizări</TableHead>
                <TableHead>Vizitatori Unici</TableHead>
                <TableHead>Timp Mediu</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {analytics?.pageViews.map((page) => (
                <TableRow key={page.page}>
                  <TableCell className="font-medium">{page.page}</TableCell>
                  <TableCell>{page.views}</TableCell>
                  <TableCell>{page.uniqueVisitors}</TableCell>
                  <TableCell>{page.avgTimeOnPage}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Top Referrers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MousePointer className="h-5 w-5" />
            Surse de Trafic
          </CardTitle>
          <CardDescription>
            De unde vin vizitatorii
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sursă</TableHead>
                <TableHead>Vizite</TableHead>
                <TableHead>Procent</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {analytics?.topReferrers.map((referrer) => (
                <TableRow key={referrer.source}>
                  <TableCell className="font-medium">{referrer.source}</TableCell>
                  <TableCell>{referrer.visits}</TableCell>
                  <TableCell>
                    {analytics?.topReferrers.reduce((sum, r) => sum + r.visits, 0) 
                      ? Math.round((referrer.visits / analytics.topReferrers.reduce((sum, r) => sum + r.visits, 0)) * 100)
                      : 0}%
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Popular Features */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Funcționalități Populare
          </CardTitle>
          <CardDescription>
            Cele mai folosite funcții ale platformei
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Funcționalitate</TableHead>
                <TableHead>Utilizări</TableHead>
                <TableHead>Procent din Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {analytics?.popularFeatures.map((feature) => (
                <TableRow key={feature.feature}>
                  <TableCell className="font-medium">{feature.feature}</TableCell>
                  <TableCell>{feature.usage}</TableCell>
                  <TableCell>
                    {analytics?.popularFeatures.reduce((sum, f) => sum + f.usage, 0)
                      ? Math.round((feature.usage / analytics.popularFeatures.reduce((sum, f) => sum + f.usage, 0)) * 100)
                      : 0}%
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* User Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Activitate Utilizatori (Ultimele 7 Zile)
          </CardTitle>
          <CardDescription>
            Utilizatori activi și înregistrări noi
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Utilizatori Activi</TableHead>
                <TableHead>Înregistrări Noi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {analytics?.userActivity.map((activity) => (
                <TableRow key={activity.date}>
                  <TableCell className="font-medium">
                    {new Date(activity.date).toLocaleDateString('ro-RO')}
                  </TableCell>
                  <TableCell>{activity.activeUsers}</TableCell>
                  <TableCell>{activity.newRegistrations}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
