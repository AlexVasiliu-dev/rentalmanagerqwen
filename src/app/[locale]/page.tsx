import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Home, Users, FileText, Shield, ArrowRight } from "lucide-react"
import { getTranslations } from 'next-intl/server';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { LocaleLink } from '@/components/LocaleLink';
import { GDPRCookieNotice } from '@/components/GDPRCookieNotice';

export default async function HomePage() {
  const t = await getTranslations('home');

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <LocaleLink href="/" className="flex items-center gap-2">
            <Home className="h-6 w-6 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">RentManager</span>
          </LocaleLink>
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <LocaleLink href="/auth/signin">
              <Button variant="ghost">{t('signIn')}</Button>
            </LocaleLink>
            <LocaleLink href="/auth/register">
              <Button>{t('startFreeTrial')}</Button>
            </LocaleLink>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          {t('heroTitle')}
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          {t('heroDescription')}
        </p>
        <div className="flex justify-center gap-4">
          <LocaleLink href="/auth/register">
            <Button size="lg" className="gap-2">
              {t('startFreeTrial')} <ArrowRight className="h-4 w-4" />
            </Button>
          </LocaleLink>
          <LocaleLink href="/auth/signin">
            <Button size="lg" variant="outline">
              {t('signIn')}
            </Button>
          </LocaleLink>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">{t('featuresTitle')}</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader>
              <Shield className="h-10 w-10 text-blue-600 mb-2" />
              <CardTitle>{t('roleBasedAccess')}</CardTitle>
              <CardDescription>
                {t('roleBasedAccessDescription')}
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <FileText className="h-10 w-10 text-blue-600 mb-2" />
              <CardTitle>{t('smartMeterReadings')}</CardTitle>
              <CardDescription>
                {t('smartMeterReadingsDescription')}
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Users className="h-10 w-10 text-blue-600 mb-2" />
              <CardTitle>{t('renterManagement')}</CardTitle>
              <CardDescription>
                {t('renterManagementDescription')}
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Home className="h-10 w-10 text-blue-600 mb-2" />
              <CardTitle>{t('propertyTracking')}</CardTitle>
              <CardDescription>
                {t('propertyTrackingDescription')}
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">{t('howItWorksTitle')}</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold mb-2">{t('step1Title')}</h3>
              <p className="text-gray-600">
                {t('step1Description')}
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold mb-2">{t('step2Title')}</h3>
              <p className="text-gray-600">
                {t('step2Description')}
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold mb-2">{t('step3Title')}</h3>
              <p className="text-gray-600">
                {t('step3Description')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400">
            {t('footerText')}
          </p>
        </div>
      </footer>

      {/* GDPR Cookie Notice */}
      <GDPRCookieNotice />
    </div>
  )
}
