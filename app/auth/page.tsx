import { redirect } from "next/navigation";

import { AuthForm } from "@/features/auth/components/auth-form";
import { createClient } from "@/lib/supabase/server";

export default async function AuthPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-6 sm:px-6 sm:py-10">
      <div className="surface-panel w-full max-w-5xl rounded-3xl p-3 md:grid md:grid-cols-[1.2fr_1fr] md:gap-3">
        <section className="hidden rounded-2xl bg-gradient-to-br from-primary/20 via-accent/45 to-background p-8 md:block">
          <p className="font-mono text-xs uppercase tracking-[0.24em] text-primary">Mini-ATS</p>
          <h1 className="mt-3 text-4xl font-semibold leading-tight text-foreground">
            Hire with clarity, not spreadsheets.
          </h1>
          <p className="mt-4 max-w-md text-sm text-muted-foreground">
            Manage your candidates from applied to hired, keep every interaction logged,
            and make hiring decisions with live pipeline metrics.
          </p>
        </section>

        <section className="surface-soft p-2">
          <AuthForm />
        </section>
      </div>
    </main>
  );
}
