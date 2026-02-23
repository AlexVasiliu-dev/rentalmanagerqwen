"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LocaleLink } from "@/components/LocaleLink"

export function GDPRCookieNotice() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const hasConsent = localStorage.getItem('gdpr-consent')
    if (!hasConsent) {
      // Show after 2 seconds
      const timer = setTimeout(() => {
        setShow(true)
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleAccept = () => {
    localStorage.setItem('gdpr-consent', 'true')
    setShow(false)
  }

  const handleDecline = () => {
    localStorage.setItem('gdpr-consent', 'false')
    setShow(false)
  }

  if (!show) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-gray-900/95 text-white shadow-lg border-t border-gray-700">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <h3 className="font-semibold mb-2 text-lg">🍪 Notificare GDPR și Cookie-uri</h3>
                <p className="text-sm text-gray-300 leading-relaxed">
                  Folosim cookie-uri și tehnologii similare pentru a-ți îmbunătăți experiența, 
                  pentru a analiza utilizarea site-ului și pentru a oferi funcționalități personalizate. 
                  Datele tale sunt procesate în conformitate cu <strong>Regulamentul General privind Protecția Datelor (GDPR)</strong>. 
                  Nu vindem și nu împărtășim datele tale cu terți fără consimțământul tău explicit.
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  Prin continuarea navigării, îți exprimi acordul pentru utilizarea cookie-urilor și procesarea datelor 
                  în scopurile descrise în <LocaleLink href="/privacy" className="text-blue-400 hover:underline">Politica de Confidențialitate</LocaleLink>.
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button 
              onClick={handleAccept}
              className="bg-green-600 hover:bg-green-700 text-white"
              size="sm"
            >
              ✓ Accept
            </Button>
            <Button 
              onClick={handleDecline}
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-800"
              size="sm"
            >
              ✗ Refuz
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShow(false)}
              className="text-gray-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
