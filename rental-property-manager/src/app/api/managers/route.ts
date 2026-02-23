import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import bcrypt from "bcryptjs"

const createManagerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2).optional(),
  phone: z.string().optional(),
  role: z.literal("MANAGER"),
  propertyIds: z.array(z.string()).optional(),
})

// POST - Create new manager (Admin/Owner only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = createManagerSchema.parse(body)

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "Există deja un utilizator cu acest email" },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 12)

    // Create manager user
    const manager = await prisma.user.create({
      data: {
        email: validatedData.email,
        password: hashedPassword,
        name: validatedData.name,
        phone: validatedData.phone,
        role: "MANAGER",
        approved: true, // Auto-approved by owner
        active: true,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
      },
    })

    // Assign properties to manager if provided
    if (validatedData.propertyIds && validatedData.propertyIds.length > 0) {
      await prisma.property.updateMany({
        where: {
          id: { in: validatedData.propertyIds },
          managerId: session.user.id, // Ensure owner only assigns their own properties
        },
        data: {
          managerId: manager.id,
        },
      })
    }

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "CREATE",
        entity: "Manager",
        entityId: manager.id,
        details: { email: manager.email, name: manager.name },
      },
    })

    return NextResponse.json(
      {
        message: "Manager creat cu succes!",
        manager,
      },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }
    console.error("Error creating manager:", error)
    return NextResponse.json(
      { error: "A apărut o eroare la crearea managerului" },
      { status: 500 }
    )
  }
}
