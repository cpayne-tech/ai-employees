import { promises as fs } from "fs";
import path from "path";
import type {
  AiEmployee,
  AiEmployeeAppointment,
  AiEmployeeConversation,
  AiEmployeeCustomer,
  AiEmployeeCustomerIntake,
  AiEmployeeCustomerPurchase,
  AiEmployeeCustomerSetupTask,
  AiEmployeeEscalation,
  AiEmployeeLead,
  AiEmployeeStripeEvent,
  GhlAiAgentProfile,
  GhlDiscoveryReport
} from "@/ai-employees/types";

export type DevStore = {
  employees: AiEmployee[];
  conversations: AiEmployeeConversation[];
  leads: AiEmployeeLead[];
  appointments: AiEmployeeAppointment[];
  escalations: AiEmployeeEscalation[];
  customers: AiEmployeeCustomer[];
  customerIntakes: AiEmployeeCustomerIntake[];
  customerPurchases: AiEmployeeCustomerPurchase[];
  customerSetupTasks: AiEmployeeCustomerSetupTask[];
  stripeEvents: AiEmployeeStripeEvent[];
  ghlProfiles: GhlAiAgentProfile[];
  ghlDiscoveryReports: GhlDiscoveryReport[];
};

const storePath = path.join(process.cwd(), ".data", "ai-employees.json");

const emptyStore = (): DevStore => ({
  employees: [],
  conversations: [],
  leads: [],
  appointments: [],
  escalations: [],
  customers: [],
  customerIntakes: [],
  customerPurchases: [],
  customerSetupTasks: [],
  stripeEvents: [],
  ghlProfiles: [],
  ghlDiscoveryReports: []
});

export async function readDevStore(): Promise<DevStore> {
  try {
    const raw = await fs.readFile(storePath, "utf8");
    const parsed = JSON.parse(raw) as DevStore;

    return {
      employees: parsed.employees ?? [],
      conversations: parsed.conversations ?? [],
      leads: parsed.leads ?? [],
      appointments: parsed.appointments ?? [],
      escalations: parsed.escalations ?? [],
      customers: parsed.customers ?? [],
      customerIntakes: parsed.customerIntakes ?? [],
      customerPurchases: parsed.customerPurchases ?? [],
      customerSetupTasks: parsed.customerSetupTasks ?? [],
      stripeEvents: parsed.stripeEvents ?? [],
      ghlProfiles: parsed.ghlProfiles ?? [],
      ghlDiscoveryReports: parsed.ghlDiscoveryReports ?? []
    };
  } catch {
    const fresh = emptyStore();
    await writeDevStore(fresh);
    return fresh;
  }
}

export async function writeDevStore(store: DevStore) {
  await fs.mkdir(path.dirname(storePath), { recursive: true });
  await fs.writeFile(storePath, JSON.stringify(store, null, 2), "utf8");
}
