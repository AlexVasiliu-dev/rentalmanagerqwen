import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const contactOwnerSchema = z.object({
  propertyId: z.string(),
  subject: z.string().min(1, "Subject is required"),
  message: z.string().min(1, "Message is required"),
  tenantName: z.string().optional(),
  tenantEmail: z.string().email().optional(),
})

// POST - Send message to property owner
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = contactOwnerSchema.parse(body)

    // Get property details with owner info
    const property = await prisma.property.findUnique({
      where: { id: validatedData.propertyId },
      include: {
        manager: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 })
    }

    // Verify the user is a tenant of this property
    if (session.user.role === "RENTER") {
      const lease = await prisma.lease.findFirst({
        where: {
          renterId: session.user.id,
          propertyId: validatedData.propertyId,
          isActive: true,
        },
      })

      if (!lease) {
        return NextResponse.json(
          { error: "You can only contact the owner of your rented property" },
          { status: 403 }
        )
      }
    }

    // Get owner details (through owner slug or admin)
    const owner = await prisma.user.findFirst({
      where: {
        ownerSlug: property.manager?.id ? undefined : session.user.id,
        OR: [
          { id: property.managerId || "" },
          { role: "ADMIN" },
        ],
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    })

    if (!owner) {
      return NextResponse.json(
        { error: "Owner not found" },
        { status: 404 }
      )
    }

    // Create contact message record
    const contactMessage = await prisma.contactMessage.create({
      data: {
        propertyId: validatedData.propertyId,
        senderId: session.user.id,
        recipientId: owner.id,
        subject: validatedData.subject,
        message: validatedData.message,
        status: "PENDING",
      },
      include: {
        sender: {
          select: { name: true, email: true },
        },
        property: {
          select: { address: true, city: true },
        },
      },
    })

    // TODO: Send email to owner (integrate with email service)
    // For now, just log it
    console.log("Contact message created:", {
      to: owner.email,
      subject: `[RentManager] ${validatedData.subject}`,
      from: session.user.email,
    })

    return NextResponse.json({
      success: true,
      message: "Your message has been sent to the property owner",
      messageId: contactMessage.id,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }
    console.error("Error sending contact message:", error)
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    )
  }
}

// GET - Get contact messages for a property (for owners)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const propertyId = searchParams.get("propertyId")

    // Only owners/admins can view messages
    if (session.user.role !== "ADMIN" && session.user.role !== "MANAGER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const where: Record<string, unknown> = {
      recipientId: session.user.id,
    }

    if (propertyId) {
      where.propertyId = propertyId
    }

    const messages = await prisma.contactMessage.findMany({
      where,
      include: {
        sender: {
          select: { id: true, name: true, email: true },
        },
        property: {
          select: { address: true, city: true },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(messages)
  } catch (error) {
    console.error("Error fetching contact messages:", error)
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    )
  }
}
