import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Home } from "lucide-react"
import { getTranslations } from 'next-intl/server';

export default async function UnauthorizedPage() {
  const t = await getTranslations('unauthorized');
  const tDashboard = await getTranslations('dashboard');
  const tNavigation = await getTranslations('navigation');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Home className="h-12 w-12 text-orange-600" />
          </div>
          <CardTitle className="text-2xl">{t('title')}</CardTitle>
          <CardDescription>
            {t('message')}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <Link href="/dashboard">
            <Button className="w-full">{tDashboard('title')}</Button>
          </Link>
          <Link href="/">
            <Button variant="outline" className="w-full">{tNavigation('home')}</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
