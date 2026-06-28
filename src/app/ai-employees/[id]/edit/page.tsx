import { notFound } from "next/navigation";
import { updateAiEmployeeAction } from "@/ai-employees/actions";
import { requireAiEmployeesAccess } from "@/ai-employees/auth";
import { AppFrame } from "@/ai-employees/components/app-frame";
import { EmployeeForm } from "@/ai-employees/components/employee-form";
import { getAiEmployeeDetail } from "@/ai-employees/data/repository";

export default async function EditAiEmployeePage({
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

  const action = updateAiEmployeeAction.bind(null, detail.employee.id);

  return (
    <AppFrame
      eyebrow="Edit settings"
      subtitle={detail.employee.business_name}
      title={detail.employee.name}
    >
      <EmployeeForm action={action} employee={detail.employee} submitLabel="Save settings" />
    </AppFrame>
  );
}
