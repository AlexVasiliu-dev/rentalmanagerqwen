import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const imageSchema = z.object({
  propertyId: z.string(),
  url: z.string().url(),
  caption: z.string().optional(),
  isPrimary: z.boolean().optional(),
})

const updateImageSchema = z.object({
  caption: z.string().optional(),
  isPrimary: z.boolean().optional(),
  order: z.number().int().nonnegative().optional(),
})

// GET - List images for a property
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const propertyId = searchParams.get("propertyId")

    if (!propertyId) {
      return NextResponse.json({ error: "Property ID is required" }, { status: 400 })
    }

    // Check if user has access to this property
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      select: {
        id: true,
        managerId: true,
        leases: {
          where: { isActive: true },
          select: { renterId: true },
        },
      },
    })

    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 })
    }

    // Only ADMIN and MANAGER can see all images
    // RENTER can only see images of their rented property
    if (session.user.role === "RENTER") {
      const isRenterProperty = property.leases.some(lease => lease.renterId === session.user.id)
      if (!isRenterProperty) {
        return NextResponse.json({ error: "Access denied" }, { status: 403 })
      }
    }

    const images = await prisma.propertyImage.findMany({
      where: { propertyId },
      orderBy: { order: "asc" },
    })

    return NextResponse.json(images)
  } catch (error) {
    console.error("Error fetching property images:", error)
    return NextResponse.json(
      { error: "Failed to fetch property images" },
      { status: 500 }
    )
  }
}

// POST - Add image to property (ADMIN and MANAGER only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "MANAGER")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = imageSchema.parse(body)

    // Check if property exists
    const property = await prisma.property.findUnique({
      where: { id: validatedData.propertyId },
    })

    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 })
    }

    // Managers can only add images to properties they manage
    if (session.user.role === "MANAGER" && property.managerId !== session.user.id) {
      return NextResponse.json({ error: "You can only manage your assigned properties" }, { status: 403 })
    }

    // Count existing images (max 10)
    const existingCount = await prisma.propertyImage.count({
      where: { propertyId: validatedData.propertyId },
    })

    if (existingCount >= 10) {
      return NextResponse.json(
        { error: "Maximum 10 images allowed per property" },
        { status: 400 }
      )
    }

    // If this is the first image or isPrimary is true, make it primary and unset others
    const isPrimary = validatedData.isPrimary ?? existingCount === 0
    const order = existingCount

    if (isPrimary) {
      await prisma.propertyImage.updateMany({
        where: { propertyId: validatedData.propertyId, isPrimary: true },
        data: { isPrimary: false },
      })
    }

    const image = await prisma.propertyImage.create({
      data: {
        propertyId: validatedData.propertyId,
        url: validatedData.url,
        caption: validatedData.caption,
        isPrimary,
        order,
      },
    })

    return NextResponse.json(image, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }
    console.error("Error creating property image:", error)
    return NextResponse.json(
      { error: "Failed to create property image" },
      { status: 500 }
    )
  }
}

// PATCH - Update image (ADMIN and MANAGER only)
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "MANAGER")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Image ID is required" }, { status: 400 })
    }

    const body = await request.json()
    const validatedData = updateImageSchema.parse(body)

    const image = await prisma.propertyImage.findUnique({
      where: { id },
      include: { property: true },
    })

    if (!image) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 })
    }

    // Managers can only edit images of properties they manage
    if (session.user.role === "MANAGER" && image.property.managerId !== session.user.id) {
      return NextResponse.json({ error: "You can only manage your assigned properties" }, { status: 403 })
    }

    // If setting as primary, unset other primaries
    if (validatedData.isPrimary === true) {
      await prisma.propertyImage.updateMany({
        where: { propertyId: image.propertyId, isPrimary: true, id: { not: id } },
        data: { isPrimary: false },
      })
    }

    const updatedImage = await prisma.propertyImage.update({
      where: { id },
      data: validatedData,
    })

    return NextResponse.json(updatedImage)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }
    console.error("Error updating property image:", error)
    return NextResponse.json(
      { error: "Failed to update property image" },
      { status: 500 }
    )
  }
}

// DELETE - Remove image (ADMIN and MANAGER only)
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "MANAGER")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Image ID is required" }, { status: 400 })
    }

    const image = await prisma.propertyImage.findUnique({
      where: { id },
      include: { property: true },
    })

    if (!image) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 })
    }

    // Managers can only delete images of properties they manage
    if (session.user.role === "MANAGER" && image.property.managerId !== session.user.id) {
      return NextResponse.json({ error: "You can only manage your assigned properties" }, { status: 403 })
    }

    await prisma.propertyImage.delete({
      where: { id },
    })

    // If this was the primary image, set the first remaining image as primary
    if (image.isPrimary) {
      const firstRemaining = await prisma.propertyImage.findFirst({
        where: { propertyId: image.propertyId },
        orderBy: { order: "asc" },
      })

      if (firstRemaining) {
        await prisma.propertyImage.update({
          where: { id: firstRemaining.id },
          data: { isPrimary: true },
        })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting property image:", error)
    return NextResponse.json(
      { error: "Failed to delete property image" },
      { status: 500 }
    )
  }
}
