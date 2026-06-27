import { createAiEmployeeAction } from "@/ai-employees/actions";
import { AppFrame } from "@/ai-employees/components/app-frame";
import { EmployeeForm } from "@/ai-employees/components/employee-form";

export default function NewAiEmployeePage() {
  return (
    <AppFrame>
      <div className="page-header">
        <div>
          <div className="eyebrow">Create AI employee</div>
          <h1>New receptionist</h1>
          <p className="muted">Configure the business context, lead fields, appointment flow, and escalation rules.</p>
        </div>
      </div>
      <EmployeeForm action={createAiEmployeeAction} submitLabel="Create AI employee" />
    </AppFrame>
  );
}
