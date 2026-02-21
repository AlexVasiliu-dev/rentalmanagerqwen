import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { prisma } from "@/lib/prisma"

// GET - Get lease details for contract generation
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const lease = await prisma.lease.findUnique({
      where: { id: params.id },
      include: {
        property: {
          select: {
            address: true,
            city: true,
            country: true,
            type: true,
            sqm: true,
            rooms: true,
            floor: true,
          },
        },
        renter: {
          select: {
            name: true,
            email: true,
            phone: true,
          },
        },
        property: {
          select: {
            manager: {
              select: {
                name: true,
                phone: true,
                workingEmail: true,
                email: true,
                companyName: true,
                companyRegNumber: true,
                companyFiscalCode: true,
              },
            },
          },
        },
      },
    })

    if (!lease) {
      return NextResponse.json({ error: "Lease not found" }, { status: 404 })
    }

    // Check permissions
    if (
      session.user.role === "RENTER" &&
      lease.renterId !== session.user.id
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Format contract data
    const contractData = {
      owner: {
        name: lease.property.manager?.name,
        companyName: lease.property.manager?.companyName,
        companyRegNumber: lease.property.manager?.companyRegNumber,
        companyFiscalCode: lease.property.manager?.companyFiscalCode,
        workingEmail: lease.property.manager?.workingEmail,
        phone: lease.property.manager?.phone,
      },
      tenant: {
        name: lease.renter.name,
        email: lease.renter.email,
        phone: lease.renter.phone,
      },
      property: {
        address: lease.property.address,
        city: lease.property.city,
        country: lease.property.country || "Romania",
        type: lease.property.type,
        sqm: lease.property.sqm,
        rooms: lease.property.rooms,
        floor: lease.property.floor,
      },
      lease: {
        startDate: lease.startDate.toISOString(),
        endDate: lease.endDate?.toISOString() || null,
        monthlyRent: lease.monthlyRent,
        deposit: lease.deposit,
        paymentDay: 5, // Default payment day
      },
    }

    return NextResponse.json(contractData)
  } catch (error) {
    console.error("Error fetching lease contract:", error)
    return NextResponse.json(
      { error: "Failed to fetch contract" },
      { status: 500 }
    )
  }
}

// PATCH - Update lease (end lease, mark as signed, etc.)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Neautorizat" }, { status: 401 })
    }

    const body = await request.json()
    const { isActive, endDate, tenantSigned, signedAt } = body

    const updateData: Record<string, unknown> = {}
    if (isActive !== undefined) updateData.isActive = isActive
    if (endDate !== undefined) updateData.endDate = endDate ? new Date(endDate) : null
    if (tenantSigned !== undefined) updateData.tenantSigned = tenantSigned
    if (signedAt !== undefined) updateData.signedAt = signedAt ? new Date(signedAt) : null

    const lease = await prisma.lease.update({
      where: { id: params.id },
      data: updateData,
    })

    // If lease is ended, mark property as available again
    if (isActive === false) {
      await prisma.property.update({
        where: { id: lease.propertyId },
        data: { available: true },
      })
    }

    return NextResponse.json(lease)
  } catch (error) {
    console.error("Error updating lease:", error)
    return NextResponse.json(
      { error: "Eroare la actualizarea contractului" },
      { status: 500 }
    )
  }
}
