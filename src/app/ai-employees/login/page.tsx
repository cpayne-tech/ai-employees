import { redirect } from "next/navigation";
import { loginAiEmployeesAction } from "@/ai-employees/auth-actions";
import {
  aiEmployeesAuthIsMisconfigured,
  hasAiEmployeesAccess
} from "@/ai-employees/auth";

export default async function AiEmployeesLoginPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string; setup?: string }>;
}) {
  if (await hasAiEmployeesAccess()) {
    redirect("/ai-employees");
  }

  const params = await searchParams;
  const setupRequired = params.setup === "1" || aiEmployeesAuthIsMisconfigured();
  const invalidPassword = params.error === "1";

  return (
    <main className="login-shell">
      <section className="login-card">
        <div>
          <div className="eyebrow">AI Employees</div>
          <h1>Sign in</h1>
          <p className="muted">
            Enter the admin password to manage One Big Media Company AI employees.
          </p>
        </div>

        {setupRequired ? (
          <div className="error-box">
            Set AI_EMPLOYEES_ADMIN_PASSWORD and AI_EMPLOYEES_SESSION_SECRET before
            deploying this dashboard.
          </div>
        ) : null}

        {invalidPassword ? (
          <div className="error-box">The password did not match.</div>
        ) : null}

        <form action={loginAiEmployeesAction} className="grid">
          <label className="field">
            <span>Admin password</span>
            <input
              autoComplete="current-password"
              name="password"
              required
              type="password"
            />
          </label>
          <button className="button" disabled={setupRequired} type="submit">
            Sign in
          </button>
        </form>
      </section>
    </main>
  );
}
