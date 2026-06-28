import { createAiEmployeeAction } from "@/ai-employees/actions";
import { requireAiEmployeesAccess } from "@/ai-employees/auth";
import { AppFrame } from "@/ai-employees/components/app-frame";
import { EmployeeForm } from "@/ai-employees/components/employee-form";

export default async function NewAiEmployeePage() {
  await requireAiEmployeesAccess();

  return (
    <AppFrame
      eyebrow="Create AI employee"
      subtitle="Configure the business context, lead fields, appointment flow, and escalation rules."
      title="New AI Employee"
    >
      <EmployeeForm action={createAiEmployeeAction} submitLabel="Create AI employee" />
    </AppFrame>
  );
}
