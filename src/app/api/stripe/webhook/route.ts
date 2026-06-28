import { NextResponse } from "next/server";
import Stripe from "stripe";
import { recordStripePurchaseEvent } from "@/ai-employees/data/repository";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const stripeEventTypes = [
  "checkout.session.completed",
  "checkout.session.async_payment_succeeded",
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
  "invoice.payment_succeeded",
  "invoice.payment_failed",
  "payment_intent.succeeded",
  "payment_intent.payment_failed",
  "charge.succeeded",
  "charge.failed"
] as const;

type SupportedStripeEventType = (typeof stripeEventTypes)[number];

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

export async function POST(request: Request) {
  if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: "Stripe webhook is not configured." },
      { status: 500 }
    );
  }

  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing Stripe signature." }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      await request.text(),
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch {
    return NextResponse.json({ error: "Invalid Stripe signature." }, { status: 400 });
  }

  if (!isSupportedStripeEvent(event.type)) {
    return NextResponse.json({ received: true, ignored: true });
  }

  const objectSummary = summarizeStripeObject(event.data.object);
  const purchaseResult = await recordStripePurchaseEvent({
    ...extractPurchaseEventInput(event, objectSummary),
    rawSummary: objectSummary
  });

  try {
    await notifyPurchaseWorkflow(event, objectSummary, purchaseResult);
  } catch (error) {
    console.error("n8n purchase workflow notification failed", error);
  }

  return NextResponse.json({ received: true, purchase: purchaseResult });
}

function isSupportedStripeEvent(type: string): type is SupportedStripeEventType {
  return stripeEventTypes.includes(type as SupportedStripeEventType);
}

async function notifyPurchaseWorkflow(
  event: Stripe.Event,
  objectSummary: Record<string, unknown>,
  purchaseResult: Awaited<ReturnType<typeof recordStripePurchaseEvent>>
) {
  const webhookUrl = process.env.N8N_PURCHASE_WEBHOOK_URL;

  if (!webhookUrl) {
    return;
  }

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      event: "ai_employee.stripe_purchase_event",
      stripe: {
        event_id: event.id,
        event_type: event.type,
        created: event.created,
        livemode: event.livemode,
        object: objectSummary
      },
      purchase: purchaseResult,
      activation_mode: "manual_review",
      source_app: "OBMC AI Employees",
      received_at: new Date().toISOString()
    }),
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(`n8n purchase webhook returned ${response.status}`);
  }
}

function summarizeStripeObject(object: Stripe.Event.Data.Object) {
  const record = object as Record<string, unknown>;
  const customerDetails = isRecord(record.customer_details) ? record.customer_details : {};
  const billingDetails = isRecord(record.billing_details) ? record.billing_details : {};

  return {
    id: asString(record.id),
    object: asString(record.object),
    amount: asNumber(record.amount),
    amount_paid: asNumber(record.amount_paid),
    amount_received: asNumber(record.amount_received),
    amount_total: asNumber(record.amount_total),
    currency: asString(record.currency),
    customer: asString(record.customer),
    customer_email:
      asString(record.customer_email) ??
      asString(customerDetails.email) ??
      asString(billingDetails.email) ??
      asString(record.receipt_email),
    customer_name:
      asString(customerDetails.name) ??
      asString(billingDetails.name) ??
      asString(record.customer_name),
    metadata: isRecord(record.metadata) ? record.metadata : {},
    mode: asString(record.mode),
    payment_status: asString(record.payment_status),
    payment_intent: asString(record.payment_intent),
    status: asString(record.status),
    subscription: asString(record.subscription),
    invoice: asString(record.invoice)
  };
}

function extractPurchaseEventInput(
  event: Stripe.Event,
  objectSummary: Record<string, unknown>
) {
  const objectType = asString(objectSummary.object);
  const metadata = isRecord(objectSummary.metadata) ? objectSummary.metadata : {};
  const amountTotal =
    asNumber(objectSummary.amount_total) ??
    asNumber(objectSummary.amount_paid) ??
    asNumber(objectSummary.amount_received) ??
    asNumber(objectSummary.amount);

  return {
    eventId: event.id,
    eventType: event.type,
    livemode: event.livemode,
    planId:
      asString(metadata.plan_id) ??
      asString(metadata.plan) ??
      asString(metadata.package_id),
    planName:
      asString(metadata.plan_name) ??
      asString(metadata.package_name) ??
      asString(metadata.product_name),
    customerEmail: asString(objectSummary.customer_email),
    customerName: asString(objectSummary.customer_name),
    businessName:
      asString(metadata.business_name) ??
      asString(metadata.company_name) ??
      asString(metadata.account_name),
    amountTotal,
    currency: asString(objectSummary.currency),
    paymentStatus:
      asString(objectSummary.payment_status) ??
      asString(objectSummary.status),
    stripeCustomerId: asString(objectSummary.customer),
    stripeCheckoutSessionId:
      objectType === "checkout.session" ? asString(objectSummary.id) : null,
    stripePaymentIntentId:
      objectType === "payment_intent"
        ? asString(objectSummary.id)
        : asString(objectSummary.payment_intent),
    stripeInvoiceId:
      objectType === "invoice" ? asString(objectSummary.id) : asString(objectSummary.invoice),
    stripeSubscriptionId:
      objectType === "subscription"
        ? asString(objectSummary.id)
        : asString(objectSummary.subscription),
    metadata,
    purchasedAt: event.created
      ? new Date(event.created * 1000).toISOString()
      : new Date().toISOString()
  };
}

function asString(value: unknown) {
  return typeof value === "string" ? value : null;
}

function asNumber(value: unknown) {
  return typeof value === "number" ? value : null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
