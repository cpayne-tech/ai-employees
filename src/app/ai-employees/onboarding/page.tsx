import type { ReactNode } from "react";
import { createOnboardingAiEmployeeAction } from "@/ai-employees/actions";
import { requireAiEmployeesAccess } from "@/ai-employees/auth";
import { AppFrame } from "@/ai-employees/components/app-frame";
import { SubmitButton } from "@/ai-employees/components/submit-button";
import { aiEmployeeRoleBlueprints } from "@/ai-employees/role-blueprints";

const defaultLeadFields = ["name", "phone", "email", "service_needed", "preferred_time"];

export default async function AiEmployeeOnboardingPage() {
  await requireAiEmployeesAccess();

  return (
    <AppFrame
      eyebrow="Guided setup"
      subtitle="Create a generic AI employee with the minimum useful configuration for test chat and lead capture."
      title="AI Employee Onboarding"
    >
      <form action={createOnboardingAiEmployeeAction} className="wizard-form">
        <WizardStep number="1" title="Choose role">
          <div className="field">
            <label htmlFor="type">AI employee role</label>
            <select id="type" name="type" defaultValue="AI Website Concierge">
              {aiEmployeeRoleBlueprints.map((role) => (
                <option key={role.type} value={role.type}>
                  {role.type}
                </option>
              ))}
            </select>
          </div>
          <div className="role-grid">
            {aiEmployeeRoleBlueprints.map((role) => (
              <div className="role-card" key={role.type}>
                <div className="role-card-header">
                  <div>
                    <span>{role.label}</span>
                    <strong>{role.type}</strong>
                  </div>
                </div>
                <p>{role.job}</p>
                <div className="role-outcome">{role.outcome}</div>
              </div>
            ))}
          </div>
        </WizardStep>

        <WizardStep number="2" title="Business basics">
          <div className="form-grid">
            <Field label="Employee name" name="name" placeholder="Example Website Concierge" />
            <Field label="Business name" name="business_name" placeholder="One Big Media Company" />
            <Field label="Business industry" name="industry" placeholder="Business services" />
            <Field label="Business phone" name="business_phone" />
            <Field label="Business email" name="business_email" />
            <Field label="Website" name="website" />
            <Field label="Service area" name="service_area" />
            <Field label="Primary goal" name="primary_goal" placeholder="Capture qualified inquiries and route next steps" />
          </div>
        </WizardStep>

        <WizardStep number="3" title="Services and FAQs">
          <Textarea label="Services offered" name="services_offered" />
          <Textarea label="FAQs or business info" name="faqs" />
          <Textarea label="Tone of voice" name="tone" placeholder="Helpful, concise, professional" />
        </WizardStep>

        <WizardStep number="4" title="Lead capture fields">
          <Textarea
            label="Required lead fields"
            name="required_lead_fields"
            defaultValue={defaultLeadFields.join(", ")}
          />
        </WizardStep>

        <WizardStep number="5" title="Appointment and escalation rules">
          <div className="form-grid">
            <Textarea label="Business hours" name="business_hours" />
            <Textarea label="Appointment booking instructions" name="appointment_instructions" />
            <Field label="Human escalation email" name="escalation_email" />
            <Field label="Human escalation phone" name="escalation_phone" />
            <Textarea label="Disqualifying or escalation rules" name="disqualifying_rules" />
          </div>
        </WizardStep>

        <WizardStep number="6" title="Review and create">
          <p className="muted">
            This creates a draft AI employee. You can test it immediately, then add API keys
            and integrations when ready.
          </p>
          <input name="status" type="hidden" value="draft" />
          <input name="ghl_location_id" type="hidden" value="" />
          <input name="ghl_calendar_id" type="hidden" value="" />
          <input name="ghl_pipeline_id" type="hidden" value="" />
          <input name="ghl_opportunity_stage_id" type="hidden" value="" />
          <input name="ghl_source_name" type="hidden" value="" />
          <SubmitButton label="Create AI employee" />
        </WizardStep>
      </form>
    </AppFrame>
  );
}

function WizardStep({
  children,
  number,
  title
}: {
  children: ReactNode;
  number: string;
  title: string;
}) {
  return (
    <section className="card wizard-step">
      <div className="wizard-step-title">
        <span>{number}</span>
        <h2>{title}</h2>
      </div>
      {children}
    </section>
  );
}

function Field({
  label,
  name,
  placeholder = ""
}: {
  label: string;
  name: string;
  placeholder?: string;
}) {
  return (
    <div className="field">
      <label htmlFor={name}>{label}</label>
      <input id={name} name={name} placeholder={placeholder} />
    </div>
  );
}

function Textarea({
  defaultValue = "",
  label,
  name,
  placeholder = ""
}: {
  defaultValue?: string;
  label: string;
  name: string;
  placeholder?: string;
}) {
  return (
    <div className="field full">
      <label htmlFor={name}>{label}</label>
      <textarea id={name} name={name} defaultValue={defaultValue} placeholder={placeholder} />
    </div>
  );
}
