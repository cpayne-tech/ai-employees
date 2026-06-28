import { randomUUID } from "crypto";
import { unstable_noStore as noStore } from "next/cache";
import type {
  AiEmployee,
  AiEmployeeAppointment,
  AiEmployeeConversation,
  AiEmployeeCustomer,
  AiEmployeeCustomerDetail,
  AiEmployeeCustomerIntake,
  AiEmployeeCustomerIntakeInput,
  AiEmployeeCustomerOnboardingStatus,
  AiEmployeeCustomerPurchase,
  AiEmployeeCustomerSetupTask,
  AiEmployeeCustomerSetupTaskStatus,
  AiEmployeeCustomerSummary,
  AiEmployeeDetail,
  AiEmployeeEscalation,
  AiEmployeeLead,
  AiEmployeeSummary,
  AiEmployeeStripeEvent,
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

export type AiEmployeeFilters = {
  status?: string;
  type?: string;
  search?: string;
  includeArchived?: boolean;
};

export type StripePurchaseEventInput = {
  eventId: string;
  eventType: string;
  livemode: boolean;
  planId?: string | null;
  planName?: string | null;
  customerEmail?: string | null;
  customerName?: string | null;
  businessName?: string | null;
  amountTotal?: number | null;
  currency?: string | null;
  paymentStatus?: string | null;
  stripeCustomerId?: string | null;
  stripeCheckoutSessionId?: string | null;
  stripePaymentIntentId?: string | null;
  stripeInvoiceId?: string | null;
  stripeSubscriptionId?: string | null;
  metadata?: Record<string, unknown>;
  rawSummary?: Record<string, unknown>;
  purchasedAt?: string | null;
};

export type ManualCustomerInput = {
  businessName?: string | null;
  contactName?: string | null;
  email: string;
  phone?: string | null;
  website?: string | null;
  planId: string;
  planName?: string | null;
  notes?: string | null;
};

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
    required_lead_fields: parseRequiredFields(row.required_lead_fields),
    ghl_location_id: String(row.ghl_location_id ?? ""),
    ghl_calendar_id: String(row.ghl_calendar_id ?? ""),
    ghl_pipeline_id: String(row.ghl_pipeline_id ?? ""),
    ghl_opportunity_stage_id: String(row.ghl_opportunity_stage_id ?? ""),
    ghl_source_name: String(row.ghl_source_name ?? ""),
    ghl_enabled: Boolean(row.ghl_enabled)
  };
}

function filterEmployeeSummaries(
  employees: AiEmployeeSummary[],
  filters: AiEmployeeFilters = {}
) {
  const search = filters.search?.trim().toLowerCase();

  return employees.filter((employee) => {
    if (!filters.includeArchived && employee.status === "archived") {
      return false;
    }

    if (filters.status && filters.status !== "all" && employee.status !== filters.status) {
      return false;
    }

    if (filters.type && filters.type !== "all" && employee.type !== filters.type) {
      return false;
    }

    if (search) {
      const haystack = `${employee.name} ${employee.business_name}`.toLowerCase();
      if (!haystack.includes(search)) {
        return false;
      }
    }

    return true;
  });
}

export async function listAiEmployees(
  filters: AiEmployeeFilters = {}
): Promise<AiEmployeeSummary[]> {
  noStore();
  const supabase = getSupabaseAdminClient();

  if (supabase) {
    let query = supabase
      .from("ai_employees")
      .select("*")
      .eq("owner_id", ownerId())
      .order("created_at", { ascending: false });

    if (!filters.includeArchived && filters.status !== "archived") {
      query = query.neq("status", "archived");
    }

    if (filters.status && filters.status !== "all") {
      query = query.eq("status", filters.status);
    }

    if (filters.type && filters.type !== "all") {
      query = query.eq("type", filters.type);
    }

    if (filters.search?.trim()) {
      const search = filters.search.trim().replaceAll("%", "");
      query = query.or(`name.ilike.%${search}%,business_name.ilike.%${search}%`);
    }

    const { data: employees, error } = await query;

    if (error) {
      throw new Error(error.message);
    }

    const normalizedEmployees = (employees ?? []).map(normalizeEmployee);
    const employeeIds = normalizedEmployees.map((employee) => employee.id);

    if (!employeeIds.length) {
      return [];
    }

    const [
      { data: conversations, error: conversationsError },
      { data: leads, error: leadsError },
      { data: appointments, error: appointmentsError },
      { data: escalations, error: escalationsError }
    ] = await Promise.all([
      supabase
        .from("ai_employee_conversations")
        .select("*")
        .in("ai_employee_id", employeeIds)
        .eq("owner_id", ownerId()),
      supabase
        .from("ai_employee_leads")
        .select("*")
        .in("ai_employee_id", employeeIds)
        .eq("owner_id", ownerId()),
      supabase
        .from("ai_employee_appointments")
        .select("*")
        .in("ai_employee_id", employeeIds)
        .eq("owner_id", ownerId()),
      supabase
        .from("ai_employee_escalations")
        .select("*")
        .in("ai_employee_id", employeeIds)
        .eq("owner_id", ownerId())
    ]);

    const relatedError =
      conversationsError ?? leadsError ?? appointmentsError ?? escalationsError;

    if (relatedError) {
      throw new Error(relatedError.message);
    }

    return normalizedEmployees.map((employee) =>
      summarizeEmployee(
        employee,
        (conversations ?? []) as AiEmployeeConversation[],
        (leads ?? []) as AiEmployeeLead[],
        (appointments ?? []) as AiEmployeeAppointment[],
        (escalations ?? []) as AiEmployeeEscalation[]
      )
    );
  }

  const store = await readDevStore();
  return filterEmployeeSummaries(
    store.employees.map((employee) =>
      summarizeEmployee(
        normalizeEmployee(employee as unknown as Record<string, unknown>),
        store.conversations,
        store.leads,
        store.appointments,
        store.escalations
      )
    ),
    filters
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
        .eq("owner_id", ownerId())
        .order("updated_at", { ascending: false }),
      supabase
        .from("ai_employee_leads")
        .select("*")
        .eq("ai_employee_id", id)
        .eq("owner_id", ownerId())
        .order("created_at", { ascending: false }),
      supabase
        .from("ai_employee_appointments")
        .select("*")
        .eq("ai_employee_id", id)
        .eq("owner_id", ownerId())
        .order("created_at", { ascending: false }),
      supabase
        .from("ai_employee_escalations")
        .select("*")
        .eq("ai_employee_id", id)
        .eq("owner_id", ownerId())
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

export async function updateAiEmployeeStatus(
  id: string,
  status: AiEmployee["status"]
) {
  const supabase = getSupabaseAdminClient();
  const update = { status, updated_at: now() };

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
  return normalizeEmployee(store.employees[index] as unknown as Record<string, unknown>);
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
    ghl_note_id: null,
    ghl_sync_status: "not_synced",
    ghl_last_synced_at: null,
    ghl_sync_error: null,
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
    service_needed: input.lead.service_needed ?? null,
    preferred_time: input.lead.preferred_time ?? null,
    status: input.lead.qualification_status === "unqualified"
      ? "unqualified"
      : input.lead.qualified
        ? "qualified"
        : "captured",
    source: "test",
    notes: input.lead.notes ?? null,
    ghl_contact_id: null,
    ghl_opportunity_id: null,
    ghl_sync_status: "not_synced",
    ghl_last_synced_at: null,
    ghl_sync_error: null,
    created_at: timestamp,
    updated_at: timestamp
  };

  if (supabase) {
    const { data: existing } = await supabase
      .from("ai_employee_leads")
      .select("id, created_at")
      .eq("conversation_id", input.conversationId)
      .eq("owner_id", ownerId())
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

export async function updateAiEmployeeLeadStatus(id: string, status: string) {
  const supabase = getSupabaseAdminClient();
  const update = { status, updated_at: now() };

  if (supabase) {
    const { data, error } = await supabase
      .from("ai_employee_leads")
      .update(update)
      .eq("id", id)
      .eq("owner_id", ownerId())
      .select("*")
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data as AiEmployeeLead;
  }

  const store = await readDevStore();
  const index = store.leads.findIndex((item) => item.id === id);

  if (index === -1) {
    throw new Error("Lead not found.");
  }

  store.leads[index] = { ...store.leads[index], ...update };
  await writeDevStore(store);
  return store.leads[index];
}

export async function updateLeadGhlSyncResult(input: {
  id: string;
  status: "synced" | "failed";
  contactId?: string | null;
  opportunityId?: string | null;
  error?: string | null;
}) {
  const supabase = getSupabaseAdminClient();
  const update = {
    ghl_contact_id: input.contactId ?? null,
    ghl_opportunity_id: input.opportunityId ?? null,
    ghl_sync_status: input.status,
    ghl_last_synced_at: now(),
    ghl_sync_error: input.error ?? null,
    updated_at: now()
  };

  if (supabase) {
    const { data, error } = await supabase
      .from("ai_employee_leads")
      .update(update)
      .eq("id", input.id)
      .eq("owner_id", ownerId())
      .select("*")
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data as AiEmployeeLead;
  }

  const store = await readDevStore();
  const index = store.leads.findIndex((item) => item.id === input.id);

  if (index === -1) {
    throw new Error("Lead not found.");
  }

  store.leads[index] = { ...store.leads[index], ...update };
  await writeDevStore(store);
  return store.leads[index];
}

export async function updateConversationGhlSyncResult(input: {
  id: string;
  status: "synced" | "failed";
  noteId?: string | null;
  error?: string | null;
}) {
  const supabase = getSupabaseAdminClient();
  const update = {
    ghl_note_id: input.noteId ?? null,
    ghl_sync_status: input.status,
    ghl_last_synced_at: now(),
    ghl_sync_error: input.error ?? null,
    updated_at: now()
  };

  if (supabase) {
    const { data, error } = await supabase
      .from("ai_employee_conversations")
      .update(update)
      .eq("id", input.id)
      .eq("owner_id", ownerId())
      .select("*")
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data as AiEmployeeConversation;
  }

  const store = await readDevStore();
  const index = store.conversations.findIndex((item) => item.id === input.id);

  if (index === -1) {
    throw new Error("Conversation not found.");
  }

  store.conversations[index] = { ...store.conversations[index], ...update };
  await writeDevStore(store);
  return store.conversations[index];
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
      .eq("owner_id", ownerId())
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
      .eq("owner_id", ownerId())
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
    return "Internal simulation started.";
  }

  return visitorMessages.slice(0, 220);
}

export async function listLeads(filters: {
  employeeId?: string;
  status?: string;
  source?: string;
  search?: string;
} = {}) {
  noStore();
  const supabase = getSupabaseAdminClient();

  if (supabase) {
    let query = supabase
      .from("ai_employee_leads")
      .select("*, ai_employees(name, business_name)")
      .eq("owner_id", ownerId())
      .order("created_at", { ascending: false });

    if (filters.employeeId && filters.employeeId !== "all") {
      query = query.eq("ai_employee_id", filters.employeeId);
    }
    if (filters.status && filters.status !== "all") {
      query = query.eq("status", filters.status);
    }
    if (filters.source && filters.source !== "all") {
      query = query.eq("source", filters.source);
    }
    if (!filters.status || filters.status === "all") {
      query = query.neq("status", "archived");
    }
    if (filters.search?.trim()) {
      const search = filters.search.trim().replaceAll("%", "");
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%,service_needed.ilike.%${search}%`);
    }

    const { data, error } = await query;
    if (error) {
      throw new Error(error.message);
    }
    return (data ?? []) as Array<AiEmployeeLead & { ai_employees?: { name?: string; business_name?: string } }>;
  }

  const store = await readDevStore();
  return store.leads
    .filter((lead) => !filters.employeeId || filters.employeeId === "all" || lead.ai_employee_id === filters.employeeId)
    .filter((lead) => !filters.status || filters.status === "all" || lead.status === filters.status)
    .filter((lead) => filters.status === "archived" || lead.status !== "archived")
    .filter((lead) => !filters.source || filters.source === "all" || lead.source === filters.source)
    .filter((lead) => {
      if (!filters.search?.trim()) {
        return true;
      }
      const search = filters.search.trim().toLowerCase();
      return `${lead.name ?? ""} ${lead.email ?? ""} ${lead.phone ?? ""} ${lead.service_needed ?? ""}`.toLowerCase().includes(search);
    })
    .map((lead) => ({
      ...lead,
      ai_employees: {
        name: store.employees.find((employee) => employee.id === lead.ai_employee_id)?.name,
        business_name: store.employees.find((employee) => employee.id === lead.ai_employee_id)?.business_name
      }
    }));
}

export async function getLeadDetail(id: string) {
  noStore();
  const supabase = getSupabaseAdminClient();

  if (supabase) {
    const { data: lead, error } = await supabase
      .from("ai_employee_leads")
      .select("*, ai_employees(name, business_name)")
      .eq("id", id)
      .eq("owner_id", ownerId())
      .single();

    if (error || !lead) {
      return null;
    }

    const [{ data: conversation }, { data: appointment }, { data: escalation }] = await Promise.all([
      supabase
        .from("ai_employee_conversations")
        .select("*")
        .eq("id", (lead as AiEmployeeLead).conversation_id)
        .eq("owner_id", ownerId())
        .maybeSingle(),
      supabase
        .from("ai_employee_appointments")
        .select("*")
        .eq("lead_id", id)
        .eq("owner_id", ownerId())
        .maybeSingle(),
      supabase
        .from("ai_employee_escalations")
        .select("*")
        .eq("lead_id", id)
        .eq("owner_id", ownerId())
        .maybeSingle()
    ]);

    return {
      lead: lead as AiEmployeeLead & { ai_employees?: { name?: string; business_name?: string } },
      conversation: conversation as AiEmployeeConversation | null,
      appointment: appointment as AiEmployeeAppointment | null,
      escalation: escalation as AiEmployeeEscalation | null
    };
  }

  const store = await readDevStore();
  const lead = store.leads.find((item) => item.id === id);
  if (!lead) {
    return null;
  }

  return {
    lead: {
      ...lead,
      ai_employees: {
        name: store.employees.find((employee) => employee.id === lead.ai_employee_id)?.name,
        business_name: store.employees.find((employee) => employee.id === lead.ai_employee_id)?.business_name
      }
    },
    conversation: store.conversations.find((item) => item.id === lead.conversation_id) ?? null,
    appointment: store.appointments.find((item) => item.lead_id === id) ?? null,
    escalation: store.escalations.find((item) => item.lead_id === id) ?? null
  };
}

export async function listConversations(filters: {
  employeeId?: string;
  mode?: string;
  status?: string;
} = {}) {
  noStore();
  const supabase = getSupabaseAdminClient();

  if (supabase) {
    let query = supabase
      .from("ai_employee_conversations")
      .select("*, ai_employees(name, business_name)")
      .eq("owner_id", ownerId())
      .order("created_at", { ascending: false });

    if (filters.employeeId && filters.employeeId !== "all") {
      query = query.eq("ai_employee_id", filters.employeeId);
    }
    if (filters.mode && filters.mode !== "all") {
      query = query.eq("mode", filters.mode);
    }
    if (filters.status && filters.status !== "all") {
      query = query.eq("status", filters.status);
    }

    const { data, error } = await query;
    if (error) {
      throw new Error(error.message);
    }
    return (data ?? []) as Array<AiEmployeeConversation & { ai_employees?: { name?: string; business_name?: string } }>;
  }

  const store = await readDevStore();
  return store.conversations
    .filter((item) => !filters.employeeId || filters.employeeId === "all" || item.ai_employee_id === filters.employeeId)
    .filter((item) => !filters.mode || filters.mode === "all" || item.mode === filters.mode)
    .filter((item) => !filters.status || filters.status === "all" || item.status === filters.status)
    .map((conversation) => ({
      ...conversation,
      ai_employees: {
        name: store.employees.find((employee) => employee.id === conversation.ai_employee_id)?.name,
        business_name: store.employees.find((employee) => employee.id === conversation.ai_employee_id)?.business_name
      }
    }));
}

export async function getConversationDetail(id: string) {
  noStore();
  const supabase = getSupabaseAdminClient();

  if (supabase) {
    const { data: conversation, error } = await supabase
      .from("ai_employee_conversations")
      .select("*, ai_employees(name, business_name)")
      .eq("id", id)
      .eq("owner_id", ownerId())
      .single();

    if (error || !conversation) {
      return null;
    }

    const [{ data: lead }, { data: appointment }, { data: escalation }] = await Promise.all([
      supabase
        .from("ai_employee_leads")
        .select("*")
        .eq("conversation_id", id)
        .eq("owner_id", ownerId())
        .maybeSingle(),
      supabase
        .from("ai_employee_appointments")
        .select("*")
        .eq("conversation_id", id)
        .eq("owner_id", ownerId())
        .maybeSingle(),
      supabase
        .from("ai_employee_escalations")
        .select("*")
        .eq("conversation_id", id)
        .eq("owner_id", ownerId())
        .maybeSingle()
    ]);

    return {
      conversation: conversation as AiEmployeeConversation & { ai_employees?: { name?: string; business_name?: string } },
      lead: lead as AiEmployeeLead | null,
      appointment: appointment as AiEmployeeAppointment | null,
      escalation: escalation as AiEmployeeEscalation | null
    };
  }

  const store = await readDevStore();
  const conversation = store.conversations.find((item) => item.id === id);
  if (!conversation) {
    return null;
  }

  return {
    conversation: {
      ...conversation,
      ai_employees: {
        name: store.employees.find((employee) => employee.id === conversation.ai_employee_id)?.name,
        business_name: store.employees.find((employee) => employee.id === conversation.ai_employee_id)?.business_name
      }
    },
    lead: store.leads.find((item) => item.conversation_id === id) ?? null,
    appointment: store.appointments.find((item) => item.conversation_id === id) ?? null,
    escalation: store.escalations.find((item) => item.conversation_id === id) ?? null
  };
}

export async function listAppointments(filters: {
  employeeId?: string;
  status?: string;
} = {}) {
  noStore();
  const supabase = getSupabaseAdminClient();

  if (supabase) {
    let query = supabase
      .from("ai_employee_appointments")
      .select("*, ai_employees(name, business_name), ai_employee_leads(name, phone, email)")
      .eq("owner_id", ownerId())
      .order("created_at", { ascending: false });

    if (filters.employeeId && filters.employeeId !== "all") {
      query = query.eq("ai_employee_id", filters.employeeId);
    }
    if (filters.status && filters.status !== "all") {
      query = query.eq("appointment_status", filters.status);
    }

    const { data, error } = await query;
    if (error) {
      throw new Error(error.message);
    }
    return (data ?? []) as Array<
      AiEmployeeAppointment & {
        ai_employees?: { name?: string; business_name?: string };
        ai_employee_leads?: { name?: string; phone?: string; email?: string };
      }
    >;
  }

  const store = await readDevStore();
  return store.appointments
    .filter((item) => !filters.employeeId || filters.employeeId === "all" || item.ai_employee_id === filters.employeeId)
    .filter((item) => !filters.status || filters.status === "all" || item.appointment_status === filters.status)
    .map((appointment) => ({
      ...appointment,
      ai_employees: {
        name: store.employees.find((employee) => employee.id === appointment.ai_employee_id)?.name,
        business_name: store.employees.find((employee) => employee.id === appointment.ai_employee_id)?.business_name
      },
      ai_employee_leads: store.leads.find((lead) => lead.id === appointment.lead_id)
    }));
}

export async function listEscalations(filters: {
  employeeId?: string;
  status?: string;
} = {}) {
  noStore();
  const supabase = getSupabaseAdminClient();

  if (supabase) {
    let query = supabase
      .from("ai_employee_escalations")
      .select("*, ai_employees(name, business_name), ai_employee_leads(name, phone, email)")
      .eq("owner_id", ownerId())
      .order("created_at", { ascending: false });

    if (filters.employeeId && filters.employeeId !== "all") {
      query = query.eq("ai_employee_id", filters.employeeId);
    }
    if (filters.status && filters.status !== "all") {
      query = query.eq("status", filters.status);
    }

    const { data, error } = await query;
    if (error) {
      throw new Error(error.message);
    }
    return (data ?? []) as Array<
      AiEmployeeEscalation & {
        ai_employees?: { name?: string; business_name?: string };
        ai_employee_leads?: { name?: string; phone?: string; email?: string };
      }
    >;
  }

  const store = await readDevStore();
  return store.escalations
    .filter((item) => !filters.employeeId || filters.employeeId === "all" || item.ai_employee_id === filters.employeeId)
    .filter((item) => !filters.status || filters.status === "all" || item.status === filters.status)
    .map((escalation) => ({
      ...escalation,
      ai_employees: {
        name: store.employees.find((employee) => employee.id === escalation.ai_employee_id)?.name,
        business_name: store.employees.find((employee) => employee.id === escalation.ai_employee_id)?.business_name
      },
      ai_employee_leads: store.leads.find((lead) => lead.id === escalation.lead_id)
    }));
}

const defaultSetupTasks = [
  {
    title: "Confirm package and payment",
    description: "Verify setup fee, recurring plan, and customer contact details.",
    task_status: "done",
    sort_order: 10
  },
  {
    title: "Send business intake",
    description: "Collect business services, FAQs, lead rules, calendars, escalation contacts, and brand voice.",
    task_status: "not_started",
    sort_order: 20
  },
  {
    title: "Create AI employee drafts",
    description: "Create the purchased AI employee roles and map them to the customer workspace.",
    task_status: "not_started",
    sort_order: 30
  },
  {
    title: "Map GoHighLevel resources",
    description: "Map calendars, pipeline stages, tags, fields, and safe sync settings before launch.",
    task_status: "not_started",
    sort_order: 40
  },
  {
    title: "Review and activate production",
    description: "Review customer approvals, test the AI employee behavior, and activate production-safe sync.",
    task_status: "not_started",
    sort_order: 50
  }
] satisfies Array<Pick<AiEmployeeCustomerSetupTask, "title" | "description" | "task_status" | "sort_order">>;

function normalizeRecord(value: unknown): Record<string, unknown> {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }

  return {};
}

function summarizeCustomer(
  customer: AiEmployeeCustomer,
  purchases: AiEmployeeCustomerPurchase[],
  setupTasks: AiEmployeeCustomerSetupTask[]
): AiEmployeeCustomerSummary {
  const customerPurchases = purchases.filter((purchase) => purchase.customer_id === customer.id);
  const customerSetupTasks = setupTasks.filter((task) => task.customer_id === customer.id);
  const latestPurchase = customerPurchases
    .toSorted((a, b) => b.created_at.localeCompare(a.created_at))
    .at(0);

  return {
    ...customer,
    total_purchases: customerPurchases.length,
    total_setup_tasks: customerSetupTasks.length,
    completed_setup_tasks: customerSetupTasks.filter((task) => task.task_status === "done").length,
    latest_purchase_at: latestPurchase?.purchased_at ?? latestPurchase?.created_at ?? null,
    latest_purchase_status: latestPurchase?.purchase_status ?? null
  };
}

function inferPlanFromPurchase(input: StripePurchaseEventInput) {
  const normalizedPlanId = input.planId?.trim();
  if (normalizedPlanId) {
    return {
      planId: normalizedPlanId,
      planName: input.planName ?? normalizedPlanId
    };
  }

  const byAmount: Record<number, { planId: string; planName: string }> = {
    29700: { planId: "starter", planName: "Starter AI Employee" },
    49700: { planId: "starter", planName: "Starter AI Employee" },
    99700: { planId: "growth", planName: "AI Employee Team" },
    150000: { planId: "growth", planName: "AI Employee Team" },
    199700: { planId: "scale", planName: "Automation Partner" },
    300000: { planId: "scale", planName: "Automation Partner" }
  };

  return input.amountTotal && byAmount[input.amountTotal]
    ? byAmount[input.amountTotal]
    : { planId: "manual_review", planName: input.planName ?? "Manual review" };
}

function purchaseStatusFromEvent(input: StripePurchaseEventInput) {
  if (input.eventType.includes("failed")) {
    return "failed" as const;
  }
  if (input.eventType.includes("deleted") || input.eventType.includes("canceled")) {
    return "canceled" as const;
  }
  if (input.paymentStatus === "paid" || input.eventType.includes("succeeded") || input.eventType.includes("completed")) {
    return "paid" as const;
  }

  return "requires_review" as const;
}

async function ensureCustomerSetupTasks(customerId: string) {
  const supabase = getSupabaseAdminClient();

  if (supabase) {
    const { count, error: countError } = await supabase
      .from("ai_employee_customer_setup_tasks")
      .select("id", { count: "exact", head: true })
      .eq("customer_id", customerId)
      .eq("owner_id", ownerId());

    if (countError) {
      throw new Error(countError.message);
    }

    if (!count) {
      const { error } = await supabase.from("ai_employee_customer_setup_tasks").insert(
        defaultSetupTasks.map((task) => ({
          ...task,
          owner_id: ownerId(),
          customer_id: customerId
        }))
      );

      if (error) {
        throw new Error(error.message);
      }
    }

    return;
  }

  const store = await readDevStore();
  if (store.customerSetupTasks.some((task) => task.customer_id === customerId)) {
    return;
  }

  store.customerSetupTasks.push(
    ...defaultSetupTasks.map((task) => ({
      id: randomUUID(),
      owner_id: ownerId(),
      customer_id: customerId,
      title: task.title,
      description: task.description,
      task_status: task.task_status,
      sort_order: task.sort_order,
      due_at: null,
      completed_at: task.task_status === "done" ? now() : null,
      created_at: now(),
      updated_at: now()
    }))
  );
  await writeDevStore(store);
}

export async function listCustomers(): Promise<AiEmployeeCustomerSummary[]> {
  noStore();
  const supabase = getSupabaseAdminClient();

  if (supabase) {
    const [
      { data: customers, error: customersError },
      { data: purchases, error: purchasesError },
      { data: setupTasks, error: tasksError }
    ] = await Promise.all([
      supabase
        .from("ai_employee_customers")
        .select("*")
        .eq("owner_id", ownerId())
        .order("created_at", { ascending: false }),
      supabase
        .from("ai_employee_customer_purchases")
        .select("*")
        .eq("owner_id", ownerId())
        .order("created_at", { ascending: false }),
      supabase
        .from("ai_employee_customer_setup_tasks")
        .select("*")
        .eq("owner_id", ownerId())
    ]);

    const error = customersError ?? purchasesError ?? tasksError;
    if (error) {
      throw new Error(error.message);
    }

    return ((customers ?? []) as AiEmployeeCustomer[]).map((customer) =>
      summarizeCustomer(
        customer,
        (purchases ?? []) as AiEmployeeCustomerPurchase[],
        (setupTasks ?? []) as AiEmployeeCustomerSetupTask[]
      )
    );
  }

  const store = await readDevStore();
  return store.customers.map((customer) =>
    summarizeCustomer(customer, store.customerPurchases, store.customerSetupTasks)
  );
}

export async function getCustomerDetail(id: string): Promise<AiEmployeeCustomerDetail | null> {
  noStore();
  const supabase = getSupabaseAdminClient();

  if (supabase) {
    const { data: customer, error } = await supabase
      .from("ai_employee_customers")
      .select("*")
      .eq("id", id)
      .eq("owner_id", ownerId())
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }
    if (!customer) {
      return null;
    }

    const [
      { data: purchases, error: purchasesError },
      { data: setupTasks, error: tasksError },
      { data: intake, error: intakeError },
      { data: stripeEvents, error: stripeEventsError }
    ] = await Promise.all([
      supabase
        .from("ai_employee_customer_purchases")
        .select("*")
        .eq("customer_id", id)
        .eq("owner_id", ownerId())
        .order("created_at", { ascending: false }),
      supabase
        .from("ai_employee_customer_setup_tasks")
        .select("*")
        .eq("customer_id", id)
        .eq("owner_id", ownerId())
        .order("sort_order", { ascending: true }),
      supabase
        .from("ai_employee_customer_intakes")
        .select("*")
        .eq("customer_id", id)
        .eq("owner_id", ownerId())
        .maybeSingle(),
      supabase
        .from("ai_employee_stripe_events")
        .select("*")
        .eq("customer_id", id)
        .eq("owner_id", ownerId())
        .order("received_at", { ascending: false })
    ]);

    const relatedError = purchasesError ?? tasksError ?? intakeError ?? stripeEventsError;
    if (relatedError) {
      throw new Error(relatedError.message);
    }

    const typedPurchases = (purchases ?? []) as AiEmployeeCustomerPurchase[];
    const typedSetupTasks = (setupTasks ?? []) as AiEmployeeCustomerSetupTask[];

    return {
      customer: summarizeCustomer(customer as AiEmployeeCustomer, typedPurchases, typedSetupTasks),
      purchases: typedPurchases,
      setupTasks: typedSetupTasks,
      intake: intake ? intake as AiEmployeeCustomerIntake : null,
      stripeEvents: (stripeEvents ?? []) as AiEmployeeStripeEvent[]
    };
  }

  const store = await readDevStore();
  const customer = store.customers.find((item) => item.id === id);
  if (!customer) {
    return null;
  }

  const purchases = store.customerPurchases.filter((purchase) => purchase.customer_id === id);
  const setupTasks = store.customerSetupTasks
    .filter((task) => task.customer_id === id)
    .toSorted((a, b) => a.sort_order - b.sort_order);

  return {
    customer: summarizeCustomer(customer, purchases, setupTasks),
    purchases,
    setupTasks,
    intake: store.customerIntakes.find((intake) => intake.customer_id === id) ?? null,
    stripeEvents: store.stripeEvents.filter((event) => event.customer_id === id)
  };
}

export async function getCustomerPortalDetail(portalToken: string): Promise<AiEmployeeCustomerDetail | null> {
  noStore();
  const supabase = getSupabaseAdminClient();

  if (supabase) {
    const { data: customer, error } = await supabase
      .from("ai_employee_customers")
      .select("*")
      .eq("portal_token", portalToken)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }
    if (!customer) {
      return null;
    }

    return getCustomerDetail((customer as AiEmployeeCustomer).id);
  }

  const store = await readDevStore();
  const customer = store.customers.find((item) => item.portal_token === portalToken);
  return customer ? getCustomerDetail(customer.id) : null;
}

export async function updateCustomerSetupTaskStatus(
  taskId: string,
  taskStatus: AiEmployeeCustomerSetupTaskStatus
) {
  const supabase = getSupabaseAdminClient();
  const completedAt = taskStatus === "done" ? now() : null;

  if (supabase) {
    const { error } = await supabase
      .from("ai_employee_customer_setup_tasks")
      .update({
        task_status: taskStatus,
        completed_at: completedAt
      })
      .eq("id", taskId)
      .eq("owner_id", ownerId());

    if (error) {
      throw new Error(error.message);
    }

    return;
  }

  const store = await readDevStore();
  const task = store.customerSetupTasks.find((item) => item.id === taskId && item.owner_id === ownerId());
  if (task) {
    task.task_status = taskStatus;
    task.completed_at = completedAt;
    task.updated_at = now();
    await writeDevStore(store);
  }
}

export async function updateCustomerStatus(input: {
  customerId: string;
  lifecycleStatus?: AiEmployeeCustomer["lifecycle_status"];
  onboardingStatus?: AiEmployeeCustomerOnboardingStatus;
}) {
  const update = {
    ...(input.lifecycleStatus ? { lifecycle_status: input.lifecycleStatus } : {}),
    ...(input.onboardingStatus ? { onboarding_status: input.onboardingStatus } : {})
  };

  if (!Object.keys(update).length) {
    return;
  }

  const supabase = getSupabaseAdminClient();

  if (supabase) {
    const { error } = await supabase
      .from("ai_employee_customers")
      .update(update)
      .eq("id", input.customerId)
      .eq("owner_id", ownerId());

    if (error) {
      throw new Error(error.message);
    }

    return;
  }

  const store = await readDevStore();
  const customer = store.customers.find((item) => item.id === input.customerId && item.owner_id === ownerId());
  if (customer) {
    if (input.lifecycleStatus) {
      customer.lifecycle_status = input.lifecycleStatus;
    }
    if (input.onboardingStatus) {
      customer.onboarding_status = input.onboardingStatus;
    }
    customer.updated_at = now();
    await writeDevStore(store);
  }
}

export async function createManualCustomer(input: ManualCustomerInput) {
  const supabase = getSupabaseAdminClient();
  const timestamp = now();
  const email = input.email.trim().toLowerCase();

  if (supabase) {
    const { data, error } = await supabase
      .from("ai_employee_customers")
      .insert({
        owner_id: ownerId(),
        business_name: input.businessName?.trim() || null,
        contact_name: input.contactName?.trim() || null,
        email,
        phone: input.phone?.trim() || null,
        website: input.website?.trim() || null,
        plan_id: input.planId,
        plan_name: input.planName?.trim() || null,
        lifecycle_status: "intake_needed",
        onboarding_status: "intake_sent",
        notes: input.notes?.trim() || null
      })
      .select("*")
      .single();

    if (error) {
      throw new Error(error.message);
    }

    const customer = data as AiEmployeeCustomer;
    await ensureCustomerSetupTasks(customer.id);
    return customer;
  }

  const store = await readDevStore();
  const customer: AiEmployeeCustomer = {
    id: randomUUID(),
    owner_id: ownerId(),
    business_name: input.businessName?.trim() || null,
    contact_name: input.contactName?.trim() || null,
    email,
    phone: input.phone?.trim() || null,
    website: input.website?.trim() || null,
    plan_id: input.planId,
    plan_name: input.planName?.trim() || null,
    lifecycle_status: "intake_needed",
    onboarding_status: "intake_sent",
    portal_token: randomUUID(),
    stripe_customer_id: null,
    stripe_subscription_id: null,
    stripe_latest_checkout_session_id: null,
    ghl_contact_id: null,
    ghl_opportunity_id: null,
    notes: input.notes?.trim() || null,
    created_at: timestamp,
    updated_at: timestamp
  };

  store.customers.push(customer);
  await writeDevStore(store);
  await ensureCustomerSetupTasks(customer.id);
  return customer;
}

export async function saveCustomerIntakeByPortalToken(
  portalToken: string,
  input: AiEmployeeCustomerIntakeInput
) {
  const supabase = getSupabaseAdminClient();
  const timestamp = now();

  if (supabase) {
    const { data: customer, error: customerError } = await supabase
      .from("ai_employee_customers")
      .select("*")
      .eq("portal_token", portalToken)
      .maybeSingle();

    if (customerError) {
      throw new Error(customerError.message);
    }
    if (!customer) {
      throw new Error("Customer portal not found.");
    }

    const typedCustomer = customer as AiEmployeeCustomer;
    const intake = {
      ...input,
      owner_id: typedCustomer.owner_id,
      customer_id: typedCustomer.id,
      submission_status: "submitted",
      submitted_at: timestamp
    };

    const { data, error } = await supabase
      .from("ai_employee_customer_intakes")
      .upsert(intake, { onConflict: "customer_id" })
      .select("*")
      .single();

    if (error) {
      throw new Error(error.message);
    }

    const { error: customerUpdateError } = await supabase
      .from("ai_employee_customers")
      .update({
        business_name: input.business_name,
        contact_name: input.contact_name,
        email: input.email.toLowerCase(),
        phone: input.phone,
        website: input.website,
        lifecycle_status: "in_setup",
        onboarding_status: "intake_received"
      })
      .eq("id", typedCustomer.id)
      .eq("owner_id", typedCustomer.owner_id);

    if (customerUpdateError) {
      throw new Error(customerUpdateError.message);
    }

    await markBusinessIntakeTaskDone(typedCustomer.id, typedCustomer.owner_id);
    return data as AiEmployeeCustomerIntake;
  }

  const store = await readDevStore();
  const customer = store.customers.find((item) => item.portal_token === portalToken);

  if (!customer) {
    throw new Error("Customer portal not found.");
  }

  const existing = store.customerIntakes.find((item) => item.customer_id === customer.id);
  const intake: AiEmployeeCustomerIntake = {
    id: existing?.id ?? randomUUID(),
    owner_id: customer.owner_id,
    customer_id: customer.id,
    ...input,
    submission_status: "submitted",
    submitted_at: timestamp,
    reviewed_at: existing?.reviewed_at ?? null,
    created_at: existing?.created_at ?? timestamp,
    updated_at: timestamp
  };

  if (existing) {
    Object.assign(existing, intake);
  } else {
    store.customerIntakes.push(intake);
  }

  customer.business_name = input.business_name;
  customer.contact_name = input.contact_name;
  customer.email = input.email.toLowerCase();
  customer.phone = input.phone;
  customer.website = input.website;
  customer.lifecycle_status = "in_setup";
  customer.onboarding_status = "intake_received";
  customer.updated_at = timestamp;

  const task = store.customerSetupTasks.find((item) =>
    item.customer_id === customer.id && item.title === "Send business intake"
  );
  if (task) {
    task.task_status = "done";
    task.completed_at = timestamp;
    task.updated_at = timestamp;
  }

  await writeDevStore(store);
  return intake;
}

async function markBusinessIntakeTaskDone(customerId: string, customerOwnerId: string) {
  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    return;
  }

  const { error } = await supabase
    .from("ai_employee_customer_setup_tasks")
    .update({
      task_status: "done",
      completed_at: now()
    })
    .eq("customer_id", customerId)
    .eq("owner_id", customerOwnerId)
    .eq("title", "Send business intake");

  if (error) {
    throw new Error(error.message);
  }
}

export async function recordStripePurchaseEvent(input: StripePurchaseEventInput) {
  const plan = inferPlanFromPurchase(input);
  const purchaseStatus = purchaseStatusFromEvent(input);
  const customerEmail = input.customerEmail?.trim().toLowerCase() || null;
  const customerName = input.customerName?.trim() || null;
  const businessName = input.businessName?.trim() || customerName;
  const supabase = getSupabaseAdminClient();

  if (supabase) {
    const { data: existingEvent, error: existingEventError } = await supabase
      .from("ai_employee_stripe_events")
      .select("id, customer_id, purchase_id")
      .eq("stripe_event_id", input.eventId)
      .maybeSingle();

    if (existingEventError) {
      throw new Error(existingEventError.message);
    }

    if (existingEvent) {
      return { skipped: true, reason: "Stripe event already processed." };
    }

    let customer: AiEmployeeCustomer | null = null;

    if (input.stripeCustomerId) {
      const { data, error } = await supabase
        .from("ai_employee_customers")
        .select("*")
        .eq("owner_id", ownerId())
        .eq("stripe_customer_id", input.stripeCustomerId)
        .maybeSingle();

      if (error) {
        throw new Error(error.message);
      }
      customer = data as AiEmployeeCustomer | null;
    }

    if (!customer && customerEmail) {
      const { data, error } = await supabase
        .from("ai_employee_customers")
        .select("*")
        .eq("owner_id", ownerId())
        .eq("email", customerEmail)
        .maybeSingle();

      if (error) {
        throw new Error(error.message);
      }
      customer = data as AiEmployeeCustomer | null;
    }

    const customerUpdate = {
      business_name: businessName,
      contact_name: customerName,
      email: customerEmail,
      plan_id: plan.planId,
      plan_name: plan.planName,
      lifecycle_status: purchaseStatus === "paid" ? "paid_setup" : "new",
      onboarding_status: purchaseStatus === "paid" ? "intake_sent" : "not_started",
      stripe_customer_id: input.stripeCustomerId ?? customer?.stripe_customer_id ?? null,
      stripe_subscription_id: input.stripeSubscriptionId ?? customer?.stripe_subscription_id ?? null,
      stripe_latest_checkout_session_id:
        input.stripeCheckoutSessionId ?? customer?.stripe_latest_checkout_session_id ?? null
    };

    if (customer) {
      const { data, error } = await supabase
        .from("ai_employee_customers")
        .update(customerUpdate)
        .eq("id", customer.id)
        .eq("owner_id", ownerId())
        .select("*")
        .single();

      if (error) {
        throw new Error(error.message);
      }
      customer = data as AiEmployeeCustomer;
    } else {
      const { data, error } = await supabase
        .from("ai_employee_customers")
        .insert({
          owner_id: ownerId(),
          ...customerUpdate
        })
        .select("*")
        .single();

      if (error) {
        throw new Error(error.message);
      }
      customer = data as AiEmployeeCustomer;
    }

    await ensureCustomerSetupTasks(customer.id);

    const { data: purchase, error: purchaseError } = await supabase
      .from("ai_employee_customer_purchases")
      .insert({
        owner_id: ownerId(),
        customer_id: customer.id,
        plan_id: plan.planId,
        plan_name: plan.planName,
        purchase_status: purchaseStatus,
        payment_source: "stripe",
        stripe_event_id: input.eventId,
        stripe_checkout_session_id: input.stripeCheckoutSessionId ?? null,
        stripe_payment_intent_id: input.stripePaymentIntentId ?? null,
        stripe_invoice_id: input.stripeInvoiceId ?? null,
        stripe_subscription_id: input.stripeSubscriptionId ?? null,
        stripe_customer_id: input.stripeCustomerId ?? null,
        customer_email: customerEmail,
        customer_name: customerName,
        amount_total: input.amountTotal ?? null,
        currency: input.currency ?? null,
        payment_status: input.paymentStatus ?? null,
        metadata: input.metadata ?? {},
        raw_summary: input.rawSummary ?? {},
        purchased_at: input.purchasedAt ?? now()
      })
      .select("*")
      .single();

    if (purchaseError) {
      throw new Error(purchaseError.message);
    }

    const { error: eventError } = await supabase.from("ai_employee_stripe_events").insert({
      owner_id: ownerId(),
      stripe_event_id: input.eventId,
      event_type: input.eventType,
      livemode: input.livemode,
      processed_status: "processed",
      customer_id: customer.id,
      purchase_id: (purchase as AiEmployeeCustomerPurchase).id
    });

    if (eventError) {
      throw new Error(eventError.message);
    }

    return { skipped: false, customerId: customer.id, purchaseId: (purchase as AiEmployeeCustomerPurchase).id };
  }

  const store = await readDevStore();
  if (store.stripeEvents.some((event) => event.stripe_event_id === input.eventId)) {
    return { skipped: true, reason: "Stripe event already processed." };
  }

  let customer = store.customers.find((item) =>
    input.stripeCustomerId
      ? item.stripe_customer_id === input.stripeCustomerId
      : customerEmail
        ? item.email === customerEmail
        : false
  );

  if (!customer) {
    customer = {
      id: randomUUID(),
      owner_id: ownerId(),
      business_name: businessName ?? null,
      contact_name: customerName,
      email: customerEmail,
      phone: null,
      website: null,
      plan_id: plan.planId,
      plan_name: plan.planName,
      lifecycle_status: purchaseStatus === "paid" ? "paid_setup" : "new",
      onboarding_status: purchaseStatus === "paid" ? "intake_sent" : "not_started",
      portal_token: randomUUID(),
      stripe_customer_id: input.stripeCustomerId ?? null,
      stripe_subscription_id: input.stripeSubscriptionId ?? null,
      stripe_latest_checkout_session_id: input.stripeCheckoutSessionId ?? null,
      ghl_contact_id: null,
      ghl_opportunity_id: null,
      notes: null,
      created_at: now(),
      updated_at: now()
    };
    store.customers.push(customer);
  } else {
    customer.business_name = businessName ?? customer.business_name;
    customer.contact_name = customerName ?? customer.contact_name;
    customer.email = customerEmail ?? customer.email;
    customer.plan_id = plan.planId;
    customer.plan_name = plan.planName;
    customer.lifecycle_status = purchaseStatus === "paid" ? "paid_setup" : customer.lifecycle_status;
    customer.onboarding_status = purchaseStatus === "paid" ? "intake_sent" : customer.onboarding_status;
    customer.stripe_customer_id = input.stripeCustomerId ?? customer.stripe_customer_id;
    customer.stripe_subscription_id = input.stripeSubscriptionId ?? customer.stripe_subscription_id;
    customer.stripe_latest_checkout_session_id =
      input.stripeCheckoutSessionId ?? customer.stripe_latest_checkout_session_id;
    customer.updated_at = now();
  }

  if (!customer) {
    throw new Error("Customer could not be created for purchase event.");
  }

  const purchase: AiEmployeeCustomerPurchase = {
    id: randomUUID(),
    owner_id: ownerId(),
    customer_id: customer.id,
    plan_id: plan.planId,
    plan_name: plan.planName,
    purchase_status: purchaseStatus,
    payment_source: "stripe",
    stripe_event_id: input.eventId,
    stripe_checkout_session_id: input.stripeCheckoutSessionId ?? null,
    stripe_payment_intent_id: input.stripePaymentIntentId ?? null,
    stripe_invoice_id: input.stripeInvoiceId ?? null,
    stripe_subscription_id: input.stripeSubscriptionId ?? null,
    stripe_customer_id: input.stripeCustomerId ?? null,
    customer_email: customerEmail,
    customer_name: customerName,
    amount_total: input.amountTotal ?? null,
    currency: input.currency ?? null,
    payment_status: input.paymentStatus ?? null,
    metadata: input.metadata ?? {},
    raw_summary: input.rawSummary ?? {},
    purchased_at: input.purchasedAt ?? now(),
    created_at: now(),
    updated_at: now()
  };
  store.customerPurchases.push(purchase);
  store.stripeEvents.push({
    id: randomUUID(),
    owner_id: ownerId(),
    stripe_event_id: input.eventId,
    event_type: input.eventType,
    livemode: input.livemode,
    processed_status: "processed",
    error_message: null,
    customer_id: customer.id,
    purchase_id: purchase.id,
    received_at: now(),
    created_at: now()
  });
  await writeDevStore(store);
  await ensureCustomerSetupTasks(customer.id);

  return { skipped: false, customerId: customer.id, purchaseId: purchase.id };
}
