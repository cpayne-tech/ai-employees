import "server-only";

import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const cookieName = "obmc_ai_employees_session";
const sessionMaxAgeSeconds = 60 * 60 * 12;

function adminPassword() {
  return process.env.AI_EMPLOYEES_ADMIN_PASSWORD;
}

function sessionSecret() {
  return process.env.AI_EMPLOYEES_SESSION_SECRET;
}

function authConfigured() {
  return Boolean(adminPassword() && sessionSecret());
}

function authRequired() {
  return process.env.NODE_ENV === "production" || authConfigured();
}

function sign(value: string) {
  const secret = sessionSecret();

  if (!secret) {
    return null;
  }

  return createHmac("sha256", secret).update(value).digest("hex");
}

function safeEqual(a: string, b: string) {
  const aBuffer = Buffer.from(a);
  const bBuffer = Buffer.from(b);

  return aBuffer.length === bBuffer.length && timingSafeEqual(aBuffer, bBuffer);
}

function createSessionToken() {
  const issuedAt = Date.now().toString();
  const signature = sign(issuedAt);

  if (!signature) {
    return null;
  }

  return `${issuedAt}.${signature}`;
}

function validSessionToken(token?: string) {
  if (!token) {
    return false;
  }

  const [issuedAt, signature] = token.split(".");
  const expectedSignature = issuedAt ? sign(issuedAt) : null;

  if (!issuedAt || !signature || !expectedSignature) {
    return false;
  }

  const ageMs = Date.now() - Number(issuedAt);
  const maxAgeMs = sessionMaxAgeSeconds * 1000;

  return (
    Number.isFinite(ageMs) &&
    ageMs >= 0 &&
    ageMs <= maxAgeMs &&
    safeEqual(signature, expectedSignature)
  );
}

export function aiEmployeesAuthIsMisconfigured() {
  return authRequired() && !authConfigured();
}

export function validAdminPassword(input: string) {
  const expected = adminPassword();

  return expected ? safeEqual(input, expected) : false;
}

export async function hasAiEmployeesAccess() {
  if (!authRequired()) {
    return true;
  }

  if (!authConfigured()) {
    return false;
  }

  const token = (await cookies()).get(cookieName)?.value;
  return validSessionToken(token);
}

export async function requireAiEmployeesAccess() {
  if (!(await hasAiEmployeesAccess())) {
    redirect("/ai-employees/login");
  }
}

export async function assertAiEmployeesAccess() {
  if (!(await hasAiEmployeesAccess())) {
    throw new Error("Unauthorized.");
  }
}

export async function createAiEmployeesSession() {
  const token = createSessionToken();

  if (!token) {
    return false;
  }

  (await cookies()).set(cookieName, token, {
    httpOnly: true,
    maxAge: sessionMaxAgeSeconds,
    path: "/ai-employees",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production"
  });

  return true;
}

export async function clearAiEmployeesSession() {
  (await cookies()).delete(cookieName);
}
