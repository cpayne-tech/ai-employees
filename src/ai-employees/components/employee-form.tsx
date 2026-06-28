import Link from "next/link";
import type { AiEmployee, AiEmployeeStatus, AiEmployeeType } from "@/ai-employees/types";
import { SubmitButton } from "@/ai-employees/components/submit-button";

const employeeTypes: AiEmployeeType[] = [
  "AI Receptionist / Appointment Setter",
  "AI Website Concierge",
  "AI Lead Qualifier",
  "AI Customer Support Agent"
];

const statuses: AiEmployeeStatus[] = ["draft", "active", "paused", "archived"];

type EmployeeFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  employee?: AiEmployee;
  submitLabel: string;
};

export function EmployeeForm({
  action,
  employee,
  submitLabel
}: EmployeeFormProps) {
  return (
    <form action={action} className="card">
      <div className="form-grid">
        <Field name="name" label="Employee name" defaultValue={employee?.name ?? ""} />
        <div className="field">
          <label htmlFor="type">Employee type</label>
          <select id="type" name="type" defaultValue={employee?.type ?? "AI Receptionist / Appointment Setter"}>
            {employeeTypes.map((type) => (
              <option key={type}>{type}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="status">Status</label>
          <select id="status" name="status" defaultValue={employee?.status ?? "draft"}>
            {statuses.map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>
        <Field name="business_name" label="Business name" defaultValue={employee?.business_name ?? ""} />
        <Field name="industry" label="Business industry" defaultValue={employee?.industry ?? ""} />
        <Field name="business_phone" label="Business phone" defaultValue={employee?.business_phone ?? ""} />
        <Field name="business_email" label="Business email" defaultValue={employee?.business_email ?? ""} />
        <Field name="website" label="Website" defaultValue={employee?.website ?? ""} />
        <Field name="service_area" label="Service area" defaultValue={employee?.service_area ?? ""} />
        <Textarea name="services_offered" label="Services offered" defaultValue={employee?.services_offered ?? ""} />
        <Textarea name="business_hours" label="Business hours" defaultValue={employee?.business_hours ?? ""} />
        <Textarea name="appointment_instructions" label="Appointment booking instructions" defaultValue={employee?.appointment_instructions ?? ""} />
        <Field name="escalation_email" label="Human escalation email" defaultValue={employee?.escalation_email ?? ""} />
        <Field name="escalation_phone" label="Human escalation phone" defaultValue={employee?.escalation_phone ?? ""} />
        <Textarea name="tone" label="Tone of voice" defaultValue={employee?.tone ?? ""} />
        <Textarea name="faqs" label="FAQs" defaultValue={employee?.faqs ?? ""} />
        <Textarea name="disqualifying_rules" label="Disqualifying rules" defaultValue={employee?.disqualifying_rules ?? ""} />
        <Textarea
          name="required_lead_fields"
          label="Required lead fields"
          defaultValue={(employee?.required_lead_fields ?? [
            "name",
            "phone",
            "email",
            "service_needed",
            "preferred_time"
          ]).join(", ")}
        />
        <Textarea name="primary_goal" label="Primary goal" defaultValue={employee?.primary_goal ?? ""} />
      </div>

      <section className="form-section">
        <div>
          <h2>GoHighLevel Integration - Coming Next</h2>
          <p className="muted">These fields are saved for future integration and are not active yet.</p>
        </div>
        <div className="form-grid">
          <Field name="ghl_location_id" label="GHL location ID" defaultValue={employee?.ghl_location_id ?? ""} />
          <Field name="ghl_calendar_id" label="GHL calendar ID" defaultValue={employee?.ghl_calendar_id ?? ""} />
          <Field name="ghl_pipeline_id" label="GHL pipeline ID" defaultValue={employee?.ghl_pipeline_id ?? ""} />
          <Field
            name="ghl_opportunity_stage_id"
            label="GHL opportunity stage ID"
            defaultValue={employee?.ghl_opportunity_stage_id ?? ""}
          />
          <Field name="ghl_source_name" label="GHL source name" defaultValue={employee?.ghl_source_name ?? ""} />
        </div>
      </section>
      <div className="button-row" style={{ marginTop: 18 }}>
        <SubmitButton label={submitLabel} />
        <Link href={employee ? `/ai-employees/${employee.id}` : "/ai-employees/employees"} className="button secondary">
          Cancel
        </Link>
      </div>
    </form>
  );
}

function Field({
  name,
  label,
  defaultValue
}: {
  name: string;
  label: string;
  defaultValue: string;
}) {
  return (
    <div className="field">
      <label htmlFor={name}>{label}</label>
      <input id={name} name={name} defaultValue={defaultValue} />
    </div>
  );
}

function Textarea({
  name,
  label,
  defaultValue
}: {
  name: string;
  label: string;
  defaultValue: string;
}) {
  return (
    <div className="field full">
      <label htmlFor={name}>{label}</label>
      <textarea id={name} name={name} defaultValue={defaultValue} />
    </div>
  );
}
