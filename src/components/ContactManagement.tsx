"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { User, Mail, Phone, X, Send } from "lucide-react"

interface ContactManagementProps {
  manager?: {
    name: string | null
    email: string | null
    phone: string | null
  }
  propertyId: string
  tenantName?: string
  tenantEmail?: string
}

export function ContactManagement({ manager, propertyId, tenantName, tenantEmail }: ContactManagementProps) {
  const [showModal, setShowModal] = useState(false)
  const [showManager, setShowManager] = useState(false)
  const [showOwnerForm, setShowOwnerForm] = useState(false)
  const [ownerMessage, setOwnerMessage] = useState({ subject: "", message: "" })
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  const handleContactOwner = async (e: React.FormEvent) => {
    e.preventDefault()
    setSending(true)

    try {
      const response = await fetch("/api/contact-owner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId,
          subject: ownerMessage.subject,
          message: ownerMessage.message,
          tenantName,
          tenantEmail,
        }),
      })

      if (response.ok) {
        setSent(true)
        setTimeout(() => {
          setShowOwnerForm(false)
          setSent(false)
          setOwnerMessage({ subject: "", message: "" })
        }, 3000)
      }
    } catch (error) {
      console.error("Error sending message:", error)
    } finally {
      setSending(false)
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Contact Management</CardTitle>
          <CardDescription>Ia legătura cu managementul proprietății</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <Button
              variant="outline"
              className="h-auto py-6 flex flex-col items-center gap-2"
              onClick={() => {
                setShowManager(true)
                setShowModal(true)
              }}
            >
              <User className="h-8 w-8 text-blue-600" />
              <span className="font-semibold">Contact Manager</span>
              <span className="text-sm text-gray-500">Vezi datele de contact ale managerului</span>
            </Button>

            <Button
              variant="outline"
              className="h-auto py-6 flex flex-col items-center gap-2"
              onClick={() => {
                setShowOwnerForm(true)
                setShowModal(true)
              }}
            >
              <Mail className="h-8 w-8 text-green-600" />
              <span className="font-semibold">Contact Proprietar</span>
              <span className="text-sm text-gray-500">Trimite mesaj proprietarului</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                {showManager ? "Date de Contact Manager" : "Contactează Proprietarul"}
              </h2>
              <Button variant="ghost" size="sm" onClick={() => {
                setShowModal(false)
                setShowManager(false)
                setShowOwnerForm(false)
              }}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="p-6">
              {showManager && manager && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                    <User className="h-6 w-6 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-600">Nume</p>
                      <p className="font-medium">{manager.name || "N/A"}</p>
                    </div>
                  </div>

                  {manager.email && (
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                      <Mail className="h-6 w-6 text-blue-600" />
                      <div>
                        <p className="text-sm text-gray-600">Email</p>
                        <p className="font-medium">{manager.email}</p>
                      </div>
                    </div>
                  )}

                  {manager.phone && (
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                      <Phone className="h-6 w-6 text-blue-600" />
                      <div>
                        <p className="text-sm text-gray-600">Telefon</p>
                        <p className="font-medium">{manager.phone}</p>
                      </div>
                    </div>
                  )}

                  {!manager.name && !manager.email && !manager.phone && (
                    <p className="text-gray-600 text-center py-8">Nu există informații de contact pentru manager</p>
                  )}
                </div>
              )}

              {showOwnerForm && (
                <>
                  {sent ? (
                    <div className="text-center py-8">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                        <Send className="h-8 w-8 text-green-600" />
                      </div>
                      <h3 className="text-xl font-semibold text-green-800 mb-2">Mesaj Trimis!</h3>
                      <p className="text-gray-600">Mesajul tău a fost transmis proprietarului</p>
                    </div>
                  ) : (
                    <form onSubmit={handleContactOwner} className="space-y-4">
                      <p className="text-sm text-gray-600">
                        Trimite un mesaj direct proprietarului. Informațiile tale de contact vor fi incluse.
                      </p>

                      <div>
                        <label className="text-sm font-medium mb-1 block">Subiect</label>
                        <Input
                          value={ownerMessage.subject}
                          onChange={(e) => setOwnerMessage({ ...ownerMessage, subject: e.target.value })}
                          placeholder="Despre ce este vorba?"
                          required
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-1 block">Mesaj</label>
                        <Textarea
                          value={ownerMessage.message}
                          onChange={(e) => setOwnerMessage({ ...ownerMessage, message: e.target.value })}
                          placeholder="Scrie mesajul tău aici..."
                          rows={6}
                          required
                        />
                      </div>

                      {(tenantName || tenantEmail) && (
                        <div className="p-3 bg-gray-50 rounded-lg text-sm">
                          <p className="font-medium mb-2">Informațiile tale de contact (incluse):</p>
                          {tenantName && <p className="text-gray-600">Nume: {tenantName}</p>}
                          {tenantEmail && <p className="text-gray-600">Email: {tenantEmail}</p>}
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Button type="submit" disabled={sending}>
                          {sending ? "Se trimite..." : "Trimite Mesajul"}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setShowOwnerForm(false)
                            setOwnerMessage({ subject: "", message: "" })
                          }}
                        >
                          Anulează
                        </Button>
                      </div>
                    </form>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
