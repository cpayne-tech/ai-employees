import { z } from "zod";

export const extractedLeadSchema = z.object({
  name: z.string().optional().default(""),
  email: z.string().optional().default(""),
  phone: z.string().optional().default(""),
  service_needed: z.string().optional().default(""),
  preferred_time: z.string().optional().default(""),
  urgency: z.string().optional().default(""),
  intent: z.string().optional().default(""),
  notes: z.string().optional().default(""),
  qualified: z.boolean().optional().default(false),
  qualification_status: z.string().optional().default("in_progress"),
  missing_fields: z.array(z.string()).optional().default([]),
  lead_score: z.number().min(0).max(100).optional().default(0),
  escalation_needed: z.boolean().optional().default(false),
  escalation_reason: z.string().optional().default(""),
  appointment_requested: z.boolean().optional().default(false),
  follow_up_needed: z.boolean().optional().default(false),
  follow_up_status: z.string().optional().default("")
});

export const aiEmployeeTurnSchema = z.object({
  assistant_message: z.string().min(1),
  conversation_status: z.enum([
    "in_progress",
    "qualified",
    "appointment_requested",
    "escalated"
  ]),
  extracted_lead: extractedLeadSchema
});

export type AiEmployeeTurnPayload = z.infer<typeof aiEmployeeTurnSchema>;
