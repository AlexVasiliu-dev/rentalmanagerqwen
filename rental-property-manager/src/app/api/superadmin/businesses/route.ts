import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { prisma } from "@/lib/prisma"

// GET - Get all businesses (owners)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== "SUPERADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const businesses = await prisma.user.findMany({
      where: { 
        role: "ADMIN",
        ownerSlug: { not: null }
      },
      select: {
        id: true,
        ownerSlug: true,
        companyName: true,
        name: true,
        email: true,
        createdAt: true,
        subscriptionType: true,
        subscriptionStatus: true,
        subscriptionStart: true,
        subscriptionEnd: true,
        paidProperties: true,
        coveredProperties: true,
        managedProperties: {
          select: {
            id: true,
          }
        },
        rentedProperties: {
          where: { isActive: true },
          select: {
            id: true,
          }
        }
      },
      orderBy: { createdAt: "desc" }
    })

    // Format businesses list
    const formattedBusinesses = businesses.map(b => ({
      id: b.id,
      ownerSlug: b.ownerSlug,
      companyName: b.companyName || b.ownerSlug,
      ownerName: b.name,
      ownerEmail: b.email,
      propertiesCount: b.managedProperties.length,
      tenantsCount: b.rentedProperties.length,
      createdAt: b.createdAt.toISOString(),
      // Subscription info
      subscriptionType: b.subscriptionType || "free",
      subscriptionStatus: b.subscriptionStatus || "free",
      subscriptionStart: b.subscriptionStart?.toISOString() || null,
      subscriptionEnd: b.subscriptionEnd?.toISOString() || null,
      paidProperties: b.paidProperties || 0,
      coveredProperties: b.coveredProperties || 1,
    }))

    return NextResponse.json(formattedBusinesses)
  } catch (error) {
    console.error("Error fetching businesses:", error)
    return NextResponse.json(
      { error: "Failed to fetch businesses" },
      { status: 500 }
    )
  }
}
