import { requireAiEmployeesAccess } from "@/ai-employees/auth";
import { getAiProviderStatus } from "@/ai-employees/ai";
import { AppFrame } from "@/ai-employees/components/app-frame";
import { getLatestGhlDiscoveryReport } from "@/ai-employees/data/ghl-discovery";
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
  const discovery = await getLatestGhlDiscoveryReport();
  const discoveryComplete = discovery?.status === "discovered";

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
              <ChecklistItem ready={discoveryComplete} text="GoHighLevel read-only discovery completed" />
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
                <IntegrationRow label={`GHL Discovery (${discovery?.status?.replaceAll("_", " ") ?? "not started"})`} state={discoveryComplete ? "ready" : "needs-setup"} />
                <IntegrationRow label="Calendar inventory" state={discoveryComplete ? "ready" : "not-connected"} />
                <IntegrationRow label="SMS/email inventory" state={discoveryComplete ? "ready" : "not-connected"} />
              </div>
            </section>

            <section className="card">
              <div className="section-header">
                <div>
                  <h2>Next Setup Steps</h2>
              <p className="muted">Recommended order before any production GoHighLevel change.</p>
                </div>
              </div>
              <ol className="next-steps">
                <li>Complete read-only GoHighLevel discovery</li>
                <li>Build the inventory of existing production resources</li>
                <li>Compare inventory against AI Employee OS requirements</li>
                <li>Reuse existing resources wherever equivalent assets exist</li>
                <li>Create only missing namespaced resources after explicit approval</li>
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
            <IntegrationCard title="GoHighLevel Discovery" text="Read-only inventory must be completed before creating or editing anything." state={discoveryComplete ? "ready" : "needs-setup"} />
            <IntegrationCard title="GoHighLevel Native AI Agents" text="Primary execution layer after existing AI features are inventoried." state="needs-setup" />
            <IntegrationCard title="GoHighLevel Conversations" text="Conversation channels must be discovered before reuse or setup." state="needs-setup" />
            <IntegrationCard title="GoHighLevel Workflows" text="Workflow logic remains untouched unless explicitly approved." state="needs-setup" />
            <IntegrationCard title="GoHighLevel Calendar" text="Calendar mapping waits for existing calendar inventory." state="needs-setup" />
            <IntegrationCard title="GoHighLevel Pipelines" text="Pipeline and stage mapping waits for existing pipeline inventory." state="needs-setup" />
            <IntegrationCard title="n8n Optional Middleware" text="Optional middleware for advanced automation." state="not-connected" />
            <IntegrationCard title="Simulation Provider" text="Used only to test prompts and behavior before safe GoHighLevel configuration." state={aiProvider.configured ? "ready" : "needs-setup"} />
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
