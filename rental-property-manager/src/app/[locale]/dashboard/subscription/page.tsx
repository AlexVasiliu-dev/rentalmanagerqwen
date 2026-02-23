"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useTranslations } from 'next-intl';
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Check, X, Loader2, CreditCard, Gift, TrendingUp, Calendar, Clock } from "lucide-react"

interface SubscriptionStatus {
  hasSubscription: boolean
  status: string
  paidProperties?: number
  coveredProperties?: number
  propertiesCount: number
  remainingSlots?: number
  currentPeriodEnd?: string
  currentPeriodStart?: string
  pricePerProperty?: number
  currency?: string
  stripeCustomerId?: string
  trialProperties?: number
  message?: string
  subscriptionType?: string
  amountPaid?: number
  nextPaymentDue?: string
}

export default function SubscriptionPage() {
  const t = useTranslations('subscription');
  const tCommon = useTranslations('common');
  const { data: session } = useSession()
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [propertiesCount, setPropertiesCount] = useState(1)
  const [progress, setProgress] = useState(0)

  // Pricing constants in EUR
  const PRICE_PER_PROPERTY = 50 // EUR per year
  const TRIAL_DAYS = 15
  const BOGO_MULTIPLIER = 2 // Buy 1 Get 1 Free

  useEffect(() => {
    fetchSubscription()
  }, [])

  const fetchSubscription = async () => {
    try {
      const response = await fetch("/api/subscription")
      if (response.ok) {
        const data = await response.json()
        setSubscription(data)
        calculateProgress(data)
      }
    } catch (error) {
      console.error("Error fetching subscription:", error)
    } finally {
      setLoading(false)
    }
  }

  const calculateProgress = (data: SubscriptionStatus) => {
    if (!data.currentPeriodStart || !data.currentPeriodEnd) {
      setProgress(0)
      return
    }

    const start = new Date(data.currentPeriodStart).getTime()
    const end = new Date(data.currentPeriodEnd).getTime()
    const now = Date.now()

    const total = end - start
    const elapsed = now - start
    const percentage = Math.min(100, Math.max(0, (elapsed / total) * 100))

    setProgress(Math.round(percentage))
  }

  const calculatePrice = (count: number) => {
    const paidProperties = Math.ceil(count / BOGO_MULTIPLIER)
    return paidProperties * PRICE_PER_PROPERTY
  }

  const handleCheckout = async () => {
    setCheckoutLoading(true)
    try {
      const response = await fetch("/api/subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ propertiesCount }),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.checkoutUrl) {
          window.location.href = data.checkoutUrl
        } else {
          setMessage({ type: "success", text: "Redirecționare către procesatorul de plată..." })
        }
      } else {
        const error = await response.json()
        setMessage({ type: "error", text: error.error || "Eroare la procesarea plății" })
      }
    } catch (error) {
      console.error("Error creating checkout:", error)
      setMessage({ type: "error", text: "A apărut o eroare neașteptată" })
    } finally {
      setCheckoutLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="mt-4 text-gray-600">Se actualizează...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Abonament</h1>
        <p className="text-gray-600">Gestionează abonamentul și proprietățile tale</p>
      </div>

      {message && (
        <div className={`p-4 rounded-md ${
          message.type === "success" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
        }`}>
          {message.text}
        </div>
      )}

      {/* Subscription Status */}
      {subscription && (
        <Card>
          <CardHeader>
            <CardTitle>{t('title')}</CardTitle>
            <CardDescription>
              {subscription.hasSubscription
                ? "Gestionează abonamentul tău"
                : "Începe să îți gestionezi proprietățile"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* FREE TIER - 1 Property */}
            {(!subscription.hasSubscription || subscription.status === "FREE" || subscription.subscriptionType === "free") && (
              <div className="space-y-6">
                <Card className="bg-green-50 border-green-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-green-800">
                      <Gift className="h-5 w-5" />
                      Abonament Gratuit
                    </CardTitle>
                    <CardDescription className="text-green-700">
                      1 proprietate inclusă gratuit
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Proprietăți acoperite:</span>
                        <span className="font-semibold text-green-700">1</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Expiră la:</span>
                        <span className="font-semibold text-green-700">
                          {subscription.currentPeriodEnd
                            ? new Date(subscription.currentPeriodEnd).toLocaleDateString('ro-RO')
                            : 'Nedeterminat'}
                        </span>
                      </div>
                      {subscription.propertiesCount && subscription.propertiesCount >= 1 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Proprietăți înregistrate:</span>
                          <span className="font-semibold">{subscription.propertiesCount}</span>
                        </div>
                      )}
                      {/* Progress Bar */}
                      {subscription.currentPeriodStart && subscription.currentPeriodEnd && (
                        <div className="pt-3">
                          <div className="flex items-center gap-2 text-xs text-gray-600 mb-1">
                            <Clock className="h-3 w-3" />
                            <span>Progres abonament: {progress}% din perioadă scursă</span>
                          </div>
                          <div className="w-full bg-green-200 rounded-full h-2">
                            <div 
                              className="bg-green-600 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>{new Date(subscription.currentPeriodStart).toLocaleDateString('ro-RO')}</span>
                            <span>{new Date(subscription.currentPeriodEnd).toLocaleDateString('ro-RO')}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Upgrade Section */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">Upgrade la Abonament Premium</h3>
                  
                  {/* Pricing Calculator */}
                  <div className="mb-6">
                    <label className="text-sm font-medium mb-2 block">
                      Câte proprietăți vrei să gestionezi?
                    </label>
                    <div className="flex items-center gap-4">
                      <Input
                        type="number"
                        min="1"
                        max="100"
                        value={propertiesCount}
                        onChange={(e) => setPropertiesCount(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-24"
                      />
                      <span className="text-gray-600">proprietăți</span>
                    </div>

                    {/* BOGO Deal Display */}
                    <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
                      <div className="flex items-start gap-3">
                        <div className="bg-green-600 text-white px-3 py-1 rounded text-sm font-bold">
                          OFERTĂ
                        </div>
                        <div>
                          <p className="font-semibold text-green-900">Cumperi 1, Primești 1 Gratuit</p>
                          <p className="text-sm text-green-700">
                            Plătește pentru {Math.ceil(propertiesCount / 2)} proprietăț{Math.ceil(propertiesCount / 2) === 1 ? "i" : "i"},
                            primești {propertiesCount} acoperite
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Large Properties Special Offer */}
                    {propertiesCount > 10 && (
                      <Card className="mt-4 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
                        <CardContent className="py-4">
                          <div className="flex items-start gap-3">
                            <TrendingUp className="h-6 w-6 text-purple-600" />
                            <div>
                              <p className="font-semibold text-purple-900">Ofertă Specială: {propertiesCount}+ Proprietăți</p>
                              <p className="text-sm text-purple-700">
                                Pentru peste 10 proprietăți, beneficiezi de preț redus: <strong>40 EUR/proprietate/an</strong>
                              </p>
                              <p className="text-lg font-bold text-purple-900 mt-2">
                                Total: {calculatePrice(propertiesCount) - Math.floor(propertiesCount / 2) * 10} EUR/an
                                <span className="text-sm font-normal text-purple-600 ml-2">(economisești {Math.floor(propertiesCount / 2) * 10} EUR)</span>
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Price Display */}
                    <div className="mt-4 text-center p-6 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border-2 border-blue-200">
                      <p className="text-4xl font-bold text-gray-900">
                        {calculatePrice(propertiesCount)} EUR
                        <span className="text-lg font-normal text-gray-600">/an</span>
                      </p>
                      <p className="text-sm text-gray-600 mt-2">
                        {Math.ceil(propertiesCount / 2)} proprietate plătită + {Math.ceil(propertiesCount / 2)} GRATUIT
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        Adică {PRICE_PER_PROPERTY} EUR per proprietate per an
                      </p>
                    </div>
                  </div>

                  <Button onClick={handleCheckout} disabled={checkoutLoading} className="w-full h-12 text-lg bg-blue-600 hover:bg-blue-700">
                    {checkoutLoading ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Se procesează...
                      </>
                    ) : (
                      <>
                        <CreditCard className="h-5 w-5 mr-2" />
                        Plătește Acum {calculatePrice(propertiesCount)} EUR
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* TRIAL MODE - 15 Days Free */}
            {subscription.subscriptionType === "trial" && (
              <div className="space-y-6">
                <Card className="bg-blue-50 border-blue-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-blue-800">
                      <Gift className="h-5 w-5" />
                      Perioadă de Probă Gratuită
                    </CardTitle>
                    <CardDescription className="text-blue-700">
                      {TRIAL_DAYS} zile gratuite, apoi trebuie să plătești
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Proprietăți acoperite:</span>
                        <span className="font-semibold text-blue-700">{subscription.coveredProperties}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Început perioadă de probă:</span>
                        <span className="font-semibold">
                          {subscription.currentPeriodStart
                            ? new Date(subscription.currentPeriodStart).toLocaleDateString('ro-RO')
                            : 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm bg-yellow-50 p-2 rounded">
                        <span className="text-gray-700 font-medium">Expiră în:</span>
                        <span className="font-bold text-yellow-700">
                          {subscription.currentPeriodEnd
                            ? new Date(subscription.currentPeriodEnd).toLocaleDateString('ro-RO')
                            : 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Proprietăți înregistrate:</span>
                        <span className="font-semibold">{subscription.propertiesCount}</span>
                      </div>
                      {/* Progress Bar */}
                      {subscription.currentPeriodStart && subscription.currentPeriodEnd && (
                        <div className="pt-3">
                          <div className="flex items-center gap-2 text-xs text-blue-600 mb-1">
                            <Clock className="h-3 w-3" />
                            <span>Progres perioadă de probă: {progress}% scurs</span>
                          </div>
                          <div className="w-full bg-blue-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>{new Date(subscription.currentPeriodStart).toLocaleDateString('ro-RO')}</span>
                            <span>{new Date(subscription.currentPeriodEnd).toLocaleDateString('ro-RO')}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Payment Required Notice */}
                <Card className="border-orange-300 bg-orange-50">
                  <CardHeader>
                    <CardTitle className="text-orange-800">Plata Necesară După Perioada de Probă</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-orange-700 mb-4">
                      Perioada ta de probă de {TRIAL_DAYS} zile se va încheia în curând. Pentru a continua să gestionezi proprietățile,
                      trebuie să plătești abonamentul.
                    </p>
                    <div className="text-center p-4 bg-white rounded-lg border border-orange-200">
                      <p className="text-3xl font-bold text-orange-900">
                        {calculatePrice(subscription.propertiesCount || 1)} EUR
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        pentru {subscription.propertiesCount} proprietăți ({Math.ceil((subscription.propertiesCount || 1) / 2)} plătite + {Math.ceil((subscription.propertiesCount || 1) / 2)} gratuite)
                      </p>
                    </div>
                    <Button onClick={handleCheckout} className="w-full mt-4 bg-orange-600 hover:bg-orange-700">
                      <CreditCard className="h-4 w-4 mr-2" />
                      Plătește Acum
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* ACTIVE PAID SUBSCRIPTION */}
            {(subscription.status === "ACTIVE" || subscription.subscriptionType === "yearly" || subscription.subscriptionType === "monthly") && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${
                    subscription.status === "ACTIVE" ? "bg-green-500" : "bg-yellow-500"
                  }`} />
                  <span className="font-medium">{subscription.subscriptionType === "yearly" ? "Abonament Anual" : "Abonament Lunar"}</span>
                </div>

                {/* Subscription Details Card */}
                <Card className="bg-green-50 border-green-200">
                  <CardHeader>
                    <CardTitle className="text-green-800">Detalii Abonament</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Status:</span>
                        <span className="font-semibold text-green-700">Activ</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Început abonament:</span>
                        <span className="font-semibold">
                          {subscription.currentPeriodStart 
                            ? new Date(subscription.currentPeriodStart).toLocaleDateString('ro-RO')
                            : 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm bg-green-100 p-2 rounded">
                        <span className="text-gray-700 font-medium">Următoarea plată:</span>
                        <span className="font-bold text-green-800">
                          {subscription.currentPeriodEnd 
                            ? new Date(subscription.currentPeriodEnd).toLocaleDateString('ro-RO')
                            : subscription.nextPaymentDue 
                              ? new Date(subscription.nextPaymentDue).toLocaleDateString('ro-RO')
                              : 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Proprietăți plătite:</span>
                        <span className="font-semibold">{subscription.paidProperties}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Proprietăți acoperite:</span>
                        <span className="font-semibold text-green-700">{subscription.coveredProperties}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Proprietăți înregistrate:</span>
                        <span className="font-semibold">{subscription.propertiesCount}</span>
                      </div>
                      {subscription.amountPaid && (
                        <div className="flex justify-between text-sm border-t pt-2">
                          <span className="text-gray-600">Suma plătită:</span>
                          <span className="font-bold text-green-700">{subscription.amountPaid} EUR</span>
                        </div>
                      )}
                      {/* Progress Bar */}
                      {subscription.currentPeriodStart && subscription.currentPeriodEnd && (
                        <div className="pt-3">
                          <div className="flex items-center gap-2 text-xs text-green-600 mb-1">
                            <Clock className="h-3 w-3" />
                            <span>Progres abonament: {progress}% din perioadă scursă</span>
                          </div>
                          <div className="w-full bg-green-200 rounded-full h-2">
                            <div 
                              className="bg-green-600 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>{new Date(subscription.currentPeriodStart).toLocaleDateString('ro-RO')}</span>
                            <span>{new Date(subscription.currentPeriodEnd).toLocaleDateString('ro-RO')}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* BOGO Deal Active */}
                <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                  <div className="flex items-center gap-2 mb-2">
                    <Check className="h-5 w-5 text-green-600" />
                    <span className="font-semibold text-green-900">Ofertă BOGO Activă</span>
                  </div>
                  <p className="text-sm text-green-700">
                    Plătești pentru {subscription.paidProperties} proprietăț{subscription.paidProperties === 1 ? "i" : "i"}{" "}
                    și primești {subscription.coveredProperties} acoperite!
                  </p>
                </div>

                {/* Add More Properties */}
                {subscription.remainingSlots !== undefined && subscription.remainingSlots > 0 && (
                  <p className="text-sm text-blue-600">
                    ✓ Mai poți adăuga {subscription.remainingSlots} proprietăț{subscription.remainingSlots === 1 ? "i" : "i"}
                  </p>
                )}

                {subscription.remainingSlots !== undefined && subscription.remainingSlots <= 0 && (
                  <Card className="border-blue-200">
                    <CardContent className="py-4">
                      <p className="text-sm text-gray-600 mb-2">
                        Ai atins limita de proprietăți. Pentru a adăuga mai multe, upgradează abonamentul.
                      </p>
                      <Button variant="outline" size="sm" onClick={() => setPropertiesCount((subscription.propertiesCount || 0) + 2)}>
                        Adaugă Proprietăți
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {subscription.stripeCustomerId && (
                  <Button variant="outline" onClick={() => window.open("https://billing.stripe.com/p/session")}>
                    Gestionează Abonamentul
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Pricing Info */}
      <Card>
        <CardHeader>
          <CardTitle>{t('pricing')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Preț de bază</span>
              <span className="font-medium">50 EUR / proprietate / an</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Oferta BOGO</span>
              <span className="font-medium text-green-600">Cumperi 1, Primești 1 Gratuit</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Preț efectiv</span>
              <span className="font-medium">25 EUR / proprietate / an*</span>
            </div>
            <p className="text-xs text-gray-500 pt-2 border-t">
              *Cu oferta BOGO aplicată. Plătești pentru jumătate din proprietăți și primești restul gratuit!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
