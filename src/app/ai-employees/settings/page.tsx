import { requireAiEmployeesAccess } from "@/ai-employees/auth";
import { getAiProviderStatus } from "@/ai-employees/ai";
import { AppFrame } from "@/ai-employees/components/app-frame";
import { getLatestGhlDiscoveryReport } from "@/ai-employees/data/ghl-discovery";
import { listGhlAiAgentProfiles } from "@/ai-employees/data/ghl-profiles";
import { getGoHighLevelStatus } from "@/ai-employees/integrations/gohighlevel/client";
import { getN8nStatus } from "@/ai-employees/integrations/n8n/client";
import { getSupabaseAdminClient } from "@/lib/supabase/server";

type BadgeState = "ready" | "needs-setup" | "not-connected" | "optional" | "under-development";

export default async function AiEmployeesSettingsPage() {
  await requireAiEmployeesAccess();
  const aiProvider = getAiProviderStatus();
  const supabaseConnected = Boolean(getSupabaseAdminClient());
  const ownerExists = Boolean(process.env.AI_EMPLOYEES_OWNER_ID);
  const ghlApiKeyConfigured = Boolean(process.env.GHL_API_KEY || process.env.GOHIGHLEVEL_API_KEY);
  const ghlLocationConfigured = Boolean(process.env.GHL_LOCATION_ID || process.env.GOHIGHLEVEL_LOCATION_ID);
  const ghlStatus = getGoHighLevelStatus();
  const n8nStatus = getN8nStatus();
  const discovery = await getLatestGhlDiscoveryReport();
  const ghlProfiles = await listGhlAiAgentProfiles({});
  const discoveryComplete = discovery?.status === "discovered";
  const connectedProfiles = ghlProfiles.filter(
    (profile) => profile.deployment_status === "connected"
  ).length;
  const fiveAgentsMapped = connectedProfiles >= 5;

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
            <HealthCard label="Built-in testing" ready />
            <HealthCard
              label="Optional AI testing"
              ready={aiProvider.configured}
              stateWhenNotReady="optional"
            />
            <HealthCard
              label="GoHighLevel"
              ready={ghlStatus === "ready_for_test"}
              stateWhenNotReady={ghlStatus === "credentials_present" ? "needs-setup" : "not-connected"}
            />
            <HealthCard label="Lead Generation" ready={false} stateWhenNotReady="under-development" />
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
              <ChecklistItem ready text="Built-in test engine works without OpenAI" />
              <ChecklistItem ready={aiProvider.configured} state={aiProvider.configured ? "ready" : "optional"} text="Optional AI testing key configured" />
              <ChecklistItem ready={ghlApiKeyConfigured} text="GoHighLevel API key configured" />
              <ChecklistItem ready={ghlLocationConfigured} text="GoHighLevel location ID configured" />
              <ChecklistItem ready={discoveryComplete} text="GoHighLevel read-only discovery completed" />
              <ChecklistItem ready={n8nStatus.leadSync === "ready"} text="n8n lead-sync webhook configured" />
              <ChecklistItem ready={n8nStatus.purchaseWebhook === "ready"} state={n8nStatus.purchaseWebhook === "ready" ? "ready" : "optional"} text="n8n purchase webhook configured" />
              <ChecklistItem ready={false} state="under-development" text="Lead generation and discovery agent" />
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
                <IntegrationRow label="Built-in test engine" state="ready" />
                <IntegrationRow label="Optional AI testing upgrade" state={aiProvider.configured ? "ready" : "optional"} />
                <IntegrationRow
                  label={`GoHighLevel (${ghlStatus.replaceAll("_", " ")})`}
                  state={ghlStatus === "ready_for_test" ? "ready" : ghlStatus === "credentials_present" ? "needs-setup" : "not-connected"}
                />
                <IntegrationRow label={`GHL Discovery (${discovery?.status?.replaceAll("_", " ") ?? "not started"})`} state={discoveryComplete ? "ready" : "needs-setup"} />
                <IntegrationRow label="Calendar inventory" state={discoveryComplete ? "ready" : "not-connected"} />
                <IntegrationRow label="SMS/email inventory" state={discoveryComplete ? "ready" : "not-connected"} />
                <IntegrationRow label={`n8n lead sync (${n8nStatus.leadSync.replaceAll("_", " ")})`} state={n8nStatus.leadSync === "ready" ? "ready" : "not-connected"} />
                <IntegrationRow label={`n8n purchase webhook (${n8nStatus.purchaseWebhook.replaceAll("_", " ")})`} state={n8nStatus.purchaseWebhook === "ready" ? "ready" : "optional"} />
                <IntegrationRow label="Lead discovery and scraping" state="under-development" />
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
                <li>Finish the customer-facing workspace preview</li>
                <li>Confirm pricing and purchase activation workflow</li>
                <li>Create the five AI employees through onboarding</li>
                <li>Map the five AI employees to existing GHL calendars and pipeline stages</li>
                <li>Use manual lead sync from the lead detail page for production-safe CRM writes</li>
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
            <IntegrationCard title="API-backed GoHighLevel Sync" text="Manual lead sync creates or updates a GHL contact, note, tags, and mapped opportunity." state={fiveAgentsMapped && ghlStatus === "ready_for_test" ? "ready" : "needs-setup"} />
            <IntegrationCard title="GoHighLevel Native AI Agents" text="Profiles are mapped for the five agents; native GHL agent IDs are added after each agent is created inside GHL." state={fiveAgentsMapped ? "ready" : "needs-setup"} />
            <IntegrationCard title="GoHighLevel Conversations" text="Conversation output is captured in this app and sent to GHL as contact notes during manual sync." state={fiveAgentsMapped ? "ready" : "needs-setup"} />
            <IntegrationCard title="GoHighLevel Workflows" text="Workflow triggers are documented in each profile; existing workflows remain untouched." state={fiveAgentsMapped ? "ready" : "needs-setup"} />
            <IntegrationCard title="GoHighLevel Calendar" text="All five employees are mapped to reusable OBMC calendars." state={fiveAgentsMapped ? "ready" : "needs-setup"} />
            <IntegrationCard title="GoHighLevel Pipelines" text="All five employees are mapped to reusable Agentic Development pipeline stages." state={fiveAgentsMapped ? "ready" : "needs-setup"} />
            <IntegrationCard title="n8n Lead Sync Orchestration" text="Receives AI Employee lead-synced events after successful GoHighLevel sync when the webhook is configured." state={n8nStatus.leadSync === "ready" ? "ready" : "not-connected"} />
            <IntegrationCard title="n8n Purchase Orchestration" text="Optional downstream notification after Stripe purchase records are safely stored in the app." state={n8nStatus.purchaseWebhook === "ready" ? "ready" : "optional"} />
            <IntegrationCard title="Lead Generation" text="Future module for compliant discovery. It is not part of the current build." state="under-development" />
            <IntegrationCard title="Optional AI Testing Upgrade" text="Optional richer test conversations. The current build works with the built-in test engine." state={aiProvider.configured ? "ready" : "optional"} />
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
  const notReadyLabel = {
    "needs-setup": "Needs setup",
    "not-connected": "Not connected",
    optional: "Optional",
    "under-development": "Under development"
  }[stateWhenNotReady];

  return (
    <div className="health-card">
      <span>{label}</span>
      <strong>{ready ? "Ready" : notReadyLabel}</strong>
      <SetupBadge state={state} />
    </div>
  );
}

function ChecklistItem({
  ready,
  state,
  text
}: {
  ready: boolean;
  state?: BadgeState;
  text: string;
}) {
  return (
    <li>
      <span>{text}</span>
      <SetupBadge state={state ?? (ready ? "ready" : "needs-setup")} />
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
    optional: "Optional",
    ready: "Ready",
    "needs-setup": "Needs setup",
    "not-connected": "Not connected",
    "under-development": "Under development"
  }[state];

  return <span className={`setup-badge ${state}`}>{label}</span>;
}
