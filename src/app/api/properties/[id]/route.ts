import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const propertySchema = z.object({
  address: z.string().min(1).optional(),
  city: z.string().min(1).optional(),
  country: z.string().optional(),
  postalCode: z.string().optional(),
  type: z.string().min(1).optional(),
  sqm: z.coerce.number().positive().optional(),
  rooms: z.coerce.number().int().positive().optional(),
  floor: z.coerce.number().int().optional(),
  description: z.string().optional(),
  monthlyRent: z.coerce.number().positive().optional(),
  deposit: z.coerce.number().positive().optional(),
  utilitiesIncluded: z.boolean().optional(),
  available: z.boolean().optional(),
  managerId: z.string().optional().nullable(),
})

// GET - Get single property
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const property = await prisma.property.findUnique({
      where: { id: params.id },
      include: {
        images: {
          orderBy: { order: "asc" },
        },
        manager: {
          select: { id: true, name: true, email: true },
        },
        meters: {
          include: {
            readings: {
              orderBy: { readingDate: "desc" },
              take: 10,
            },
          },
        },
        leases: {
          where: { isActive: true },
          include: {
            renter: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
    })

    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 })
    }

    // Check permissions
    if (
      session.user.role === "MANAGER" &&
      property.managerId !== session.user.id
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    return NextResponse.json(property)
  } catch (error) {
    console.error("Error fetching property:", error)
    return NextResponse.json(
      { error: "Failed to fetch property" },
      { status: 500 }
    )
  }
}

// PUT - Update property
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = propertySchema.parse(body)

    const property = await prisma.property.update({
      where: { id: params.id },
      data: validatedData,
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
        action: "UPDATE",
        entity: "Property",
        entityId: property.id,
        details: { changes: validatedData },
      },
    })

    return NextResponse.json(property)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }
    console.error("Error updating property:", error)
    return NextResponse.json(
      { error: "Failed to update property" },
      { status: 500 }
    )
  }
}

// DELETE - Delete property
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await prisma.property.delete({
      where: { id: params.id },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "DELETE",
        entity: "Property",
        entityId: params.id,
      },
    })

    return NextResponse.json({ message: "Property deleted" })
  } catch (error) {
    console.error("Error deleting property:", error)
    return NextResponse.json(
      { error: "Failed to delete property" },
      { status: 500 }
    )
  }
}
