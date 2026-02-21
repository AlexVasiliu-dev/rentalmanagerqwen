import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import bcrypt from "bcryptjs"

const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2).optional(),
  role: z.enum(["ADMIN", "MANAGER", "RENTER"]),
  approved: z.boolean().optional(),
  active: z.boolean().optional(),
  // Lease-specific fields (for tenants)
  propertyId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  monthlyRent: z.coerce.number().positive().optional(),
  deposit: z.coerce.number().positive().optional(),
})

// GET - List users (Admin only)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const role = searchParams.get("role")
    const approved = searchParams.get("approved")
    const active = searchParams.get("active")

    const where: Record<string, unknown> = {}

    if (role) where.role = role
    if (approved !== null) where.approved = approved === "true"
    if (active !== null) where.active = active === "true"

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        approved: true,
        active: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            rentedProperties: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(users)
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    )
  }
}

// POST - Create new user (Admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = createUserSchema.parse(body)

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 12)

    // Create user and optionally lease in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          email: validatedData.email,
          name: validatedData.name,
          password: hashedPassword,
          role: validatedData.role,
          approved: validatedData.approved ?? true,
          active: validatedData.active ?? true,
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          approved: true,
          active: true,
          createdAt: true,
        },
      })

      let leaseId: string | null = null

      // Create lease if property and dates are provided (for tenants)
      if (validatedData.propertyId && validatedData.startDate && validatedData.role === "RENTER") {
        // Check if property has an active lease
        const existingLease = await tx.lease.findFirst({
          where: {
            propertyId: validatedData.propertyId,
            isActive: true,
          },
        })

        if (existingLease) {
          throw new Error("Proprietatea are deja un contract activ")
        }

        // Get property details for rent info
        const property = await tx.property.findUnique({
          where: { id: validatedData.propertyId },
          select: { monthlyRent: true, deposit: true },
        })

        if (!property) {
          throw new Error("Proprietatea nu a fost găsită")
        }

        // Create lease
        await tx.lease.create({
          data: {
            propertyId: validatedData.propertyId,
            renterId: user.id,
            startDate: new Date(validatedData.startDate),
            endDate: validatedData.endDate ? new Date(validatedData.endDate) : null,
            monthlyRent: validatedData.monthlyRent || property.monthlyRent,
            deposit: validatedData.deposit || property.deposit,
            approvedBy: session.user.id,
            approvedAt: new Date(),
            ownerSigned: true, // Owner signs automatically when creating
            tenantSigned: false, // Tenant needs to sign
          },
        })

        leaseId = lease.id

        // Mark property as unavailable
        await tx.property.update({
          where: { id: validatedData.propertyId },
          data: { available: false },
        })
      }

      return { user, leaseId }
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "CREATE",
        entity: "User",
        entityId: result.user.id,
        details: { email: result.user.email, role: result.user.role, leaseId: result.leaseId },
      },
    })

    return NextResponse.json({
      message: "Chiriaș creat cu succes",
      user: result.user,
      leaseId: result.leaseId,
    }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }
    console.error("Error creating user:", error)
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    )
  }
}
