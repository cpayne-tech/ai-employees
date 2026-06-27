import { randomUUID } from "crypto";
import { unstable_noStore as noStore } from "next/cache";
import type {
  AiEmployee,
  AiEmployeeAppointment,
  AiEmployeeConversation,
  AiEmployeeDetail,
  AiEmployeeEscalation,
  AiEmployeeLead,
  AiEmployeeSummary,
  ExtractedLead,
  TranscriptMessage
} from "@/ai-employees/types";
import { demoOwnerId } from "@/ai-employees/data/seed";
import { readDevStore, writeDevStore } from "@/ai-employees/data/dev-store";
import { getSupabaseAdminClient } from "@/lib/supabase/server";

export type AiEmployeeInput = Omit<
  AiEmployee,
  "id" | "owner_id" | "created_at" | "updated_at"
>;

const ownerId = () => process.env.AI_EMPLOYEES_OWNER_ID ?? demoOwnerId;

function now() {
  return new Date().toISOString();
}

function summarizeEmployee(
  employee: AiEmployee,
  conversations: AiEmployeeConversation[],
  leads: AiEmployeeLead[],
  appointments: AiEmployeeAppointment[],
  escalations: AiEmployeeEscalation[]
): AiEmployeeSummary {
  const employeeConversations = conversations.filter(
    (item) => item.ai_employee_id === employee.id
  );
  const lastActiveAt = employeeConversations
    .map((item) => item.updated_at)
    .sort()
    .at(-1);

  return {
    ...employee,
    total_leads: leads.filter((item) => item.ai_employee_id === employee.id)
      .length,
    total_conversations: employeeConversations.length,
    total_appointments: appointments.filter(
      (item) => item.ai_employee_id === employee.id
    ).length,
    total_escalations: escalations.filter(
      (item) => item.ai_employee_id === employee.id
    ).length,
    last_active_at: lastActiveAt ?? null
  };
}

function parseRequiredFields(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map(String);
  }

  return [];
}

function normalizeEmployee(row: Record<string, unknown>): AiEmployee {
  return {
    ...(row as unknown as AiEmployee),
    required_lead_fields: parseRequiredFields(row.required_lead_fields)
  };
}

export async function listAiEmployees(): Promise<AiEmployeeSummary[]> {
  noStore();
  const supabase = getSupabaseAdminClient();

  if (supabase) {
    const { data, error } = await supabase
      .from("ai_employees")
      .select(
        "*, ai_employee_conversations(id, updated_at), ai_employee_leads(id), ai_employee_appointments(id), ai_employee_escalations(id)"
      )
      .eq("owner_id", ownerId())
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return (data ?? []).map((row) =>
      summarizeEmployee(
        normalizeEmployee(row),
        (row.ai_employee_conversations ?? []) as AiEmployeeConversation[],
        (row.ai_employee_leads ?? []) as AiEmployeeLead[],
        (row.ai_employee_appointments ?? []) as AiEmployeeAppointment[],
        (row.ai_employee_escalations ?? []) as AiEmployeeEscalation[]
      )
    );
  }

  const store = await readDevStore();
  return store.employees.map((employee) =>
    summarizeEmployee(
      employee,
      store.conversations,
      store.leads,
      store.appointments,
      store.escalations
    )
  );
}

export async function getAiEmployeeDetail(
  id: string
): Promise<AiEmployeeDetail | null> {
  noStore();
  const supabase = getSupabaseAdminClient();

  if (supabase) {
    const { data: employee, error } = await supabase
      .from("ai_employees")
      .select("*")
      .eq("id", id)
      .eq("owner_id", ownerId())
      .single();

    if (error || !employee) {
      return null;
    }

    const [
      { data: conversations },
      { data: leads },
      { data: appointments },
      { data: escalations }
    ] = await Promise.all([
      supabase
        .from("ai_employee_conversations")
        .select("*")
        .eq("ai_employee_id", id)
        .order("updated_at", { ascending: false }),
      supabase
        .from("ai_employee_leads")
        .select("*")
        .eq("ai_employee_id", id)
        .order("created_at", { ascending: false }),
      supabase
        .from("ai_employee_appointments")
        .select("*")
        .eq("ai_employee_id", id)
        .order("created_at", { ascending: false }),
      supabase
        .from("ai_employee_escalations")
        .select("*")
        .eq("ai_employee_id", id)
        .order("created_at", { ascending: false })
    ]);

    const normalizedEmployee = normalizeEmployee(employee);
    return {
      employee: summarizeEmployee(
        normalizedEmployee,
        (conversations ?? []) as AiEmployeeConversation[],
        (leads ?? []) as AiEmployeeLead[],
        (appointments ?? []) as AiEmployeeAppointment[],
        (escalations ?? []) as AiEmployeeEscalation[]
      ),
      conversations: (conversations ?? []) as AiEmployeeConversation[],
      leads: (leads ?? []) as AiEmployeeLead[],
      appointments: (appointments ?? []) as AiEmployeeAppointment[],
      escalations: (escalations ?? []) as AiEmployeeEscalation[]
    };
  }

  const store = await readDevStore();
  const employee = store.employees.find((item) => item.id === id);

  if (!employee) {
    return null;
  }

  return {
    employee: summarizeEmployee(
      employee,
      store.conversations,
      store.leads,
      store.appointments,
      store.escalations
    ),
    conversations: store.conversations.filter(
      (item) => item.ai_employee_id === id
    ),
    leads: store.leads.filter((item) => item.ai_employee_id === id),
    appointments: store.appointments.filter(
      (item) => item.ai_employee_id === id
    ),
    escalations: store.escalations.filter(
      (item) => item.ai_employee_id === id
    )
  };
}

export async function createAiEmployee(input: AiEmployeeInput) {
  const supabase = getSupabaseAdminClient();
  const timestamp = now();
  const employee: AiEmployee = {
    ...input,
    id: randomUUID(),
    owner_id: ownerId(),
    created_at: timestamp,
    updated_at: timestamp
  };

  if (supabase) {
    const { data, error } = await supabase
      .from("ai_employees")
      .insert(employee)
      .select("*")
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return normalizeEmployee(data);
  }

  const store = await readDevStore();
  store.employees.unshift(employee);
  await writeDevStore(store);
  return employee;
}

export async function updateAiEmployee(id: string, input: AiEmployeeInput) {
  const supabase = getSupabaseAdminClient();
  const update = { ...input, updated_at: now() };

  if (supabase) {
    const { data, error } = await supabase
      .from("ai_employees")
      .update(update)
      .eq("id", id)
      .eq("owner_id", ownerId())
      .select("*")
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return normalizeEmployee(data);
  }

  const store = await readDevStore();
  const index = store.employees.findIndex((item) => item.id === id);

  if (index === -1) {
    throw new Error("AI employee not found.");
  }

  store.employees[index] = { ...store.employees[index], ...update };
  await writeDevStore(store);
  return store.employees[index];
}

export async function saveTestConversation(input: {
  employee: AiEmployee;
  conversationId?: string;
  transcript: TranscriptMessage[];
  extractedLead: ExtractedLead;
  status: string;
}) {
  const supabase = getSupabaseAdminClient();
  const timestamp = now();
  const conversation: AiEmployeeConversation = {
    id: input.conversationId ?? randomUUID(),
    ai_employee_id: input.employee.id,
    owner_id: ownerId(),
    visitor_name: input.extractedLead.name ?? null,
    visitor_email: input.extractedLead.email ?? null,
    visitor_phone: input.extractedLead.phone ?? null,
    status: input.status,
    mode: "test",
    transcript: input.transcript,
    extracted_lead: input.extractedLead,
    summary: summarizeTranscript(input.transcript),
    created_at: timestamp,
    updated_at: timestamp
  };

  if (supabase) {
    const { data, error } = await supabase
      .from("ai_employee_conversations")
      .upsert(conversation)
      .select("*")
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data as AiEmployeeConversation;
  }

  const store = await readDevStore();
  const index = store.conversations.findIndex(
    (item) => item.id === conversation.id
  );
  if (index >= 0) {
    conversation.created_at = store.conversations[index].created_at;
    store.conversations[index] = conversation;
  } else {
    store.conversations.unshift(conversation);
  }
  await writeDevStore(store);
  return conversation;
}

export async function saveExtractedLead(input: {
  employee: AiEmployee;
  conversationId: string;
  lead: ExtractedLead;
}) {
  if (!input.lead.name && !input.lead.email && !input.lead.phone) {
    return null;
  }

  const supabase = getSupabaseAdminClient();
  const timestamp = now();
  const lead: AiEmployeeLead = {
    id: randomUUID(),
    ai_employee_id: input.employee.id,
    conversation_id: input.conversationId,
    owner_id: ownerId(),
    name: input.lead.name ?? null,
    email: input.lead.email ?? null,
    phone: input.lead.phone ?? null,
    service_needed: input.lead.service_needed ?? input.lead.coverage_goal ?? null,
    preferred_time: input.lead.preferred_time ?? null,
    status: input.lead.qualified ? "qualified" : "captured",
    source: "test",
    notes: input.lead.notes ?? null,
    created_at: timestamp,
    updated_at: timestamp
  };

  if (supabase) {
    const { data: existing } = await supabase
      .from("ai_employee_leads")
      .select("id, created_at")
      .eq("conversation_id", input.conversationId)
      .maybeSingle();

    const { data, error } = await supabase
      .from("ai_employee_leads")
      .upsert(existing ? { ...lead, id: existing.id } : lead)
      .select("*")
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data as AiEmployeeLead;
  }

  const store = await readDevStore();
  const index = store.leads.findIndex(
    (item) => item.conversation_id === input.conversationId
  );
  if (index >= 0) {
    lead.id = store.leads[index].id;
    lead.created_at = store.leads[index].created_at;
    store.leads[index] = lead;
  } else {
    store.leads.unshift(lead);
  }
  await writeDevStore(store);
  return lead;
}

export async function createAppointmentRequest(input: {
  employee: AiEmployee;
  conversationId: string;
  leadId?: string | null;
  requestedTime: string;
  notes?: string;
}) {
  const supabase = getSupabaseAdminClient();
  const timestamp = now();
  const appointment: AiEmployeeAppointment = {
    id: randomUUID(),
    ai_employee_id: input.employee.id,
    conversation_id: input.conversationId,
    lead_id: input.leadId ?? null,
    owner_id: ownerId(),
    requested_time: input.requestedTime,
    appointment_status: "requested",
    notes: input.notes ?? null,
    created_at: timestamp,
    updated_at: timestamp
  };

  if (supabase) {
    const { data: existing } = await supabase
      .from("ai_employee_appointments")
      .select("id, created_at")
      .eq("conversation_id", input.conversationId)
      .maybeSingle();

    const { data, error } = await supabase
      .from("ai_employee_appointments")
      .upsert(existing ? { ...appointment, id: existing.id } : appointment)
      .select("*")
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data as AiEmployeeAppointment;
  }

  const store = await readDevStore();
  const index = store.appointments.findIndex(
    (item) => item.conversation_id === input.conversationId
  );
  if (index >= 0) {
    appointment.id = store.appointments[index].id;
    appointment.created_at = store.appointments[index].created_at;
    store.appointments[index] = appointment;
  } else {
    store.appointments.unshift(appointment);
  }
  await writeDevStore(store);
  return appointment;
}

export async function createEscalation(input: {
  employee: AiEmployee;
  conversationId: string;
  leadId?: string | null;
  reason: string;
  message: string;
}) {
  const supabase = getSupabaseAdminClient();
  const timestamp = now();
  const escalation: AiEmployeeEscalation = {
    id: randomUUID(),
    ai_employee_id: input.employee.id,
    conversation_id: input.conversationId,
    lead_id: input.leadId ?? null,
    owner_id: ownerId(),
    reason: input.reason,
    message: input.message,
    status: "open",
    created_at: timestamp,
    updated_at: timestamp
  };

  if (supabase) {
    const { data: existing } = await supabase
      .from("ai_employee_escalations")
      .select("id, created_at")
      .eq("conversation_id", input.conversationId)
      .maybeSingle();

    const { data, error } = await supabase
      .from("ai_employee_escalations")
      .upsert(existing ? { ...escalation, id: existing.id } : escalation)
      .select("*")
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data as AiEmployeeEscalation;
  }

  const store = await readDevStore();
  const index = store.escalations.findIndex(
    (item) => item.conversation_id === input.conversationId
  );
  if (index >= 0) {
    escalation.id = store.escalations[index].id;
    escalation.created_at = store.escalations[index].created_at;
    store.escalations[index] = escalation;
  } else {
    store.escalations.unshift(escalation);
  }
  await writeDevStore(store);
  return escalation;
}

function summarizeTranscript(transcript: TranscriptMessage[]) {
  const visitorMessages = transcript
    .filter((item) => item.role === "visitor")
    .map((item) => item.content)
    .join(" ");

  if (!visitorMessages) {
    return "Test conversation started.";
  }

  return visitorMessages.slice(0, 220);
}
