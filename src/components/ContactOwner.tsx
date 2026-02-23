"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog"
import { Mail, Building } from "lucide-react"

interface ContactOwnerProps {
  propertyId: string
  tenantName?: string
  tenantEmail?: string
}

export function ContactOwner({ propertyId, tenantName, tenantEmail }: ContactOwnerProps) {
  const t = useTranslations('contact')
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    subject: "",
    message: "",
  })
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")

    try {
      const response = await fetch("/api/contact-owner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId,
          subject: formData.subject,
          message: formData.message,
          tenantName,
          tenantEmail,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(true)
        setFormData({ subject: "", message: "" })
        setTimeout(() => {
          setIsOpen(false)
          setSuccess(false)
        }, 2000)
      } else {
        setError(data.error || t('sendError'))
      }
    } catch (err) {
      setError(t('sendError'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <Mail className="h-4 w-4 mr-2" />
          {t('contactOwner')}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('contactOwner')}</DialogTitle>
          <DialogDescription>
            {t('contactOwnerDescription')}
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <Mail className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">{t('messageSent')}</h3>
            <p className="text-muted-foreground">{t('messageSentDescription')}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-md">
              <Building className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium">{t('propertyAddress')}</p>
                <p className="text-xs text-muted-foreground">{t('ownerNotified')}</p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">{t('subject')}</label>
              <Input
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder={t('subjectPlaceholder')}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">{t('message')}</label>
              <Textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder={t('messagePlaceholder')}
                rows={5}
                required
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 text-red-600 rounded-md text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-2">
              <Button type="submit" disabled={isSubmitting} className="flex-1">
                {isSubmitting ? t('sending') : t('sendMessage')}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                disabled={isSubmitting}
              >
                {t('cancel')}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
