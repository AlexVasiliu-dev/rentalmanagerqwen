"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useTranslations } from 'next-intl';
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Check, X, Loader2, ExternalLink, Copy } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

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
}

export default function SubscriptionPage() {
  const t = useTranslations('subscription');
  const tCommon = useTranslations('common');
  const { data: session } = useSession()
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [ownerSlug, setOwnerSlug] = useState("")
  const [ownerSlugLoading, setOwnerSlugLoading] = useState(false)
  const [ownerUrl, setOwnerUrl] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [propertiesCount, setPropertiesCount] = useState(1)

  useEffect(() => {
    fetchSubscription()
  }, [])

  const fetchSubscription = async () => {
    try {
      const response = await fetch("/api/subscription")
      if (response.ok) {
        const data = await response.json()
        setSubscription(data)
      }
    } catch (error) {
      console.error("Error fetching subscription:", error)
    } finally {
      setLoading(false)
    }
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
        window.location.href = data.checkoutUrl
      } else {
        const error = await response.json()
        setMessage({ type: "error", text: error.error || "Failed to create checkout session" })
      }
    } catch (error) {
      console.error("Error creating checkout:", error)
      setMessage({ type: "error", text: "An unexpected error occurred" })
    } finally {
      setCheckoutLoading(false)
    }
  }

  const handleCreateOwnerSlug = async (e: React.FormEvent) => {
    e.preventDefault()
    setOwnerSlugLoading(true)
    setMessage(null)

    try {
      const response = await fetch("/api/owner-slug", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: ownerSlug }),
      })

      if (response.ok) {
        const data = await response.json()
        setOwnerUrl(data.ownerUrl)
        setMessage({ type: "success", text: "Your permanent owner link has been created!" })
      } else {
        const error = await response.json()
        setMessage({ type: "error", text: error.error || "Failed to create owner link" })
      }
    } catch (error) {
      console.error("Error creating owner slug:", error)
      setMessage({ type: "error", text: "An unexpected error occurred" })
    } finally {
      setOwnerSlugLoading(false)
    }
  }

  const copyOwnerUrl = () => {
    if (ownerUrl) {
      navigator.clipboard.writeText(ownerUrl)
      setMessage({ type: "success", text: "Owner link copied to clipboard!" })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t('title')}</h1>
        <p className="text-gray-600">Manage your subscription and owner profile</p>
      </div>

      {message && (
        <div className={`p-4 rounded-md ${
          message.type === "success" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
        }`}>
          {message.text}
        </div>
      )}

      {/* Owner Permanent Link */}
      <Card>
        <CardHeader>
          <CardTitle>Your Permanent Owner Link</CardTitle>
          <CardDescription>
            Create your unique link to access your property management dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!ownerUrl ? (
            <form onSubmit={handleCreateOwnerSlug} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">
                  Choose your owner link
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">Property_mngmt.com/owner/</span>
                  <Input
                    value={ownerSlug}
                    onChange={(e) => setOwnerSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                    placeholder="your-name"
                    className="flex-1"
                    required
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Only lowercase letters, numbers, and hyphens allowed
                </p>
              </div>
              <Button type="submit" disabled={ownerSlugLoading || !ownerSlug}>
                {ownerSlugLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Create Owner Link
              </Button>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-md">
                <p className="text-sm font-medium text-blue-900 mb-2">Your Permanent Owner Link:</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-white px-3 py-2 rounded text-sm">
                    {ownerUrl}
                  </code>
                  <Button variant="outline" size="icon" onClick={copyOwnerUrl}>
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => window.open(ownerUrl, "_blank")}>
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                ✓ This is your permanent link to access the property management system
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Subscription Status */}
      {subscription && (
        <Card>
          <CardHeader>
            <CardTitle>{t('title')}</CardTitle>
            <CardDescription>
              {subscription.hasSubscription
                ? "Manage your property management subscription"
                : "Start managing your properties"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {!subscription.hasSubscription || subscription.status === "INACTIVE" ? (
              <div>
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">Start with a Free Trial</h3>
                  <p className="text-gray-600 mb-4">
                    Manage your first property for free! No credit card required.
                  </p>
                  <div className="flex items-center gap-2 text-green-600">
                    <Check className="h-5 w-5" />
                    <span>1 Property Free</span>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">{t('upgradeToPremium')}</h3>

                  {/* Pricing Calculator */}
                  <div className="mb-6">
                    <label className="text-sm font-medium mb-2 block">
                      How many properties do you want to manage?
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
                      <span className="text-gray-600">properties</span>
                    </div>

                    {/* BOGO Deal Display */}
                    <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
                      <div className="flex items-start gap-3">
                        <div className="bg-green-600 text-white px-2 py-1 rounded text-xs font-bold">
                          DEAL
                        </div>
                        <div>
                          <p className="font-semibold text-green-900">{t('buyOneGetOne')}</p>
                          <p className="text-sm text-green-700">
                            Pay for {Math.ceil(propertiesCount / 2)} propert{Math.ceil(propertiesCount / 2) === 1 ? "y" : "ies"},
                            get {propertiesCount} covered
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Price Display */}
                    <div className="mt-4 text-center p-4 bg-gray-50 rounded-lg">
                      <p className="text-3xl font-bold text-gray-900">
                        {formatCurrency(Math.ceil(propertiesCount / 2) * 50)}
                        <span className="text-sm font-normal text-gray-600">/year</span>
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {Math.ceil(propertiesCount / 2)} property paid + {Math.ceil(propertiesCount / 2)} FREE
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        That&apos;s {formatCurrency(50)} per property per year
                      </p>
                    </div>
                  </div>

                  <Button onClick={handleCheckout} disabled={checkoutLoading} className="w-full">
                    {checkoutLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        {tCommon('processing')}
                      </>
                    ) : (
                      t('subscribe')
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${
                    subscription.status === "ACTIVE" ? "bg-green-500" : "bg-red-500"
                  }`} />
                  <span className="font-medium">{subscription.status}</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-gray-600">{t('propertiesCovered')}</p>
                    <p className="text-2xl font-bold text-blue-900">
                      {subscription.coveredProperties}
                    </p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-gray-600">Active Properties</p>
                    <p className="text-2xl font-bold text-green-900">
                      {subscription.propertiesCount}
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                  <div className="flex items-center gap-2 mb-2">
                    <Check className="h-5 w-5 text-green-600" />
                    <span className="font-semibold text-green-900">BOGO Deal Active</span>
                  </div>
                  <p className="text-sm text-green-700">
                    You&apos;re paying for {subscription.paidProperties} propert{subscription.paidProperties === 1 ? "y" : "ies"}{" "}
                    and getting {subscription.coveredProperties} covered!
                  </p>
                </div>

                {subscription.currentPeriodEnd && (
                  <p className="text-sm text-gray-600">
                    Next billing date: {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                  </p>
                )}

                {subscription.stripeCustomerId && (
                  <Button variant="outline" onClick={() => window.open("https://billing.stripe.com/p/session")}>
                    {t('manageSubscription')}
                  </Button>
                )}

                {subscription.remainingSlots !== undefined && subscription.remainingSlots > 0 && (
                  <p className="text-sm text-green-600">
                    ✓ You can add {subscription.remainingSlots} more propert{subscription.remainingSlots === 1 ? "y" : "ies"}
                  </p>
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
              <span className="text-gray-600">Base Price</span>
              <span className="font-medium">{formatCurrency(50)} / property / year</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">BOGO Deal</span>
              <span className="font-medium text-green-600">Buy 1 Get 1 FREE</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Effective Price</span>
              <span className="font-medium">{formatCurrency(25)} / property / year*</span>
            </div>
            <p className="text-xs text-gray-500 pt-2 border-t">
              *With BOGO deal applied. You pay for half the properties and get the rest free!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
