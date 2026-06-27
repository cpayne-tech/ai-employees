import type { AiEmployeeStatus } from "@/ai-employees/types";

export function StatusBadge({ status }: { status: AiEmployeeStatus | string }) {
  return <span className={`badge ${status}`}>{status}</span>;
}
