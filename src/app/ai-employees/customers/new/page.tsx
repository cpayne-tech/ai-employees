import Link from "next/link";
import { createManualCustomerAction } from "@/ai-employees/customer-actions";
import { requireAiEmployeesAccess } from "@/ai-employees/auth";
import { AppFrame } from "@/ai-employees/components/app-frame";
import { billingPlans } from "@/ai-employees/billing";

export default async function NewCustomerPage() {
  await requireAiEmployeesAccess();

  return (
    <AppFrame
      actions={<Link className="button secondary" href="/ai-employees/customers">All customers</Link>}
      eyebrow="Manual customer setup"
      subtitle="Create a customer portal and intake workflow without waiting for a Stripe webhook."
      title="New Customer"
    >
      <section className="card">
        <form action={createManualCustomerAction} className="form-grid">
          <label className="field">
            Business name
            <input name="businessName" placeholder="Customer business name" />
          </label>
          <label className="field">
            Primary contact
            <input name="contactName" placeholder="Customer contact name" />
          </label>
          <label className="field">
            Email
            <input name="email" placeholder="owner@example.com" required type="email" />
          </label>
          <label className="field">
            Phone
            <input name="phone" placeholder="Customer phone" />
          </label>
          <label className="field">
            Website
            <input name="website" placeholder="https://example.com" type="url" />
          </label>
          <label className="field">
            Plan
            <select name="planId" defaultValue="growth">
              {billingPlans.map((plan) => (
                <option key={plan.id} value={plan.id}>{plan.name}</option>
              ))}
              <option value="manual">Manual review</option>
            </select>
          </label>
          <label className="field full">
            Plan display name
            <input name="planName" placeholder="Optional display name shown in the customer portal" />
          </label>
          <label className="field full">
            Internal notes
            <textarea name="notes" placeholder="Admin-only context for this customer setup" />
          </label>
          <div className="field full">
            <button className="button" type="submit">Create customer portal</button>
          </div>
        </form>
      </section>
    </AppFrame>
  );
}
