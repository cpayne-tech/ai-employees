"use server";

import { redirect } from "next/navigation";
import {
  aiEmployeesAuthIsMisconfigured,
  clearAiEmployeesSession,
  createAiEmployeesSession,
  validAdminPassword
} from "@/ai-employees/auth";

export async function loginAiEmployeesAction(formData: FormData) {
  const password = String(formData.get("password") ?? "");

  if (aiEmployeesAuthIsMisconfigured()) {
    redirect("/ai-employees/login?setup=1");
  }

  if (!validAdminPassword(password) || !(await createAiEmployeesSession())) {
    redirect("/ai-employees/login?error=1");
  }

  redirect("/ai-employees");
}

export async function logoutAiEmployeesAction() {
  await clearAiEmployeesSession();
  redirect("/ai-employees/login");
}
