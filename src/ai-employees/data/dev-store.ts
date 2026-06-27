import { promises as fs } from "fs";
import path from "path";
import type {
  AiEmployee,
  AiEmployeeAppointment,
  AiEmployeeConversation,
  AiEmployeeEscalation,
  AiEmployeeLead
} from "@/ai-employees/types";

export type DevStore = {
  employees: AiEmployee[];
  conversations: AiEmployeeConversation[];
  leads: AiEmployeeLead[];
  appointments: AiEmployeeAppointment[];
  escalations: AiEmployeeEscalation[];
};

const storePath = path.join(process.cwd(), ".data", "ai-employees.json");

const emptyStore = (): DevStore => ({
  employees: [],
  conversations: [],
  leads: [],
  appointments: [],
  escalations: []
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
      escalations: parsed.escalations ?? []
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
