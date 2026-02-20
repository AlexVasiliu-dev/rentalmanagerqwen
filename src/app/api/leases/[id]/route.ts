import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { prisma } from "@/lib/prisma"

// PATCH - Update lease (end lease, update status)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { isActive, endDate, depositReturned } = body

    const lease = await prisma.lease.update({
      where: { id: params.id },
      data: {
        isActive: isActive !== undefined ? isActive : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        depositReturned: depositReturned !== undefined ? depositReturned : undefined,
      },
      include: {
        property: {
          select: {
            address: true,
            city: true,
          },
        },
        renter: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    // If lease is ended, deactivate the renter
    if (isActive === false && session.user.role === "ADMIN") {
      await prisma.user.update({
        where: { id: lease.renterId },
        data: { active: false },
      })
    }

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "UPDATE",
        entity: "Lease",
        entityId: params.id,
        details: { isActive, endDate, depositReturned },
      },
    })

    return NextResponse.json(lease)
  } catch (error) {
    console.error("Error updating lease:", error)
    return NextResponse.json(
      { error: "Failed to update lease" },
      { status: 500 }
    )
  }
}

// DELETE - Delete lease
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await prisma.lease.delete({
      where: { id: params.id },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "DELETE",
        entity: "Lease",
        entityId: params.id,
      },
    })

    return NextResponse.json({ message: "Lease deleted" })
  } catch (error) {
    console.error("Error deleting lease:", error)
    return NextResponse.json(
      { error: "Failed to delete lease" },
      { status: 500 }
    )
  }
}
