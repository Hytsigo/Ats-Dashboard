"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

const DemoCandidatesOnboardingDialog = dynamic(
  () =>
    import("@/features/candidates/components/demo-candidates-onboarding-dialog").then(
      (module) => module.DemoCandidatesOnboardingDialog,
    ),
  { ssr: false },
);

type PrivateShellProps = {
  children: React.ReactNode;
};

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/candidates", label: "Candidates" },
];

export function PrivateShell({ children }: PrivateShellProps) {
  const pathname = usePathname();
  const router = useRouter();

  const onSignOut = async () => {
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      toast.error("Could not sign out");
      return;
    }

    toast.success("Signed out");
    router.push("/auth");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border/80 bg-card/80 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-3 px-4 py-4 sm:px-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center justify-between gap-4 md:justify-start md:gap-6">
            <Link href="/dashboard" className="flex items-center gap-2 text-sm font-semibold tracking-wide">
              <span className="inline-block size-2 rounded-full bg-primary" />
              Mini-ATS
            </Link>
            <nav className="flex items-center gap-2 overflow-x-auto">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-lg px-3 py-1.5 text-sm text-muted-foreground transition-all hover:bg-muted/60 hover:text-foreground",
                    pathname.startsWith(item.href) &&
                      "bg-primary/15 text-primary ring-1 ring-primary/30",
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          <Button
            variant="outline"
            size="sm"
            className="w-full border-border/80 sm:w-auto"
            onClick={onSignOut}
          >
            Sign out
          </Button>
        </div>
        <div className="h-px w-full bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      </header>

      <DemoCandidatesOnboardingDialog />
      {children}
    </div>
  );
}
