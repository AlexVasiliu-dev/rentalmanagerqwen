"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { QRCodeSVG } from "qrcode.react"
import { Download, QrCode, X } from "lucide-react"

interface TenantQRCodeModalProps {
  tenantName: string
  tenantEmail: string
  tenantPassword: string
  businessSlug: string
  onClose: () => void
}

export function TenantQRCodeModal({ 
  tenantName, 
  tenantEmail, 
  tenantPassword, 
  businessSlug,
  onClose 
}: TenantQRCodeModalProps) {
  const [downloading, setDownloading] = useState<string | null>(null)

  const baseUrl = typeof window !== 'undefined' 
    ? window.location.origin.replace('localhost', '192.168.1.7').replace('127.0.0.1', '192.168.1.7')
    : 'http://192.168.1.7:3000'

  // QR Code 1: Tenant login with pre-filled credentials
  const tenantLoginUrl = `${baseUrl}/ro/auth/signin?email=${encodeURIComponent(tenantEmail)}&password=${encodeURIComponent(tenantPassword)}`

  // QR Code 2: Manager login page
  const managerLoginUrl = `${baseUrl}/ro/manager/auth/signin`

  const downloadQR = (qrData: string, filename: string) => {
    setDownloading(filename)
    const canvas = document.createElement('canvas')
    const svg = document.getElementById(`qr-${filename}`)
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
          link.download = filename
          link.href = pngFile
          link.click()
        }
        setDownloading(null)
      }
      img.src = 'data:image/svg+xml;base64,' + btoa(svgData)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Coduri QR pentru Chiriaș</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <CardContent className="p-6">
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Informații Chiriaș:</strong> {tenantName} ({tenantEmail})
            </p>
            <p className="text-sm text-blue-700 mt-1">
              <strong>Parolă:</strong> {tenantPassword}
            </p>
            <p className="text-sm text-blue-700 mt-1">
              <strong>URL Afacere:</strong> rentalmanager.ro/{businessSlug}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* QR Code 1: Tenant Login */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">1. Autentificare Chiriaș</CardTitle>
                <CardDescription>
                  Scanare pentru acces rapid la contul de chiriaș
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-center p-4 bg-white rounded-lg border">
                  <QRCodeSVG
                    id="qr-tenant-login.png"
                    value={tenantLoginUrl}
                    size={200}
                    level="H"
                    includeMargin={true}
                  />
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600 text-center">
                    Acest cod QR conține:
                  </p>
                  <ul className="text-xs text-gray-500 space-y-1">
                    <li>• URL: rentalmanager.ro/{businessSlug}/auth/signin</li>
                    <li>• Email: {tenantEmail}</li>
                    <li>• Parolă: {tenantPassword}</li>
                  </ul>
                </div>
                <Button 
                  className="w-full" 
                  onClick={() => downloadQR(tenantLoginUrl, `qr-tenant-login-${tenantEmail.split('@')[0]}.png`)}
                  disabled={downloading !== null}
                >
                  <Download className="h-4 w-4 mr-2" />
                  {downloading === `qr-tenant-login-${tenantEmail.split('@')[0]}.png` ? "Se descarcă..." : "Descarcă QR"}
                </Button>
              </CardContent>
            </Card>

            {/* QR Code 2: Manager Login */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">2. Autentificare Manager</CardTitle>
                <CardDescription>
                  Scanare pentru autentificare rapidă ca manager
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-center p-4 bg-white rounded-lg border">
                  <QRCodeSVG
                    id="qr-manager-login.png"
                    value={managerLoginUrl}
                    size={200}
                    level="H"
                    includeMargin={true}
                  />
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600 text-center">
                    Acest cod QR conține:
                  </p>
                  <ul className="text-xs text-gray-500 space-y-1">
                    <li>• URL: {managerLoginUrl}</li>
                    <li>• Pagină de autentificare pentru manageri</li>
                  </ul>
                </div>
                <Button
                  className="w-full"
                  onClick={() => downloadQR(managerLoginUrl, `qr-manager-login-${businessSlug}.png`)}
                  disabled={downloading !== null}
                >
                  <Download className="h-4 w-4 mr-2" />
                  {downloading === `qr-manager-login-${businessSlug}.png` ? "Se descarcă..." : "Descarcă QR"}
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Notă:</strong> Aceste coduri QR pot fi printate și înmânate chiriașului sau managerului pentru acces rapid la platformă.
            </p>
          </div>
        </CardContent>
      </div>
    </div>
  )
}
