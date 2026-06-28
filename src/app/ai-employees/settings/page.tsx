import { requireAiEmployeesAccess } from "@/ai-employees/auth";
import { getAiProviderStatus } from "@/ai-employees/ai";
import { AppFrame } from "@/ai-employees/components/app-frame";
import { getGoHighLevelStatus } from "@/ai-employees/integrations/gohighlevel/client";
import { getSupabaseAdminClient } from "@/lib/supabase/server";

type BadgeState = "ready" | "needs-setup" | "not-connected";

export default async function AiEmployeesSettingsPage() {
  await requireAiEmployeesAccess();
  const aiProvider = getAiProviderStatus();
  const supabaseConnected = Boolean(getSupabaseAdminClient());
  const ownerExists = Boolean(process.env.AI_EMPLOYEES_OWNER_ID);
  const ghlApiKeyConfigured = Boolean(process.env.GHL_API_KEY || process.env.GOHIGHLEVEL_API_KEY);
  const ghlLocationConfigured = Boolean(process.env.GHL_LOCATION_ID || process.env.GOHIGHLEVEL_LOCATION_ID);
  const ghlStatus = getGoHighLevelStatus();

  return (
    <AppFrame
      subtitle="Configuration health without exposing secret values."
      title="Settings"
    >
      <div className="settings-stack">
        <section>
          <div className="section-header">
            <div>
              <h2>System Health</h2>
              <p className="muted">Core app configuration and integration readiness.</p>
            </div>
          </div>
          <div className="health-grid">
            <HealthCard label="Owner ID" ready={ownerExists} />
            <HealthCard label="Supabase" ready={supabaseConnected} />
            <HealthCard label="Simulation Provider" ready={aiProvider.configured} />
            <HealthCard
              label="GoHighLevel"
              ready={ghlStatus === "ready_for_test"}
              stateWhenNotReady={ghlStatus === "credentials_present" ? "needs-setup" : "not-connected"}
            />
          </div>
        </section>

        <div className="settings-grid">
          <section className="card">
            <div className="section-header">
              <div>
                <h2>Environment Checklist</h2>
                <p className="muted">Only status is shown here. Secret values stay hidden.</p>
              </div>
            </div>
            <ul className="checklist">
              <ChecklistItem ready={Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL)} text="Supabase URL configured" />
              <ChecklistItem ready={Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY)} text="Supabase service role configured server-side" />
              <ChecklistItem ready={ownerExists} text="AI employee owner configured" />
              <ChecklistItem ready={Boolean(process.env.AI_EMPLOYEES_ADMIN_PASSWORD)} text="Admin password configured" />
              <ChecklistItem ready={Boolean(process.env.AI_EMPLOYEES_SESSION_SECRET)} text="Session secret configured" />
              <ChecklistItem ready={aiProvider.configured} text="Simulation provider key configured" />
              <ChecklistItem ready={ghlApiKeyConfigured} text="GoHighLevel API key configured" />
              <ChecklistItem ready={ghlLocationConfigured} text="GoHighLevel location ID configured" />
            </ul>
          </section>

          <div className="settings-stack">
            <section className="card">
              <div className="section-header">
                <div>
                  <h2>Integration Status</h2>
                  <p className="muted">Connection status for the next integration phase.</p>
                </div>
              </div>
              <div className="record-list">
                <IntegrationRow label="Simulation Provider" state={aiProvider.configured ? "ready" : "needs-setup"} />
                <IntegrationRow
                  label={`GoHighLevel (${ghlStatus.replaceAll("_", " ")})`}
                  state={ghlStatus === "ready_for_test" ? "ready" : ghlStatus === "credentials_present" ? "needs-setup" : "not-connected"}
                />
                <IntegrationRow label="Calendar" state="not-connected" />
                <IntegrationRow label="SMS" state="not-connected" />
                <IntegrationRow label="Email" state="not-connected" />
              </div>
            </section>

            <section className="card">
              <div className="section-header">
                <div>
                  <h2>Next Setup Steps</h2>
                  <p className="muted">Recommended order before public launch.</p>
                </div>
              </div>
              <ol className="next-steps">
                <li>Create GoHighLevel AI Agent profiles</li>
                <li>Add GoHighLevel credentials</li>
                <li>Map workflow triggers, pipeline stages, and calendars</li>
                <li>Run Internal Simulation before export</li>
                <li>Configure the native GoHighLevel AI Agent</li>
              </ol>
            </section>
          </div>
        </div>

        <section className="card">
          <div className="section-header">
            <div>
              <h2>Integration Hub</h2>
              <p className="muted">GoHighLevel is the execution layer. This app is the control center.</p>
            </div>
          </div>
          <div className="integration-card-grid">
            <IntegrationCard title="GoHighLevel Native AI Agents" text="Primary execution layer for AI Employees." state="ready" />
            <IntegrationCard title="GoHighLevel Conversations" text="Native GHL conversation channels receive and manage messages." state="needs-setup" />
            <IntegrationCard title="GoHighLevel Workflows" text="Workflow triggers route lead capture, qualification, follow-up, and handoff events." state="needs-setup" />
            <IntegrationCard title="GoHighLevel Calendar" text="Calendar mapping prepares appointment requests without confirming unavailable times." state="needs-setup" />
            <IntegrationCard title="GoHighLevel Pipelines" text="Pipeline mapping prepares opportunity stages for AI Employee outcomes." state="needs-setup" />
            <IntegrationCard title="n8n Optional Middleware" text="Optional middleware for advanced automation." state="not-connected" />
            <IntegrationCard title="Simulation Provider" text="Used only to test prompts and behavior before GoHighLevel deployment." state={aiProvider.configured ? "ready" : "needs-setup"} />
          </div>
        </section>
      </div>
    </AppFrame>
  );
}

function HealthCard({
  label,
  ready,
  stateWhenNotReady = "needs-setup"
}: {
  label: string;
  ready: boolean;
  stateWhenNotReady?: Exclude<BadgeState, "ready">;
}) {
  const state = ready ? "ready" : stateWhenNotReady;

  return (
    <div className="health-card">
      <span>{label}</span>
      <strong>{ready ? "Ready" : stateWhenNotReady === "not-connected" ? "Not connected" : "Needs setup"}</strong>
      <SetupBadge state={state} />
    </div>
  );
}

function ChecklistItem({ ready, text }: { ready: boolean; text: string }) {
  return (
    <li>
      <span>{text}</span>
      <SetupBadge state={ready ? "ready" : "needs-setup"} />
    </li>
  );
}

function IntegrationRow({ label, state }: { label: string; state: BadgeState }) {
  return (
    <div className="record-row">
      <strong>{label}</strong>
      <SetupBadge state={state} />
    </div>
  );
}

function IntegrationCard({
  state,
  text,
  title
}: {
  state: BadgeState;
  text: string;
  title: string;
}) {
  return (
    <div className="role-card">
      <div className="role-card-header">
        <strong>{title}</strong>
        <SetupBadge state={state} />
      </div>
      <p>{text}</p>
    </div>
  );
}

function SetupBadge({ state }: { state: BadgeState }) {
  const label = {
    ready: "Ready",
    "needs-setup": "Needs setup",
    "not-connected": "Not connected"
  }[state];

  return <span className={`setup-badge ${state}`}>{label}</span>;
}
