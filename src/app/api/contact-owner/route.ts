import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const contactOwnerSchema = z.object({
  propertyId: z.string(),
  subject: z.string().min(1, "Subject is required"),
  message: z.string().min(10, "Message must be at least 10 characters"),
  tenantName: z.string().optional(),
  tenantEmail: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = contactOwnerSchema.parse(body)

    // Get property details to find the owner
    const property = await prisma.property.findUnique({
      where: { id: validatedData.propertyId },
      select: {
        id: true,
        address: true,
        city: true,
        manager: {
          select: {
            id: true,
            name: true,
            email: true,
            workingEmail: true,
          },
        },
      },
    })

    if (!property) {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 }
      )
    }

    // Determine owner email (use workingEmail if available, otherwise manager email)
    const ownerEmail = property.manager?.workingEmail || property.manager?.email

    if (!ownerEmail) {
      return NextResponse.json(
        { error: "Owner contact information not available" },
        { status: 400 }
      )
    }

    // Create message record in database
    const message = await prisma.mesaj.create({
      data: {
        expeditorId: validatedData.tenantEmail || "anonymous", // Will be updated when user is authenticated
        destinatarId: property.manager?.id || "",
        subiect: validatedData.subject,
        continut: `
Property: ${property.address}, ${property.city}

From: ${validatedData.tenantName || "Anonymous"} (${validatedData.tenantEmail || "No email"})

Message:
${validatedData.message}
        `.trim(),
      },
    })

    // TODO: Send email notification to owner
    // This would use a service like SendGrid, Resend, or nodemailer

    return NextResponse.json({
      message: "Message sent successfully",
      messageId: message.id,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error("Contact owner error:", error)
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    )
  }
}
