import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const updateProfileSchema = z.object({
  name: z.string().optional(),
  phone: z.string().optional(),
  companyName: z.string().optional(),
  companyRegNumber: z.string().optional(),
  companyFiscalCode: z.string().optional(),
  workingEmail: z.string().email().optional().or(z.literal("")),
})

// GET - Get owner profile
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        name: true,
        phone: true,
        companyName: true,
        companyRegNumber: true,
        companyFiscalCode: true,
        workingEmail: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error("Error fetching owner profile:", error)
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    )
  }
}

// PUT - Update owner profile
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Neautorizat" }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = updateProfileSchema.parse(body)

    // Update user profile
    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: validatedData.name || null,
        phone: validatedData.phone || null,
        companyName: validatedData.companyName || null,
        companyRegNumber: validatedData.companyRegNumber || null,
        companyFiscalCode: validatedData.companyFiscalCode || null,
        workingEmail: validatedData.workingEmail || null,
      },
      select: {
        id: true,
        name: true,
        phone: true,
        companyName: true,
        companyRegNumber: true,
        companyFiscalCode: true,
        workingEmail: true,
      },
    })

    return NextResponse.json({ 
      message: "Profil salvat cu succes",
      user 
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }
    console.error("Error updating owner profile:", error)
    return NextResponse.json(
      { error: "Eroare la salvarea profilului" },
      { status: 500 }
    )
  }
}
