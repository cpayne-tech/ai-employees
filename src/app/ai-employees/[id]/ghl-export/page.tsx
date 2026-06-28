import Link from "next/link";
import { notFound } from "next/navigation";
import { markGhlAiAgentProfileExportedAction } from "@/ai-employees/actions";
import { requireAiEmployeesAccess } from "@/ai-employees/auth";
import { AppFrame } from "@/ai-employees/components/app-frame";
import { getLatestGhlDiscoveryReport } from "@/ai-employees/data/ghl-discovery";
import { getGhlAiAgentProfileForEmployee } from "@/ai-employees/data/ghl-profiles";
import { getAiEmployeeDetail } from "@/ai-employees/data/repository";
import { buildGhlPromptExportPackage } from "@/ai-employees/integrations/gohighlevel-native/prompt-export-builder";

export default async function GhlExportPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAiEmployeesAccess();
  const { id } = await params;
  const [detail, profile, discovery] = await Promise.all([
    getAiEmployeeDetail(id),
    getGhlAiAgentProfileForEmployee(id),
    getLatestGhlDiscoveryReport()
  ]);

  if (!detail) {
    notFound();
  }

  const exportPackage = buildGhlPromptExportPackage(detail.employee, profile);

  return (
    <AppFrame
      actions={
        <>
          <Link className="button secondary" href={`/ai-employees/${detail.employee.id}/ghl-profile`}>
            Edit GHL profile
          </Link>
          {profile ? (
            <form action={markGhlAiAgentProfileExportedAction.bind(null, detail.employee.id, profile.id)}>
              <button className="button" type="submit">Mark package prepared</button>
            </form>
          ) : null}
        </>
      }
      eyebrow="Copy-ready GoHighLevel Export"
      subtitle="Use this package only after read-only discovery confirms which existing GHL resources should be reused. No secrets are included."
      title={exportPackage.title}
    >
      <div className="setup-note">
        Safe integration mode: this export does not create, edit, overwrite, rename, disable, archive, or delete any GoHighLevel production resource.
        {discovery?.status === "discovered"
          ? " Discovery is marked complete; verify each reusable ID before configuring GHL."
          : " Discovery is not complete; treat every setup target below as planning material only."}
      </div>

      {!profile ? (
        <div className="setup-note">
          This export is generated from employee defaults. Save a GHL profile first if you want edits and export status tracked.
        </div>
      ) : null}

      <div className="export-grid">
        {exportPackage.sections.map((section) => (
          <section className="card export-section" key={section.title}>
            <div className="section-header">
              <div>
                <h2>{section.title}</h2>
                <p className="muted">Copy this into the matching GoHighLevel AI Agent setup area.</p>
              </div>
            </div>
            <textarea readOnly value={section.body} />
          </section>
        ))}
      </div>
    </AppFrame>
  );
}
