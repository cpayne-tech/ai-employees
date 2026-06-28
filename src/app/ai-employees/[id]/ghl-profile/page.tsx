import type { ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { saveGhlAiAgentProfileAction } from "@/ai-employees/actions";
import { requireAiEmployeesAccess } from "@/ai-employees/auth";
import { AppFrame } from "@/ai-employees/components/app-frame";
import { SubmitButton } from "@/ai-employees/components/submit-button";
import { getLatestGhlDiscoveryReport } from "@/ai-employees/data/ghl-discovery";
import { getAiEmployeeDetail } from "@/ai-employees/data/repository";
import { getGhlAiAgentProfileForEmployee } from "@/ai-employees/data/ghl-profiles";
import { buildDefaultGhlAiAgentProfile } from "@/ai-employees/integrations/gohighlevel-native/agent-profile-builder";
import { buildGhlDeploymentChecklist } from "@/ai-employees/integrations/gohighlevel-native/deployment-checklist";
import type { GhlAiAgentProfileInput, GhlDeploymentStatus } from "@/ai-employees/types";

const channels = ["SMS", "Web Chat", "Email", "Instagram DM", "Facebook Messenger", "Multi-channel"];
const statuses: GhlDeploymentStatus[] = ["draft", "ready_for_review", "exported", "connected", "needs_update"];

export default async function GhlProfilePage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAiEmployeesAccess();
  const { id } = await params;
  const [detail, savedProfile, discovery] = await Promise.all([
    getAiEmployeeDetail(id),
    getGhlAiAgentProfileForEmployee(id),
    getLatestGhlDiscoveryReport()
  ]);

  if (!detail) {
    notFound();
  }

  const profile = savedProfile ?? buildDefaultGhlAiAgentProfile(detail.employee);
  const checklist = buildGhlDeploymentChecklist({
    employee: detail.employee,
    profile,
    discoveryComplete: discovery?.status === "discovered"
  });
  const saveAction = saveGhlAiAgentProfileAction.bind(null, detail.employee.id);

  return (
    <AppFrame
      actions={
        <>
          <Link className="button secondary" href={`/ai-employees/${detail.employee.id}`}>
            Back to employee
          </Link>
          <Link className="button" href={`/ai-employees/${detail.employee.id}/ghl-export`}>
            Export package
          </Link>
        </>
      }
      eyebrow="GoHighLevel Native AI Agent"
      subtitle="Prepare the AI Agent profile for GoHighLevel. Existing GHL assets stay read-only until discovery and gap analysis are complete."
      title={detail.employee.name}
    >
      <div className="setup-note">
        Discovery-first mode is active. Use existing GoHighLevel resources only after they are inventoried; create new namespaced resources only after confirmed gaps and explicit approval.
      </div>

      <form action={saveAction} className="wizard-form">
        <input name="id" type="hidden" value={"id" in profile ? profile.id ?? "" : ""} />

        <ProfileSection title="A. Agent Identity">
          <div className="form-grid">
            <Field label="Profile name" name="profile_name" value={profile.profile_name} />
            <Field label="GHL location ID" name="ghl_location_id" value={profile.ghl_location_id ?? ""} />
            <Field label="GHL AI agent ID" name="ghl_agent_id" value={profile.ghl_agent_id ?? ""} />
            <div className="field">
              <label htmlFor="ghl_channel">Channel</label>
              <select id="ghl_channel" name="ghl_channel" defaultValue={profile.ghl_channel ?? "Multi-channel"}>
                {channels.map((channel) => <option key={channel}>{channel}</option>)}
              </select>
            </div>
            <Textarea label="Objective" name="objective" value={profile.objective ?? ""} />
            <Textarea label="Personality / tone" name="personality" value={profile.personality ?? ""} />
          </div>
        </ProfileSection>

        <ProfileSection title="B. Instructions">
          <Textarea label="Master system instructions" name="instructions" value={profile.instructions ?? ""} />
          <Textarea label="Business context / knowledge summary" name="knowledge_summary" value={profile.knowledge_summary ?? ""} />
        </ProfileSection>

        <ProfileSection title="C. Lead Capture">
          <Textarea label="Required and optional lead fields" name="lead_capture_fields" value={profile.lead_capture_fields.join("\n")} />
        </ProfileSection>

        <ProfileSection title="D. Qualification Rules">
          <Textarea label="Qualification rules JSON or notes" name="qualification_rules" value={toJson(profile.qualification_rules)} />
        </ProfileSection>

        <ProfileSection title="E. Booking Rules">
          <Textarea label="Booking rules JSON or notes" name="booking_rules" value={toJson(profile.booking_rules)} />
        </ProfileSection>

        <ProfileSection title="F. Escalation Rules">
          <Textarea label="Escalation rules JSON or notes" name="escalation_rules" value={toJson(profile.escalation_rules)} />
        </ProfileSection>

        <ProfileSection title="G. GoHighLevel Workflow Triggers">
          <Textarea label="Workflow trigger mapping JSON or notes" name="workflow_triggers" value={toJson(profile.workflow_triggers)} />
        </ProfileSection>

        <ProfileSection title="H. Pipeline and Calendar Mapping">
          <div className="form-grid">
            <Textarea label="Pipeline mapping JSON or notes" name="pipeline_mapping" value={toJson(profile.pipeline_mapping)} />
            <Textarea label="Calendar mapping JSON or notes" name="calendar_mapping" value={toJson(profile.calendar_mapping)} />
          </div>
        </ProfileSection>

        <ProfileSection title="I. Export / Deployment Checklist">
          <div className="field">
            <label htmlFor="deployment_status">Deployment status</label>
            <select id="deployment_status" name="deployment_status" defaultValue={profile.deployment_status}>
              {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
            </select>
          </div>
          <ul className="checklist">
            {checklist.map((item) => (
              <li key={item.label}>
                <span>{item.label}</span>
                <span className={`setup-badge ${item.ready ? "ready" : "needs-setup"}`}>
                  {item.ready ? "Ready" : "Needs setup"}
                </span>
              </li>
            ))}
          </ul>
          {discovery?.status !== "discovered" ? (
            <p className="muted">
              GoHighLevel discovery is not complete. This profile can be saved internally, but it should not be deployed into production GHL assets yet.
            </p>
          ) : null}
        </ProfileSection>

        <div className="button-row">
          <SubmitButton label="Save GHL profile" />
          <Link className="button secondary" href={`/ai-employees/${detail.employee.id}`}>
            Cancel
          </Link>
        </div>
      </form>
    </AppFrame>
  );
}

function ProfileSection({ children, title }: { children: ReactNode; title: string }) {
  return (
    <section className="card wizard-step">
      <h2>{title}</h2>
      {children}
    </section>
  );
}

function Field({ label, name, value }: { label: string; name: string; value: string }) {
  return (
    <div className="field">
      <label htmlFor={name}>{label}</label>
      <input id={name} name={name} defaultValue={value} />
    </div>
  );
}

function Textarea({ label, name, value }: { label: string; name: string; value: string }) {
  return (
    <div className="field full">
      <label htmlFor={name}>{label}</label>
      <textarea id={name} name={name} defaultValue={value} />
    </div>
  );
}

function toJson(value: GhlAiAgentProfileInput[keyof GhlAiAgentProfileInput]) {
  if (value && typeof value === "object") {
    return JSON.stringify(value, null, 2);
  }

  return String(value ?? "");
}
