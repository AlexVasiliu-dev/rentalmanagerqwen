"use client"

import { useTranslations } from "next-intl"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Mail, Phone, User } from "lucide-react"

interface ContactManagerProps {
  manager: {
    name: string | null
    email: string
    phone?: string | null
  }
}

export function ContactManager({ manager }: ContactManagerProps) {
  const t = useTranslations('contact')

  // Extract first name from full name
  const firstName = manager.name?.split(' ')[0] || manager.email.split('@')[0]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{t('contactManager')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
            <User className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{t('managerName')}</p>
            <p className="font-medium">{firstName}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
            <Mail className="h-5 w-5 text-green-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">{t('email')}</p>
            <a 
              href={`mailto:${manager.email}`}
              className="font-medium text-blue-600 hover:underline"
            >
              {manager.email}
            </a>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(`mailto:${manager.email}`)}
          >
            <Mail className="h-4 w-4" />
          </Button>
        </div>

        {manager.phone && (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
              <Phone className="h-5 w-5 text-purple-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">{t('phone')}</p>
              <a 
                href={`tel:${manager.phone}`}
                className="font-medium text-blue-600 hover:underline"
              >
                {manager.phone}
              </a>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(`tel:${manager.phone}`)}
            >
              <Phone className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
