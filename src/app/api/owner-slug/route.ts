import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const slugSchema = z.object({
  slug: z.string().min(3).max(50).regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
})

// POST - Create or update owner slug
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = slugSchema.parse(body)

    // Check if slug is already taken
    const existingUser = await prisma.user.findUnique({
      where: { ownerSlug: validatedData.slug },
    })

    if (existingUser && existingUser.id !== session.user.id) {
      return NextResponse.json(
        { error: "This owner link is already taken" },
        { status: 400 }
      )
    }

    // Update user with slug
    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: { ownerSlug: validatedData.slug },
      select: {
        id: true,
        email: true,
        name: true,
        ownerSlug: true,
      },
    })

    const ownerUrl = `${process.env.APP_URL || "https://Property_mngmt.com"}/owner/${user.ownerSlug}`

    return NextResponse.json({
      message: "Owner link created successfully",
      ownerUrl,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        ownerSlug: user.ownerSlug,
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }
    console.error("Error creating owner slug:", error)
    return NextResponse.json(
      { error: "Failed to create owner link" },
      { status: 500 }
    )
  }
}

// GET - Get owner by slug (public endpoint)
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const user = await prisma.user.findUnique({
      where: { ownerSlug: params.slug },
      select: {
        id: true,
        name: true,
        email: true,
        subscription: {
          select: {
            status: true,
            coveredProperties: true,
            paidProperties: true,
          },
        },
        _count: {
          select: {
            managedProperties: true,
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: "Owner not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      owner: {
        name: user.name || user.email,
        subscriptionStatus: user.subscription?.status || "INACTIVE",
        propertiesManaged: user._count.managedProperties,
        maxProperties: user.subscription?.coveredProperties || 1,
      },
    })
  } catch (error) {
    console.error("Error fetching owner:", error)
    return NextResponse.json(
      { error: "Failed to fetch owner" },
      { status: 500 }
    )
  }
}
