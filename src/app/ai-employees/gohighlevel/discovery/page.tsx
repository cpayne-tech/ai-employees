import Link from "next/link";
import { requireAiEmployeesAccess } from "@/ai-employees/auth";
import { AppFrame } from "@/ai-employees/components/app-frame";
import { getLatestGhlDiscoveryReport } from "@/ai-employees/data/ghl-discovery";
import {
  buildAiEmployeeOsRequirements,
  buildDiscoveryInventoryTemplate,
  buildGapAnalysisFromInventory,
  ghlDiscoveryCategories,
  ghlSafeIntegrationRules,
  summarizeDiscovery
} from "@/ai-employees/integrations/gohighlevel-native/discovery-policy";

const requirements = buildAiEmployeeOsRequirements();

export default async function GhlDiscoveryPage() {
  await requireAiEmployeesAccess();
  const latestDiscovery = await getLatestGhlDiscoveryReport();
  const summary = summarizeDiscovery(latestDiscovery);
  const gapAnalysis = latestDiscovery?.gap_analysis.length
    ? latestDiscovery.gap_analysis
    : buildGapAnalysisFromInventory(latestDiscovery);
  const inventoryRows = latestDiscovery?.inventory.length
    ? latestDiscovery.inventory
    : buildDiscoveryInventoryTemplate();

  return (
    <AppFrame
      actions={
        <Link className="button secondary" href="/ai-employees/gohighlevel">
          Back to GoHighLevel
        </Link>
      }
      eyebrow="Discovery first"
      subtitle="This is the reference point for safe GoHighLevel integration. Existing resources are production data and remain untouched."
      title="GoHighLevel Discovery Inventory"
    >
      <section className="grid stats-grid compact-stats">
        <SummaryCard label="Discovery status" value={summary.status.replaceAll("_", " ")} />
        <SummaryCard label="Inventory rows" value={summary.inventoryCount} />
        <SummaryCard label="Unknown gaps" value={summary.unknownCount} />
        <SummaryCard label="Conflicts" value={summary.conflictCount} />
      </section>

      <section className="card">
        <h2>Safe Integration Policy</h2>
        <ul className="checklist">
          {ghlSafeIntegrationRules.map((rule) => (
            <li key={rule}>
              <span>{rule}</span>
              <span className="setup-badge ready">Locked</span>
            </li>
          ))}
        </ul>
      </section>

      <div className="settings-grid">
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
          <h2>Current Report</h2>
          <div className="detail-list">
            <Detail label="Account" value={latestDiscovery?.account_name ?? "Not discovered"} />
            <Detail label="Location ID" value={latestDiscovery?.location_id ?? "Not discovered"} />
            <Detail label="Source" value={latestDiscovery?.source ?? "none"} />
            <Detail label="Discovered at" value={latestDiscovery?.discovered_at ?? "Not complete"} />
            <Detail label="Blocked reason" value={latestDiscovery?.blocked_reason ?? "None recorded"} />
          </div>
        </section>
      </div>

      <section className="card">
        <h2>Inventory Reference</h2>
        <p className="muted">
          Each discovered production object must be recorded with name, type, ID, status, purpose, usage, and notes before any creation plan is approved.
        </p>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Resource Name</th>
                <th>Type</th>
                <th>Resource ID</th>
                <th>Status</th>
                <th>Purpose</th>
                <th>Used By</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {inventoryRows.map((resource, index) => (
                <tr key={`${resource.type}-${resource.resource_id ?? index}`}>
                  <td>{resource.name || "Pending discovery"}</td>
                  <td>{resource.type.replaceAll("_", " ")}</td>
                  <td>{resource.resource_id ?? "Unknown"}</td>
                  <td>{resource.status ?? "Unknown"}</td>
                  <td>{resource.purpose ?? "Unknown"}</td>
                  <td>{resource.used_by ?? "Unknown"}</td>
                  <td>{resource.notes ?? "No notes"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card">
        <h2>Gap Analysis</h2>
        <p className="muted">
          Unknown is intentional until discovery is complete. Missing does not mean create immediately; search, reuse, approval, creation, verification, and ID recording still apply.
        </p>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Requirement</th>
                <th>Type</th>
                <th>Status</th>
                <th>Reusable Resource</th>
                <th>Recommended Action</th>
              </tr>
            </thead>
            <tbody>
              {gapAnalysis.map((gap) => (
                <tr key={`${gap.resource_type}-${gap.requirement}`}>
                  <td>{gap.requirement}</td>
                  <td>{gap.resource_type.replaceAll("_", " ")}</td>
                  <td><span className={`setup-badge ${gap.status === "existing" ? "ready" : "needs-setup"}`}>{gap.status}</span></td>
                  <td>{gap.reusable_resource_name ?? gap.existing_resource_id ?? "None confirmed"}</td>
                  <td>{gap.recommended_action}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card">
        <h2>Creation Candidates</h2>
        <p className="muted">
          These are requirements only. They become creation candidates only after a completed inventory proves no equivalent production resource exists.
        </p>
        <div className="chip-row">
          {requirements.map((item) => (
            <span className="mini-chip" key={`${item.resource_type}-${item.requirement}`}>{item.requirement}</span>
          ))}
        </div>
      </section>
    </AppFrame>
  );
}

function SummaryCard({ label, value }: { label: string; value: number | string }) {
  return (
    <section className="stat-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </section>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="detail-row">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
