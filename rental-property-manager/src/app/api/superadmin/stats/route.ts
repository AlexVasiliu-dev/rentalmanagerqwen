import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { prisma } from "@/lib/prisma"

// GET - Get system-wide statistics
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== "SUPERADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get all stats
    const [
      totalOwners,
      totalManagers,
      totalTenants,
      totalProperties,
      totalActiveLeases,
      totalBills,
      activeSubscriptions,
      paidSubscriptions
    ] = await Promise.all([
      prisma.user.count({ where: { role: "ADMIN" } }),
      prisma.user.count({ where: { role: "MANAGER" } }),
      prisma.user.count({ where: { role: "RENTER" } }),
      prisma.property.count(),
      prisma.lease.count({ where: { isActive: true } }),
      prisma.bill.aggregate({
        where: { paid: true },
        _sum: { amount: true }
      }),
      prisma.user.count({ 
        where: { 
          role: "ADMIN",
          subscriptionStatus: "active"
        }
      }),
      prisma.user.count({ 
        where: { 
          role: "ADMIN",
          subscriptionStatus: { in: ["active", "cancelled"] }
        }
      })
    ])

    const stats = {
      totalBusinesses: totalOwners,
      totalOwners,
      totalManagers,
      totalTenants,
      totalProperties,
      totalActiveLeases,
      totalRevenue: totalBills._sum.amount || 0,
      activeSubscriptions,
      paidSubscriptions,
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error("Error fetching superadmin stats:", error)
    return NextResponse.json(
      { error: "Failed to fetch statistics" },
      { status: 500 }
    )
  }
}
