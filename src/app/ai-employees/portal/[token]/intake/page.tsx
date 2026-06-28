import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Bot } from "lucide-react";
import { submitCustomerIntakeAction } from "@/ai-employees/customer-intake-actions";
import { getCustomerPortalDetail } from "@/ai-employees/data/repository";

const leadFieldOptions = [
  "name",
  "phone",
  "email",
  "service_needed",
  "preferred_time",
  "urgency",
  "service_area"
];

export default async function CustomerIntakePage({
  params
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const detail = await getCustomerPortalDetail(token);

  if (!detail) {
    notFound();
  }

  const { customer, intake } = detail;
  const selectedLeadFields = intake?.required_lead_fields ?? ["name", "phone", "email"];

  return (
    <main className="client-portal-shell">
      <nav className="client-portal-nav">
        <Link className="public-brand" href={`/ai-employees/portal/${token}`}>
          <Bot size={22} />
          <span>
            <strong>One Big Media Company</strong>
            AI Employees
          </span>
        </Link>
        <Link className="button secondary" href={`/ai-employees/portal/${token}`}>
          <ArrowLeft size={16} />
          Back to workspace
        </Link>
      </nav>

      <section className="intake-hero">
        <div>
          <div className="eyebrow">Business intake</div>
          <h1>Configure your AI employees</h1>
          <p>
            These details give OBMC what we need to build your AI employee roles,
            map GoHighLevel safely, and prepare launch review.
          </p>
        </div>
        <div className="client-progress-panel">
          <span>Setup record</span>
          <strong>{intake ? "Update" : "Start"}</strong>
          <p>{customer.plan_name ?? customer.plan_id}</p>
        </div>
      </section>

      <form action={submitCustomerIntakeAction.bind(null, token)} className="intake-form">
        <section className="client-portal-main">
          <div className="client-section-heading">
            <span className="eyebrow">Company</span>
            <h2>Business profile</h2>
          </div>
          <div className="form-grid">
            <Field label="Business name" name="business_name" required value={intake?.business_name ?? customer.business_name} />
            <Field label="Primary contact" name="contact_name" required value={intake?.contact_name ?? customer.contact_name} />
            <Field label="Email" name="email" required type="email" value={intake?.email ?? customer.email} />
            <Field label="Phone" name="phone" value={intake?.phone ?? customer.phone} />
            <Field label="Website" name="website" type="url" value={intake?.website ?? customer.website} />
            <Field label="Industry" name="industry" required value={intake?.industry} />
            <Field label="Service area" name="service_area" value={intake?.service_area} />
            <label className="field">
              Launch priority
              <select name="launch_priority" defaultValue={intake?.launch_priority ?? "standard"}>
                <option value="standard">Standard</option>
                <option value="soon">Soon</option>
                <option value="urgent">Urgent</option>
              </select>
            </label>
          </div>
        </section>

        <section className="client-portal-main">
          <div className="client-section-heading">
            <span className="eyebrow">Operations</span>
            <h2>What the AI employees need to know</h2>
          </div>
          <div className="form-grid">
            <Textarea label="Services offered" name="services_offered" required value={intake?.services_offered} />
            <Textarea label="Business hours" name="business_hours" value={intake?.business_hours} />
            <Textarea label="Ideal customer" name="ideal_customer" value={intake?.ideal_customer} />
            <Textarea label="Common questions and answers" name="common_questions" value={intake?.common_questions} />
            <Textarea label="Appointment rules" name="appointment_rules" value={intake?.appointment_rules} />
            <Textarea label="Escalation contacts" name="escalation_contacts" value={intake?.escalation_contacts} />
            <Textarea label="Tone preferences" name="tone_preferences" value={intake?.tone_preferences} />
            <Textarea label="Disqualifying rules" name="disqualifying_rules" value={intake?.disqualifying_rules} />
            <Textarea label="GoHighLevel notes" name="ghl_notes" value={intake?.ghl_notes} />
          </div>
        </section>

        <section className="client-portal-main">
          <div className="client-section-heading">
            <span className="eyebrow">Lead capture</span>
            <h2>Required lead fields</h2>
          </div>
          <div className="lead-field-grid">
            {leadFieldOptions.map((field) => (
              <label className="lead-field-option" key={field}>
                <input
                  defaultChecked={selectedLeadFields.includes(field)}
                  name="required_lead_fields"
                  type="checkbox"
                  value={field}
                />
                <span>{field.replaceAll("_", " ")}</span>
              </label>
            ))}
          </div>
          <div className="form-actions">
            <button className="button" type="submit">
              Submit intake
            </button>
            <Link className="button secondary" href={`/ai-employees/portal/${token}`}>
              Cancel
            </Link>
          </div>
        </section>
      </form>
    </main>
  );
}

function Field({
  label,
  name,
  required = false,
  type = "text",
  value
}: {
  label: string;
  name: string;
  required?: boolean;
  type?: string;
  value?: string | null;
}) {
  return (
    <label className="field">
      {label}
      <input defaultValue={value ?? ""} name={name} required={required} type={type} />
    </label>
  );
}

function Textarea({
  label,
  name,
  required = false,
  value
}: {
  label: string;
  name: string;
  required?: boolean;
  value?: string | null;
}) {
  return (
    <label className="field full">
      {label}
      <textarea defaultValue={value ?? ""} name={name} required={required} />
    </label>
  );
}
