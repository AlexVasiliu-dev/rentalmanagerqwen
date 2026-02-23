import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { prisma } from "@/lib/prisma"

// GET - Get all invoices/subscriptions
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== "SUPERADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const companies = await prisma.user.findMany({
      where: { 
        role: "ADMIN",
        ownerSlug: { not: null }
      },
      select: {
        id: true,
        ownerSlug: true,
        companyName: true,
        createdAt: true,
        subscriptionType: true,
        subscriptionStatus: true,
        subscriptionStart: true,
        subscriptionEnd: true,
        coveredProperties: true,
      },
      orderBy: { createdAt: "desc" }
    })

    // Format as invoices
    const invoices = companies.map(company => {
      // Calculate amount based on subscription type
      let amount = 0
      if (company.subscriptionType === "monthly") {
        amount = 50
      } else if (company.subscriptionType === "yearly") {
        amount = 250
      }

      return {
        id: company.id,
        companySlug: company.ownerSlug,
        companyName: company.companyName || company.ownerSlug,
        subscriptionType: company.subscriptionType || "free",
        amount: amount,
        currency: "EUR",
        status: company.subscriptionStatus || "free",
        startDate: company.subscriptionStart?.toISOString() || company.createdAt.toISOString(),
        endDate: company.subscriptionEnd?.toISOString() || "",
        createdAt: company.createdAt.toISOString(),
        paidAt: company.subscriptionStatus === "active" ? company.subscriptionStart?.toISOString() : null,
      }
    })

    return NextResponse.json(invoices)
  } catch (error) {
    console.error("Error fetching invoices:", error)
    return NextResponse.json(
      { error: "Failed to fetch invoices" },
      { status: 500 }
    )
  }
}
