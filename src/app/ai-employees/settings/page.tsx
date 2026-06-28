import { requireAiEmployeesAccess } from "@/ai-employees/auth";
import { getAiProviderStatus } from "@/ai-employees/ai";
import { AppFrame } from "@/ai-employees/components/app-frame";
import { getSupabaseAdminClient } from "@/lib/supabase/server";

export default async function AiEmployeesSettingsPage() {
  await requireAiEmployeesAccess();
  const aiProvider = getAiProviderStatus();
  const supabaseConnected = Boolean(getSupabaseAdminClient());
  const ownerExists = Boolean(process.env.AI_EMPLOYEES_OWNER_ID);

  return (
    <AppFrame>
      <div className="page-header">
        <div>
          <div className="eyebrow">Admin setup</div>
          <h1>Settings</h1>
          <p className="muted">Configuration health without exposing secret values.</p>
        </div>
      </div>

      <div className="grid two-column-grid">
        <section className="card">
          <h2>App status</h2>
          <div className="detail-list">
            <Detail label="Owner id exists" value={ownerExists ? "yes" : "no"} />
            <Detail label="Supabase connected" value={supabaseConnected ? "yes" : "no"} />
            <Detail label="AI provider configured" value={aiProvider.configured ? `yes (${aiProvider.provider})` : "no"} />
            <Detail label="GoHighLevel integration" value="not connected" />
          </div>
        </section>

        <section className="card">
          <h2>Environment checklist</h2>
          <ul className="checklist">
            <li data-ok={Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL)}>Supabase URL configured</li>
            <li data-ok={Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY)}>Supabase service role configured server-side</li>
            <li data-ok={ownerExists}>AI employee owner configured</li>
            <li data-ok={Boolean(process.env.AI_EMPLOYEES_ADMIN_PASSWORD)}>Admin password configured</li>
            <li data-ok={Boolean(process.env.AI_EMPLOYEES_SESSION_SECRET)}>Session secret configured</li>
            <li data-ok={aiProvider.configured}>AI provider key configured for future live AI responses</li>
          </ul>
        </section>
      </div>
    </AppFrame>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="detail-item">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
