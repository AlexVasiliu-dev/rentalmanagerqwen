import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { z } from "zod"

const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  role: z.enum(["ADMIN", "MANAGER", "RENTER"]).optional(),
  // For owners - generate unique slug
  ownerSlug: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = registerSchema.parse(body)

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      )
    }

    // Check if ownerSlug is already taken (for owners)
    if (validatedData.ownerSlug) {
      const existingSlug = await prisma.user.findUnique({
        where: { ownerSlug: validatedData.ownerSlug },
      })
      if (existingSlug) {
        return NextResponse.json(
          { error: "This owner URL is already taken. Try a different one." },
          { status: 400 }
        )
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 12)

    // Determine role - map "OWNER" to "ADMIN"
    const role = validatedData.role === "ADMIN" ? "ADMIN" : (validatedData.role || "RENTER")
    
    // Create user data
    const userData: Record<string, unknown> = {
      email: validatedData.email,
      password: hashedPassword,
      name: validatedData.name,
      role: role,
      approved: role === "ADMIN" || false, // Auto-approve admins, others need approval
      active: true,
    }

    // Add ownerSlug for owners
    if (role === "ADMIN" && validatedData.ownerSlug) {
      userData.ownerSlug = validatedData.ownerSlug
    }

    // Create user
    const user = await prisma.user.create({
      data: userData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        approved: true,
        ownerSlug: true,
        createdAt: true,
      },
    })

    return NextResponse.json(
      {
        message: role === "ADMIN" 
          ? "Registration successful. Your owner profile has been created!"
          : "Registration successful. Please wait for approval.",
        user,
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

    console.error("Registration error:", error)
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}
