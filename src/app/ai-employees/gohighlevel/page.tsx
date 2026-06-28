import { requireAiEmployeesAccess } from "@/ai-employees/auth";
import { AppFrame } from "@/ai-employees/components/app-frame";
import { StatCard } from "@/ai-employees/components/stat-card";
import { getGoHighLevelStatus } from "@/ai-employees/integrations/gohighlevel/client";
import { listGhlAiAgentProfiles } from "@/ai-employees/data/ghl-profiles";
import { standardGhlCustomFields } from "@/ai-employees/integrations/gohighlevel-native/custom-field-mapper";

const setupChecklist = [
  "Create or select GHL sub-account/location",
  "Enable Conversations",
  "Enable native AI Agent feature when available in the location",
  "Configure SMS/email channels",
  "Configure calendar",
  "Configure pipeline",
  "Configure workflow triggers",
  "Create custom fields for captured lead data",
  "Create tags for AI employee source",
  "Create human handoff workflow",
  "Test conversation"
];

const suggestedTags = [
  "AI Employee Lead",
  "AI Qualified",
  "AI Appointment Requested",
  "AI Escalation Needed",
  "AI Follow-up Needed",
  "Human Takeover Requested"
];

const workflowNames = [
  "AI Employee - New Lead Captured",
  "AI Employee - Qualified Lead",
  "AI Employee - Appointment Requested",
  "AI Employee - Escalation Needed",
  "AI Employee - No Response Follow-up",
  "AI Employee - Human Takeover"
];

export default async function GoHighLevelPage() {
  await requireAiEmployeesAccess();
  const [profiles] = await Promise.all([listGhlAiAgentProfiles()]);
  const ghlStatus = getGoHighLevelStatus();
  const exported = profiles.filter((profile) => profile.deployment_status === "exported").length;
  const connected = profiles.filter((profile) => profile.deployment_status === "connected").length;

  return (
    <AppFrame
      eyebrow="Primary execution layer"
      subtitle="Use One Big Media Company AI Employees as the control center and GoHighLevel as the native execution layer."
      title="GoHighLevel Native Setup"
    >
      <section className="grid stats-grid compact-stats">
        <StatCard label="GHL Profiles" value={profiles.length} detail="Saved AI Agent profiles" />
        <StatCard label="Exported" value={exported} detail="Copy-ready packages marked exported" />
        <StatCard label="Connected" value={connected} detail="Profiles marked connected" />
        <StatCard label="Connection" value={ghlStatus.replaceAll("_", " ")} detail="No secrets shown" />
      </section>

      <div className="settings-grid">
        <section className="card">
          <h2>Connection Status</h2>
          <ul className="checklist">
            <ChecklistItem ready={Boolean(process.env.GHL_API_KEY || process.env.GOHIGHLEVEL_API_KEY)} text="GHL API key configured" />
            <ChecklistItem ready={Boolean(process.env.GHL_LOCATION_ID || process.env.GOHIGHLEVEL_LOCATION_ID)} text="GHL location ID configured" />
            <ChecklistItem ready={false} text="OAuth configured (future)" />
            <ChecklistItem ready text="Native AI Agent integration mode selected" />
          </ul>
        </section>

        <section className="card">
          <h2>Required GoHighLevel Setup</h2>
          <ul className="checklist">
            {setupChecklist.map((item) => (
              <ChecklistItem key={item} ready={false} text={item} />
            ))}
          </ul>
        </section>
      </div>

      <div className="dashboard-grid">
        <SetupList title="Suggested GHL Custom Fields" items={standardGhlCustomFields} />
        <SetupList title="Suggested GHL Tags" items={suggestedTags} />
        <SetupList title="Suggested Workflow Names" items={workflowNames} />
      </div>
    </AppFrame>
  );
}

function ChecklistItem({ ready, text }: { ready: boolean; text: string }) {
  return (
    <li>
      <span>{text}</span>
      <span className={`setup-badge ${ready ? "ready" : "needs-setup"}`}>
        {ready ? "Ready" : "Needs setup"}
      </span>
    </li>
  );
}

function SetupList({ items, title }: { items: string[]; title: string }) {
  return (
    <section className="card">
      <h2>{title}</h2>
      <div className="chip-row">
        {items.map((item) => (
          <span className="mini-chip" key={item}>{item}</span>
        ))}
      </div>
    </section>
  );
}
