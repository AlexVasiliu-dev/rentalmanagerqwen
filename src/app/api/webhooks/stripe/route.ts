import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"
import { stripe, handleWebhookEvent } from "@/lib/stripe"
import Stripe from "stripe"

// POST - Handle Stripe webhooks
export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = (await headers()).get("stripe-signature")!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message)
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    )
  }

  // Handle the event
  const result = await handleWebhookEvent(event)

  if (result.success) {
    return NextResponse.json({ received: true })
  } else {
    return NextResponse.json(
      { error: result.message },
      { status: 500 }
    )
  }
}
