import Link from "next/link";
import { requireAiEmployeesAccess } from "@/ai-employees/auth";
import { AppFrame } from "@/ai-employees/components/app-frame";
import { StatCard } from "@/ai-employees/components/stat-card";
import { getGoHighLevelStatus } from "@/ai-employees/integrations/gohighlevel/client";
import { getLatestGhlDiscoveryReport } from "@/ai-employees/data/ghl-discovery";
import { listGhlAiAgentProfiles } from "@/ai-employees/data/ghl-profiles";
import {
  buildAiEmployeeOsRequirements,
  ghlDiscoveryCategories,
  ghlSafeIntegrationRules,
  summarizeDiscovery
} from "@/ai-employees/integrations/gohighlevel-native/discovery-policy";

const aiEmployeeRequirements = buildAiEmployeeOsRequirements();

export default async function GoHighLevelPage() {
  await requireAiEmployeesAccess();
  const [profiles, latestDiscovery] = await Promise.all([
    listGhlAiAgentProfiles(),
    getLatestGhlDiscoveryReport()
  ]);
  const ghlStatus = getGoHighLevelStatus();
  const exported = profiles.filter((profile) => profile.deployment_status === "exported").length;
  const connected = profiles.filter((profile) => profile.deployment_status === "connected").length;
  const live = profiles.filter((profile) => profile.deployment_status === "live").length;
  const discoverySummary = summarizeDiscovery(latestDiscovery);

  return (
    <AppFrame
      actions={
        <Link className="button" href="/ai-employees/gohighlevel/discovery">
          Discovery inventory
        </Link>
      }
      eyebrow="Primary execution layer"
      subtitle="Use One Big Media Company AI Employees as the control center and GoHighLevel as the native execution layer, with discovery before any production change."
      title="GoHighLevel Safe Integration"
    >
      <section className="grid stats-grid compact-stats">
        <StatCard label="GHL Profiles" value={profiles.length} detail="Saved AI Agent profiles" />
        <StatCard label="Prepared" value={exported} detail="Copy-ready packages marked prepared" />
        <StatCard label="Connected" value={connected} detail="Profiles marked connected" />
        <StatCard label="Live" value={live} detail="Native GHL agents in Auto-Pilot" />
        <StatCard label="Discovery" value={discoverySummary.status.replaceAll("_", " ")} detail={`${discoverySummary.inventoryCount} resources inventoried`} />
      </section>

      <div className="settings-grid">
        <section className="card">
          <h2>Read-Only Guardrails</h2>
          <ul className="checklist">
            {ghlSafeIntegrationRules.map((rule) => (
              <ChecklistItem key={rule} ready text={rule} />
            ))}
          </ul>
        </section>

        <section className="card">
          <h2>Connection Status</h2>
          <ul className="checklist">
            <ChecklistItem ready={Boolean(process.env.GHL_API_KEY || process.env.GOHIGHLEVEL_API_KEY)} text="GHL API key present for future API discovery" />
            <ChecklistItem ready={Boolean(process.env.GHL_LOCATION_ID || process.env.GOHIGHLEVEL_LOCATION_ID)} text="GHL location ID configured" />
            <ChecklistItem ready={latestDiscovery?.status === "discovered"} text="Read-only discovery inventory complete" />
            <ChecklistItem ready={discoverySummary.unknownCount === 0} text="Gap analysis evaluated against inventory" />
          </ul>
        </section>
      </div>

      <div className="dashboard-grid">
        <section className="card">
          <h2>Discovery Scope</h2>
          <div className="resource-list">
            {ghlDiscoveryCategories.map((category) => (
              <div className="resource-row" key={category.title}>
                <strong>{category.title}</strong>
                <span>{category.resources.join(", ")}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="card">
          <h2>Gap Analysis</h2>
          <div className="metric-list">
            <Metric label="Existing / reusable" value={discoverySummary.existingCount} />
            <Metric label="Missing after discovery" value={discoverySummary.missingCount} />
            <Metric label="Unknown until discovery" value={discoverySummary.unknownCount} />
            <Metric label="Potential conflicts" value={discoverySummary.conflictCount} />
          </div>
          <Link className="button secondary full-button" href="/ai-employees/gohighlevel/discovery">
            Review inventory and gaps
          </Link>
        </section>

        <section className="card">
          <h2>AI Employee OS Requirements</h2>
          <div className="chip-row">
            {aiEmployeeRequirements.slice(0, 24).map((item) => (
              <span className="mini-chip" key={`${item.resource_type}-${item.requirement}`}>{item.requirement}</span>
            ))}
          </div>
        </section>
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

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="metric-row">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
