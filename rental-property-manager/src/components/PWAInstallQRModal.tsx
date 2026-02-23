"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { QRCodeSVG } from "qrcode.react"
import { Download, QrCode, X, Smartphone, User, Building } from "lucide-react"

interface PWAInstallQRModalProps {
  businessSlug: string
  companyName: string
  role: "tenant" | "manager"
  onClose: () => void
}

export function PWAInstallQRModal({ 
  businessSlug, 
  companyName,
  role,
  onClose 
}: PWAInstallQRModalProps) {
  const [downloading, setDownloading] = useState(false)

  const baseUrl = typeof window !== 'undefined' 
    ? window.location.origin.replace('localhost', '192.168.1.7').replace('127.0.0.1', '192.168.1.7')
    : 'http://192.168.1.7:3000'

  // PWA Install URL - opens the app and triggers install prompt
  const pwaInstallUrl = `${baseUrl}/ro/${businessSlug}/auth/signin?pwa-install=true&role=${role}`

  const downloadQR = () => {
    setDownloading(true)
    const canvas = document.createElement('canvas')
    const svg = document.getElementById(`qr-pwa-install`)
    if (svg) {
      const svgData = new XMLSerializer().serializeToString(svg)
      const img = new Image()
      img.onload = () => {
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext('2d')
        if (ctx) {
          ctx.drawImage(img, 0, 0)
          const pngFile = canvas.toDataURL('image/png')
          const link = document.createElement('a')
          link.download = `install-app-${companyName}-${role}.png`
          link.href = pngFile
          link.click()
        }
        setDownloading(false)
      }
      img.src = 'data:image/svg+xml;base64,' + btoa(svgData)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            {role === "tenant" ? "Instalare Aplicație Chiriaș" : "Instalare Aplicație Manager"}
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <CardContent className="p-6 space-y-6">
          {/* Business Info */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-3 mb-2">
              <Building className="h-5 w-5 text-blue-600" />
              <p className="text-sm font-semibold text-blue-900">
                {companyName}
              </p>
            </div>
            <p className="text-sm text-blue-700">
              <strong>URL:</strong> rentalmanager.ro/{businessSlug}
            </p>
            <p className="text-sm text-blue-700 mt-1">
              <strong>Tip:</strong> {role === "tenant" ? "Aplicație Chiriaș" : "Aplicație Manager"}
            </p>
          </div>

          {/* QR Code */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                {role === "tenant" ? "QR Instalare Chiriaș" : "QR Instalare Manager"}
              </CardTitle>
              <CardDescription>
                Scanează pentru a instala aplicația pe telefon
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-center p-4 bg-white rounded-lg border">
                <QRCodeSVG
                  id="qr-pwa-install"
                  value={pwaInstallUrl}
                  size={220}
                  level="H"
                  includeMargin={true}
                />
              </div>
              
              <div className="space-y-3">
                <h4 className="font-semibold text-sm">Cum să instalezi:</h4>
                <ol className="text-sm text-gray-600 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-xs font-bold">1</span>
                    <span>Deschide camera telefonului și scanează codul QR</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-xs font-bold">2</span>
                    <span>Se va deschide browserul pe pagina aplicației</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-xs font-bold">3</span>
                    <span>Apasă pe "Share" (iOS) sau meniul (Android)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-xs font-bold">4</span>
                    <span>Selectează "Add to Home Screen" / "Adaugă pe ecranul principal"</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-xs font-bold">5</span>
                    <span>Aplicația va apărea pe ecranul principal cu logo-ul companiei</span>
                  </li>
                </ol>
              </div>

              <Button 
                className="w-full" 
                onClick={downloadQR}
                disabled={downloading}
              >
                <Download className="h-4 w-4 mr-2" />
                {downloading ? "Se descarcă..." : "Descarcă Cod QR"}
              </Button>
            </CardContent>
          </Card>

          {/* Platform Instructions */}
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <span className="text-2xl">🍎</span>
                  iOS (iPhone)
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-gray-600 space-y-1">
                <p>1. Scanează codul QR</p>
                <p>2. Apasă butonul <strong>Share</strong> (pătrat cu săgeată)</p>
                <p>3. Derulează și apasă <strong>"Add to Home Screen"</strong></p>
                <p>4. Apasă <strong>Add</strong> în colțul din dreapta</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <span className="text-2xl">🤖</span>
                  Android
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-gray-600 space-y-1">
                <p>1. Scanează codul QR</p>
                <p>2. Apasă meniul (trei puncte)</p>
                <p>3. Selectează <strong>"Add to Home screen"</strong></p>
                <p>4. Apasă <strong>"Add"</strong> sau <strong>"Install"</strong></p>
              </CardContent>
            </Card>
          </div>

          {/* Info Box */}
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800">
              <strong>Notă:</strong> Aplicația va fi numită "<strong>{companyName}</strong>" și va avea logo-ul companiei. 
              Funcționează pe orice telefon (iPhone sau Android) fără a necesita descărcare din App Store sau Google Play.
            </p>
          </div>
        </CardContent>
      </div>
    </div>
  )
}
