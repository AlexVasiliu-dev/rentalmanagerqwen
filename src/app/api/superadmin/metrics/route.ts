import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { prisma } from "@/lib/prisma"

// GET - Get system metrics
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== "SUPERADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get counts
    const [
      totalUsers,
      activeUsers,
      failedLogins
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { active: true } }),
      prisma.auditLog.count({ 
        where: {
          action: "LOGIN_FAILED",
          createdAt: {
            gte: new Date(new Date().setHours(new Date().getHours() - 24))
          }
        }
      })
    ])

    // Calculate uptime (mock - in production use server metrics)
    const uptime = process.uptime()
    const days = Math.floor(uptime / 86400)
    const hours = Math.floor((uptime % 86400) / 3600)
    const uptimeString = `${days}d ${hours}h`

    const metrics = {
      uptime: uptimeString,
      totalUsers,
      activeUsers,
      failedLogins,
      errorsLast24h: 0, // Would come from error logging service
      databaseStatus: "connected",
      apiStatus: "operational",
    }

    return NextResponse.json(metrics)
  } catch (error) {
    console.error("Error fetching metrics:", error)
    return NextResponse.json(
      { error: "Failed to fetch metrics" },
      { status: 500 }
    )
  }
}
