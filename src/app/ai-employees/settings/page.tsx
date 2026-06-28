import { requireAiEmployeesAccess } from "@/ai-employees/auth";
import { getAiProviderStatus } from "@/ai-employees/ai";
import { AppFrame } from "@/ai-employees/components/app-frame";
import { getSupabaseAdminClient } from "@/lib/supabase/server";

type BadgeState = "ready" | "needs-setup" | "not-connected";

export default async function AiEmployeesSettingsPage() {
  await requireAiEmployeesAccess();
  const aiProvider = getAiProviderStatus();
  const supabaseConnected = Boolean(getSupabaseAdminClient());
  const ownerExists = Boolean(process.env.AI_EMPLOYEES_OWNER_ID);
  const ghlApiKeyConfigured = Boolean(process.env.GHL_API_KEY || process.env.GOHIGHLEVEL_API_KEY);
  const ghlLocationConfigured = Boolean(process.env.GHL_LOCATION_ID || process.env.GOHIGHLEVEL_LOCATION_ID);

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
            <HealthCard label="AI Provider" ready={aiProvider.configured} />
            <HealthCard
              label="GoHighLevel"
              ready={ghlApiKeyConfigured && ghlLocationConfigured}
              stateWhenNotReady="not-connected"
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
              <ChecklistItem ready={aiProvider.configured} text="AI provider key configured" />
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
                <IntegrationRow label="AI Provider" state={aiProvider.configured ? "ready" : "needs-setup"} />
                <IntegrationRow label="GoHighLevel" state="not-connected" />
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
                <li>Add AI provider key</li>
                <li>Add GoHighLevel credentials</li>
                <li>Connect calendar/booking workflow</li>
                <li>Test AI employee flow</li>
                <li>Deploy public widget or lead capture endpoint</li>
              </ol>
            </section>
          </div>
        </div>
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

function SetupBadge({ state }: { state: BadgeState }) {
  const label = {
    ready: "Ready",
    "needs-setup": "Needs setup",
    "not-connected": "Not connected"
  }[state];

  return <span className={`setup-badge ${state}`}>{label}</span>;
}
