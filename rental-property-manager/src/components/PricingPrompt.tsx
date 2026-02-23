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
            {isOverLimit ? "Limita de Abonament Atinsă" : "Upgrade la Planul Tău"}
          </CardTitle>
        </div>
        <CardDescription>
          {isOverLimit
            ? "Ai atins limita abonamentului tău"
            : `Mai ai ${remainingSlots} proprietăț${remainingSlots === 1 ? "i" : "i"} rămase în abonament`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Proprietăți Curente</span>
          <span className="font-medium">{currentProperties}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Abonamentul Acoperă</span>
          <span className="font-medium">{maxProperties} proprietăți</span>
        </div>

        {isOverLimit && (
          <div className="p-3 bg-red-100 rounded-md">
            <p className="text-sm text-red-800 font-medium">
              ⚠️ Trebuie să faci upgrade pentru a adăuga mai multe proprietăți
            </p>
          </div>
        )}

        <div className="pt-2 border-t">
          <h4 className="font-semibold mb-2">Ofertă Specială:</h4>
          <ul className="space-y-1 text-sm">
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-600" />
              <span>50 EUR/an per proprietate</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-600" />
              <span className="font-semibold text-green-700">Cumperi 1 Primești 1 GRATUIT!</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-600" />
              <span>Efectiv: 25 EUR/proprietate/an</span>
            </li>
          </ul>
        </div>

        <Button onClick={handleUpgrade} className="w-full">
          {isOverLimit ? "Fă Upgrade Acum" : "Vezi Prețurile"}
        </Button>

        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-sm text-blue-600 hover:underline w-full text-center"
        >
          {showDetails ? "Ascunde" : "Află mai multe"} despre prețurile noastre
        </button>

        {showDetails && (
          <div className="p-4 bg-white rounded-md text-sm space-y-2">
            <p className="font-semibold">Cum Funcționează BOGO:</p>
            <p className="text-gray-600">
              Când te abonezi pentru 1 proprietate (50 EUR/an), primești 2 proprietăți acoperite!
              Asta înseamnă că plătești pentru jumătate și primești restul gratuit.
            </p>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div className="p-2 bg-blue-50 rounded">
                <p className="font-medium">Plătești pentru 1</p>
                <p className="text-blue-700">50 EUR/an</p>
              </div>
              <div className="p-2 bg-green-50 rounded">
                <p className="font-medium">Primești 2 Acoperite</p>
                <p className="text-green-700">Economisești 50 EUR!</p>
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
        <CardTitle>Prețuri Abonament</CardTitle>
        <CardDescription>Prețuri transparente cu oferta noastră BOGO</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Proprietăți de acoperit</span>
            <span className="font-medium">{propertiesCount}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Proprietăți pentru care plătești</span>
            <span className="font-medium">{paidProperties}</span>
          </div>
          <div className="flex items-center justify-between text-green-600">
            <span className="text-gray-600">Proprietăți GRATUITE (BOGO)</span>
            <span className="font-medium">+{freeProperties}</span>
          </div>
        </div>

        <div className="border-t pt-4">
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold">Total</span>
            <div className="text-right">
              <span className="text-3xl font-bold">{totalAmount} EUR</span>
              <p className="text-sm text-gray-600">/an</p>
            </div>
          </div>
        </div>

        <div className="p-3 bg-green-50 rounded-md">
          <p className="text-sm text-green-800 font-medium">
            💡 Economisești {freeProperties * 50} EUR cu oferta noastră Cumperi 1 Primești 1 Gratuit!
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
