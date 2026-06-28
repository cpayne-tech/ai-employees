import Link from "next/link";
import { notFound } from "next/navigation";
import { markGhlAiAgentProfileExportedAction } from "@/ai-employees/actions";
import { requireAiEmployeesAccess } from "@/ai-employees/auth";
import { AppFrame } from "@/ai-employees/components/app-frame";
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
  const [detail, profile] = await Promise.all([
    getAiEmployeeDetail(id),
    getGhlAiAgentProfileForEmployee(id)
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
              <button className="button" type="submit">Mark exported</button>
            </form>
          ) : null}
        </>
      }
      eyebrow="Copy-ready GoHighLevel Export"
      subtitle="Use this package to configure the matching native GoHighLevel AI Agent. No secrets are included."
      title={exportPackage.title}
    >
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
