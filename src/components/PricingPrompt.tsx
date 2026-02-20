"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, X, Zap } from "lucide-react"

interface PricingPromptProps {
  currentProperties: number
  maxProperties: number
  onUpgrade?: () => void
}

export function PricingPrompt({ currentProperties, maxProperties, onUpgrade }: PricingPromptProps) {
  const router = useRouter()
  const [showDetails, setShowDetails] = useState(false)

  const remainingSlots = maxProperties - currentProperties
  const isOverLimit = currentProperties >= maxProperties

  const handleUpgrade = () => {
    if (onUpgrade) {
      onUpgrade()
    } else {
      router.push("/dashboard/subscription")
    }
  }

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-orange-600" />
          <CardTitle className="text-lg">
            {isOverLimit ? "Subscription Limit Reached" : "Upgrade Your Plan"}
          </CardTitle>
        </div>
        <CardDescription>
          {isOverLimit
            ? "You've reached your subscription limit"
            : `You have ${remainingSlots} propert${remainingSlots === 1 ? "y" : "ies"} remaining in your subscription`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Current Properties</span>
          <span className="font-medium">{currentProperties}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Subscription Covers</span>
          <span className="font-medium">{maxProperties} properties</span>
        </div>
        
        {isOverLimit && (
          <div className="p-3 bg-red-100 rounded-md">
            <p className="text-sm text-red-800 font-medium">
              ⚠️ You need to upgrade to add more properties
            </p>
          </div>
        )}

        <div className="pt-2 border-t">
          <h4 className="font-semibold mb-2">Special Offer:</h4>
          <ul className="space-y-1 text-sm">
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-600" />
              <span>50 EUR/year per property</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-600" />
              <span className="font-semibold text-green-700">Buy 1 Get 1 FREE!</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-600" />
              <span>Effective: 25 EUR/property/year</span>
            </li>
          </ul>
        </div>

        <Button onClick={handleUpgrade} className="w-full">
          {isOverLimit ? "Upgrade Now" : "View Pricing"}
        </Button>

        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-sm text-blue-600 hover:underline w-full text-center"
        >
          {showDetails ? "Hide" : "Learn"} more about our pricing
        </button>

        {showDetails && (
          <div className="p-4 bg-white rounded-md text-sm space-y-2">
            <p className="font-semibold">How BOGO Works:</p>
            <p className="text-gray-600">
              When you subscribe for 1 property (50 EUR/year), you get 2 properties covered!
              That means you pay for half and get the rest free.
            </p>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div className="p-2 bg-blue-50 rounded">
                <p className="font-medium">Pay for 1</p>
                <p className="text-blue-700">50 EUR/year</p>
              </div>
              <div className="p-2 bg-green-50 rounded">
                <p className="font-medium">Get 2 Covered</p>
                <p className="text-green-700">Save 50 EUR!</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function PricingDisplay({ propertiesCount }: { propertiesCount: number }) {
  const paidProperties = Math.ceil(propertiesCount / 2)
  const freeProperties = paidProperties
  const totalAmount = paidProperties * 50

  return (
    <Card>
      <CardHeader>
        <CardTitle>Subscription Pricing</CardTitle>
        <CardDescription>Transparent pricing with our BOGO deal</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Properties to cover</span>
            <span className="font-medium">{propertiesCount}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Properties you pay for</span>
            <span className="font-medium">{paidProperties}</span>
          </div>
          <div className="flex items-center justify-between text-green-600">
            <span className="text-gray-600">FREE properties (BOGO)</span>
            <span className="font-medium">+{freeProperties}</span>
          </div>
        </div>

        <div className="border-t pt-4">
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold">Total</span>
            <div className="text-right">
              <span className="text-3xl font-bold">{totalAmount} EUR</span>
              <p className="text-sm text-gray-600">/year</p>
            </div>
          </div>
        </div>

        <div className="p-3 bg-green-50 rounded-md">
          <p className="text-sm text-green-800 font-medium">
            💡 You save {freeProperties * 50} EUR with our Buy One Get One Free deal!
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
