import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const billSchema = z.object({
  leaseId: z.string().optional(),
  type: z.string(),
  description: z.string().optional(),
  amount: z.coerce.number().positive(),
  currency: z.string().optional(),
  periodStart: z.string(),
  periodEnd: z.string(),
  dueDate: z.string(),
  meterReadingsBreakdown: z.any().optional(),
})

// GET - List bills
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const leaseId = searchParams.get("leaseId")
    const paid = searchParams.get("paid")
    const limit = parseInt(searchParams.get("limit") || "50")

    const where: Record<string, unknown> = {}

    if (leaseId) where.leaseId = leaseId
    if (paid !== null) where.paid = paid === "true"

    // Renters can only see their own bills
    if (session.user.role === "RENTER") {
      const leases = await prisma.lease.findMany({
        where: { renterId: session.user.id },
        select: { id: true },
      })
      const leaseIds = leases.map((l) => l.id)
      where.leaseId = { in: leaseIds }
    }

    const bills = await prisma.bill.findMany({
      where,
      include: {
        lease: {
          select: {
            id: true,
            property: {
              select: {
                id: true,
                address: true,
                city: true,
              },
            },
            renter: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
      orderBy: { periodEnd: "desc" },
      take: limit,
    })

    return NextResponse.json(bills)
  } catch (error) {
    console.error("Error fetching bills:", error)
    return NextResponse.json(
      { error: "Failed to fetch bills" },
      { status: 500 }
    )
  }
}

// POST - Create bill
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "MANAGER")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = billSchema.parse(body)

    const bill = await prisma.bill.create({
      data: {
        leaseId: validatedData.leaseId,
        type: validatedData.type,
        description: validatedData.description,
        amount: validatedData.amount,
        currency: validatedData.currency || "RON",
        periodStart: new Date(validatedData.periodStart),
        periodEnd: new Date(validatedData.periodEnd),
        dueDate: new Date(validatedData.dueDate),
        meterReadingsBreakdown: validatedData.meterReadingsBreakdown,
        paid: false,
      },
      include: {
        lease: {
          select: {
            id: true,
            property: {
              select: {
                address: true,
                city: true,
              },
            },
            renter: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
    })

    return NextResponse.json(bill, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }
    console.error("Error creating bill:", error)
    return NextResponse.json(
      { error: "Failed to create bill" },
      { status: 500 }
    )
  }
}
