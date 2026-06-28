import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAiEmployeesAccess } from "@/ai-employees/auth";
import { AppFrame } from "@/ai-employees/components/app-frame";
import { ConversationTester } from "@/ai-employees/components/conversation-tester";
import { StatusBadge } from "@/ai-employees/components/status-badge";
import { getAiProviderStatus } from "@/ai-employees/ai";
import { getAiEmployeeDetail } from "@/ai-employees/data/repository";

export default async function TestAiEmployeePage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAiEmployeesAccess();
  const { id } = await params;
  const detail = await getAiEmployeeDetail(id);

  if (!detail) {
    notFound();
  }

  const provider = getAiProviderStatus();

  return (
    <AppFrame
      actions={
        <>
          <Link href={`/ai-employees/${detail.employee.id}`} className="button secondary">
            Back to details
          </Link>
          <Link href={`/ai-employees/${detail.employee.id}/edit`} className="button secondary">
            Edit config
          </Link>
        </>
      }
      eyebrow="Internal Simulation"
      subtitle={`${detail.employee.type} for ${detail.employee.business_name}`}
      title={detail.employee.name}
    >
      <div className="button-row" style={{ marginBottom: 18 }}>
        <StatusBadge status={detail.employee.status} />
      </div>

      {!provider.configured ? (
        <div className="setup-note">
          Simulation provider not configured. Internal Simulation is using the safe local mock response layer until `OPENAI_API_KEY` is added.
        </div>
      ) : null}

      <ConversationTester employee={detail.employee} />
    </AppFrame>
  );
}
