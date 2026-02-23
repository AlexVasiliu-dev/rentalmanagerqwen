import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const meterSchema = z.object({
  propertyId: z.string(),
  type: z.enum(["ELECTRICITY", "WATER", "GAS"]),
  serialNumber: z.string().optional(),
  location: z.string().optional(),
  pricePerUnit: z.coerce.number().positive(),
})

// GET - List meters
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const propertyId = searchParams.get("propertyId")

    const where: Record<string, unknown> = {}
    if (propertyId) where.propertyId = propertyId

    const meters = await prisma.meter.findMany({
      where,
      include: {
        property: {
          select: {
            id: true,
            address: true,
            city: true,
          },
        },
        readings: {
          orderBy: { readingDate: "desc" },
          take: 1,
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(meters)
  } catch (error) {
    console.error("Error fetching meters:", error)
    return NextResponse.json(
      { error: "Failed to fetch meters" },
      { status: 500 }
    )
  }
}

// POST - Create meter (Admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = meterSchema.parse(body)

    // Check if meter type already exists for property
    const existingMeter = await prisma.meter.findUnique({
      where: {
        propertyId_type: {
          propertyId: validatedData.propertyId,
          type: validatedData.type,
        },
      },
    })

    if (existingMeter) {
      return NextResponse.json(
        { error: `Meter of type ${validatedData.type} already exists for this property` },
        { status: 400 }
      )
    }

    const meter = await prisma.meter.create({
      data: validatedData,
      include: {
        property: {
          select: {
            address: true,
            city: true,
          },
        },
      },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "CREATE",
        entity: "Meter",
        entityId: meter.id,
        details: { type: meter.type, propertyId: meter.propertyId },
      },
    })

    return NextResponse.json(meter, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }
    console.error("Error creating meter:", error)
    return NextResponse.json(
      { error: "Failed to create meter" },
      { status: 500 }
    )
  }
}
