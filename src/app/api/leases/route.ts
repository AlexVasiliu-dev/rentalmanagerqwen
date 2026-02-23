import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const leaseSchema = z.object({
  propertyId: z.string(),
  renterId: z.string(),
  startDate: z.string(),
  endDate: z.string().optional(),
  monthlyRent: z.coerce.number().positive(),
  deposit: z.coerce.number().positive().optional(),
})

// GET - List leases
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const propertyId = searchParams.get("propertyId")
    const renterId = searchParams.get("renterId")
    const isActive = searchParams.get("isActive")

    const where: Record<string, unknown> = {}

    if (propertyId) where.propertyId = propertyId
    if (renterId) where.renterId = renterId
    if (isActive !== null) where.isActive = isActive === "true"

    // Renters can only see their own leases
    if (session.user.role === "RENTER") {
      where.renterId = session.user.id
    }
    // Managers can only see leases for their properties
    else if (session.user.role === "MANAGER") {
      const managerProperties = await prisma.property.findMany({
        where: { managerId: session.user.id },
        select: { id: true },
      })
      const propertyIds = managerProperties.map((p) => p.id)
      where.propertyId = { in: propertyIds }
    }

    const leases = await prisma.lease.findMany({
      where,
      include: {
        property: {
          select: {
            id: true,
            address: true,
            city: true,
            type: true,
          },
        },
        renter: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { startDate: "desc" },
    })

    return NextResponse.json(leases)
  } catch (error) {
    console.error("Error fetching leases:", error)
    return NextResponse.json(
      { error: "Failed to fetch leases" },
      { status: 500 }
    )
  }
}

// POST - Create lease
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = leaseSchema.parse(body)

    // Check if renter is approved
    const renter = await prisma.user.findUnique({
      where: { id: validatedData.renterId },
      select: { approved: true, active: true },
    })

    if (!renter?.approved) {
      return NextResponse.json(
        { error: "Renter must be approved first" },
        { status: 400 }
      )
    }

    if (!renter.active) {
      return NextResponse.json(
        { error: "Renter account is not active" },
        { status: 400 }
      )
    }

    // Check for overlapping lease
    const existingLease = await prisma.lease.findFirst({
      where: {
        propertyId: validatedData.propertyId,
        isActive: true,
      },
    })

    if (existingLease) {
      return NextResponse.json(
        { error: "Property already has an active lease" },
        { status: 400 }
      )
    }

    const lease = await prisma.lease.create({
      data: {
        ...validatedData,
        startDate: new Date(validatedData.startDate),
        endDate: validatedData.endDate ? new Date(validatedData.endDate) : null,
        approvedBy: session.user.id,
        approvedAt: new Date(),
        ownerSigned: true,
        tenantSigned: false,
      },
      include: {
        property: {
          select: {
            address: true,
            city: true,
            type: true,
          },
        },
        renter: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "CREATE",
        entity: "Lease",
        entityId: lease.id,
        details: { propertyId: lease.propertyId, renterId: lease.renterId },
      },
    })

    return NextResponse.json(lease, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }
    console.error("Error creating lease:", error)
    return NextResponse.json(
      { error: "Failed to create lease" },
      { status: 500 }
    )
  }
}
