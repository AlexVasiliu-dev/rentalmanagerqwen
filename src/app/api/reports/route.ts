import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { prisma } from "@/lib/prisma"

// GET - Get financial reports
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "MANAGER")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const propertyId = searchParams.get("propertyId")
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    const where: Record<string, unknown> = {}
    if (propertyId) {
      where.propertyId = propertyId
    }

    // If manager, limit to their properties
    if (session.user.role === "MANAGER") {
      const managerProperties = await prisma.property.findMany({
        where: { managerId: session.user.id },
        select: { id: true },
      })
      const propertyIds = managerProperties.map((p) => p.id)
      where.propertyId = { in: propertyIds }
    }

    // Get income from bills (paid only)
    const incomeQuery = await prisma.bill.groupBy({
      by: ["type"],
      where: {
        ...where,
        paid: true,
        periodStart: startDate ? new Date(startDate) : undefined,
        periodEnd: endDate ? new Date(endDate) : undefined,
      },
      _sum: {
        amount: true,
      },
    })

    // Get expenses
    const expensesQuery = await prisma.expense.groupBy({
      by: ["category"],
      where: {
        date: startDate ? new Date(startDate) : undefined,
        ...(endDate && { date: { lte: new Date(endDate) } }),
      },
      _sum: {
        amount: true,
      },
    })

    // Get total unpaid bills
    const unpaidBills = await prisma.bill.aggregate({
      where: {
        ...where,
        paid: false,
      },
      _sum: {
        amount: true,
      },
    })

    // Get active leases count
    const activeLeases = await prisma.lease.count({
      where: {
        isActive: true,
        ...(propertyId && { propertyId }),
      },
    })

    // Calculate totals
    const totalIncome = incomeQuery.reduce(
      (sum, item) => sum + (item._sum.amount || 0),
      0
    )
    const totalExpenses = expensesQuery.reduce(
      (sum, item) => sum + (item._sum.amount || 0),
      0
    )
    const netIncome = totalIncome - totalExpenses

    return NextResponse.json({
      income: {
        byType: incomeQuery.map((item) => ({
          type: item.type,
          total: item._sum.amount || 0,
        })),
        total: totalIncome,
      },
      expenses: {
        byCategory: expensesQuery.map((item) => ({
          category: item.category,
          total: item._sum.amount || 0,
        })),
        total: totalExpenses,
      },
      netIncome,
      unpaidBills: unpaidBills._sum.amount || 0,
      activeLeases,
      period: {
        start: startDate,
        end: endDate,
      },
    })
  } catch (error) {
    console.error("Error fetching reports:", error)
    return NextResponse.json(
      { error: "Failed to fetch reports" },
      { status: 500 }
    )
  }
}
