"use client"

import { useState, useEffect } from "react"
import { useParams, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, Printer, ArrowLeft, CheckCircle, X, PenTool } from "lucide-react"
import { generateLeaseContractRo, generateLeaseContractHTML } from "@/lib/contract-generator"

interface ContractData {
  owner: {
    name: string | null
    companyName: string | null
    companyRegNumber: string | null
    companyFiscalCode: string | null
    workingEmail: string | null
    phone: string | null
  }
  tenant: {
    name: string | null
    email: string
    phone: string | null
    idCardSeries: string | null
    idCardNumber: string | null
    cnp: string | null
  }
  property: {
    address: string
    city: string
    country: string
    type: string
    sqm: number
    rooms: number | null
    floor: number | null
  }
  lease: {
    startDate: string
    endDate: string | null
    monthlyRent: number
    deposit: number | null
    paymentDay: number
  }
  signatures: {
    ownerSigned: boolean
    ownerSignedAt: string | null
    tenantSigned: boolean
    tenantSignedAt: string | null
  }
}

export default function ContractViewPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const leaseId = params.id as string
  const [contractData, setContractData] = useState<ContractData | null>(null)
  const [loading, setLoading] = useState(true)
  const [showSuccess, setShowSuccess] = useState(false)
  const [signing, setSigning] = useState(false)
  const [signed, setSigned] = useState(false)

  useEffect(() => {
    fetchContractData()
    // Check if redirected from tenant creation
    const success = searchParams.get('success')
    if (success === 'tenant-added') {
      setShowSuccess(true)
    }
  }, [leaseId])

  const fetchContractData = async () => {
    try {
      const response = await fetch(`/api/leases/${leaseId}`)
      const data = await response.json()

      if (response.ok) {
        setContractData(data)
        setSigned(data.signatures.ownerSigned)
      } else {
        console.error("Error fetching contract:", data.error)
      }
    } catch (error) {
      console.error("Error fetching contract data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handlePrint = () => {
    if (!contractData) return

    const contractHTML = generateLeaseContractHTML(contractData)
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(contractHTML)
      printWindow.document.close()
      printWindow.focus()
      setTimeout(() => {
        printWindow.print()
      }, 250)
    }
  }

  const handleDownload = () => {
    if (!contractData) return

    const contractHTML = generateLeaseContractHTML(contractData)
    const blob = new Blob([contractHTML], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `contract-inchiriere-${leaseId}.html`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleSign = async () => {
    if (!confirm("Ești sigur că dorești să semnezi acest contract? Această acțiune este definitivă.")) {
      return
    }

    setSigning(true)
    try {
      const response = await fetch(`/api/leases/${leaseId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ownerSigned: true }),
      })

      if (response.ok) {
        // Refetch contract data to get updated signature timestamp from server
        await fetchContractData()
        alert("Contract semnat cu succes!")
      } else {
        const error = await response.json()
        alert(error.error || "Eroare la semnarea contractului")
      }
    } catch (error) {
      console.error("Error signing contract:", error)
      alert("Eroare la semnarea contractului")
    } finally {
      setSigning(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-600">Se încarcă contractul...</p>
      </div>
    )
  }

  if (!contractData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Eroare</CardTitle>
        </CardHeader>
        <CardContent className="py-8">
          <p className="text-center text-gray-600">
            Contractul nu a fost găsit sau nu există date suficiente pentru generare.
          </p>
          <p className="text-center text-sm text-gray-500 mt-2">
            Lease ID: {leaseId}
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {showSuccess && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <div>
                <p className="font-semibold text-green-800">Chiriaș Adăugat cu Succes!</p>
                <p className="text-sm text-green-700">Proprietatea a fost închiriată. Mai jos este contractul generat.</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="ml-auto"
                onClick={() => setShowSuccess(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => window.history.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Înapoi
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Contract de Închiriere</h1>
          <p className="text-gray-600">Vezi și imprimă contractul de închiriere</p>
        </div>
      </div>

      <div className="flex gap-2">
        <Button onClick={handlePrint}>
          <Printer className="h-4 w-4 mr-2" />
          Printează Contractul
        </Button>
        <Button variant="outline" onClick={handleDownload}>
          <Download className="h-4 w-4 mr-2" />
          Descarcă HTML
        </Button>
        {!signed && (
          <Button onClick={handleSign} disabled={signing} className="bg-blue-600 hover:bg-blue-700">
            <PenTool className="h-4 w-4 mr-2" />
            {signing ? "Se semnează..." : "Semnează"}
          </Button>
        )}
        {signed && (
          <Button variant="outline" disabled className="text-green-600 border-green-600">
            <CheckCircle className="h-4 w-4 mr-2" />
            Semnat la {contractData.signatures.ownerSignedAt 
              ? new Date(contractData.signatures.ownerSignedAt).toLocaleDateString('ro-RO') 
              : 'data necunoscută'}
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detalii Contract</CardTitle>
          <CardDescription>
            Proprietate: {contractData.property.address}, {contractData.property.city}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="prose max-w-none">
            <div className="bg-white border rounded-lg p-6 text-sm leading-relaxed whitespace-pre-wrap font-serif">
              {generateLeaseContractRo(contractData)}
            </div>
            <p className="text-sm text-gray-600 mt-4">
              Apasă &quot;Printează Contractul&quot; pentru a vedea contractul în format imprimabil.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Detalii Contract</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2">Informații Proprietar</h3>
              <dl className="space-y-1 text-sm">
                <dt className="text-gray-600">Nume:</dt>
                <dd>{contractData.owner.name || 'N/A'}</dd>
                <dt className="text-gray-600">Companie:</dt>
                <dd>{contractData.owner.companyName || 'N/A'}</dd>
                <dt className="text-gray-600">Nr. Înregistrare:</dt>
                <dd>{contractData.owner.companyRegNumber || 'N/A'}</dd>
                <dt className="text-gray-600">Cod Fiscal:</dt>
                <dd>{contractData.owner.companyFiscalCode || 'N/A'}</dd>
              </dl>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Informații Chiriaș</h3>
              <dl className="space-y-1 text-sm">
                <dt className="text-gray-600">Nume:</dt>
                <dd>{contractData.tenant.name || 'N/A'}</dd>
                <dt className="text-gray-600">CI:</dt>
                <dd>{contractData.tenant.idCardSeries && contractData.tenant.idCardNumber
                  ? `Seria ${contractData.tenant.idCardSeries} Nr. ${contractData.tenant.idCardNumber}`
                  : 'N/A'}</dd>
                <dt className="text-gray-600">CNP:</dt>
                <dd>{contractData.tenant.cnp || 'N/A'}</dd>
                <dt className="text-gray-600">Email:</dt>
                <dd>{contractData.tenant.email}</dd>
                <dt className="text-gray-600">Telefon:</dt>
                <dd>{contractData.tenant.phone || 'N/A'}</dd>
              </dl>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Termeni Contract</h3>
              <dl className="space-y-1 text-sm">
                <dt className="text-gray-600">Data Început:</dt>
                <dd>{new Date(contractData.lease.startDate).toLocaleDateString('ro-RO')}</dd>
                <dt className="text-gray-600">Data Sfârșit:</dt>
                <dd>{contractData.lease.endDate ? new Date(contractData.lease.endDate).toLocaleDateString('ro-RO') : ' Nedeterminată'}</dd>
                <dt className="text-gray-600">Chirie Lunară:</dt>
                <dd className="font-semibold">{contractData.lease.monthlyRent} RON</dd>
                <dt className="text-gray-600">Garanție:</dt>
                <dd>{contractData.lease.deposit || contractData.lease.monthlyRent} RON</dd>
              </dl>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Detalii Proprietate</h3>
              <dl className="space-y-1 text-sm">
                <dt className="text-gray-600">Adresă:</dt>
                <dd>{contractData.property.address}</dd>
                <dt className="text-gray-600">Oraș:</dt>
                <dd>{contractData.property.city}</dd>
                <dt className="text-gray-600">Tip:</dt>
                <dd>{contractData.property.type}</dd>
                <dt className="text-gray-600">Suprafață:</dt>
                <dd>{contractData.property.sqm} mp</dd>
              </dl>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
