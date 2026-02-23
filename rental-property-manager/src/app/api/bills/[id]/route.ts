import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { prisma } from "@/lib/prisma"

// PATCH - Mark bill as paid
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
    const { paid } = body

    const bill = await prisma.bill.update({
      where: { id: params.id },
      data: {
        paid: paid === true,
        paidAt: paid === true ? new Date() : null,
      },
      include: {
        lease: {
          select: {
            property: {
              select: {
                address: true,
                city: true,
              },
            },
            renter: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "UPDATE",
        entity: "Bill",
        entityId: bill.id,
        details: { paid: bill.paid },
      },
    })

    return NextResponse.json(bill)
  } catch (error) {
    console.error("Error updating bill:", error)
    return NextResponse.json(
      { error: "Failed to update bill" },
      { status: 500 }
    )
  }
}
