import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const propertySchema = z.object({
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  country: z.string().optional(),
  postalCode: z.string().optional(),
  type: z.string().min(1, "Property type is required"),
  sqm: z.coerce.number().positive("SQM must be positive"),
  rooms: z.coerce.number().int().positive().optional(),
  floor: z.coerce.number().int().optional(),
  description: z.string().optional(),
  monthlyRent: z.coerce.number().positive("Monthly rent must be positive"),
  deposit: z.coerce.number().positive().optional(),
  utilitiesIncluded: z.boolean().optional(),
  managerId: z.string().optional(),
})

// GET - List all properties (with filters)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const available = searchParams.get("available")
    const type = searchParams.get("type")

    const where: Record<string, unknown> = {}

    if (available !== null) {
      where.available = available === "true"
    }

    if (type) {
      where.type = type
    }

    // Renters can ONLY see their rented property
    if (session.user.role === "RENTER") {
      const userLease = await prisma.lease.findFirst({
        where: {
          renterId: session.user.id,
          isActive: true,
        },
        select: { propertyId: true }
      })

      if (userLease) {
        where.id = userLease.propertyId
      } else {
        return NextResponse.json([])
      }
    }
    // Managers only see properties assigned to them
    else if (session.user.role === "MANAGER") {
      where.managerId = session.user.id
    }
    // ADMIN (owners) see ALL properties in the system

    const properties = await prisma.property.findMany({
      where,
      include: {
        images: {
          orderBy: { order: "asc" },
        },
        manager: {
          select: { id: true, name: true, email: true },
        },
        leases: {
          where: { isActive: true },
          include: {
            renter: {
              select: { id: true, name: true, email: true, phone: true },
            },
          },
          take: 1,
        },
        _count: {
          select: { leases: true },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(properties)
  } catch (error) {
    console.error("Error fetching properties:", error)
    return NextResponse.json(
      { error: "Failed to fetch properties" },
      { status: 500 }
    )
  }
}

// POST - Create new property (Admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = propertySchema.parse(body)

    // Check user's subscription and property count
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        subscriptionType: true,
        subscriptionStatus: true,
        subscriptionEnd: true,
        coveredProperties: true,
        managedProperties: {
          select: { id: true },
        },
      },
    })

    const currentPropertyCount = user?.managedProperties.length || 0
    const isAddingSecondProperty = currentPropertyCount === 1

    // Check if user has reached their limit
    if (currentPropertyCount >= (user?.coveredProperties || 1)) {
      return NextResponse.json(
        { 
          error: "Subscription limit reached",
          requiresUpgrade: true,
          currentProperties: currentPropertyCount,
          maxProperties: user?.coveredProperties || 1,
        },
        { status: 403 }
      )
    }

    const property = await prisma.property.create({
      data: {
        ...validatedData,
        managerId: session.user.id,
        images: body.images
          ? {
              create: body.images.map((img: { url: string; caption?: string }, index: number) => ({
                url: img.url,
                caption: img.caption,
                isPrimary: index === 0,
                order: index,
              }))
            }
          : undefined,
      },
      include: {
        images: true,
        manager: {
          select: { id: true, name: true, email: true },
        },
      },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "CREATE",
        entity: "Property",
        entityId: property.id,
        details: { address: property.address },
      },
    })

    // Return trial info if this is the 2nd property
    if (isAddingSecondProperty && user?.subscriptionType === "trial") {
      return NextResponse.json({
        ...property,
        trialInfo: {
          isTrial: true,
          trialEnd: user.subscriptionEnd,
          daysRemaining: Math.ceil((user.subscriptionEnd!.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
          message: "Ai adăugat a 2-a proprietate! Perioada de probă de 15 zile este activă.",
        },
      }, { status: 201 })
    }

    return NextResponse.json(property, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }
    console.error("Error creating property:", error)
    return NextResponse.json(
      { error: "Failed to create property" },
      { status: 500 }
    )
  }
}
