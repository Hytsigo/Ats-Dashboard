import Link from "next/link";

import { DashboardOverview } from "@/features/dashboard/components/dashboard-overview";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  return (
    <main className="px-4 py-6 sm:px-6 sm:py-8">
      <div className="mx-auto w-full max-w-[1500px] space-y-6">
        <div className="surface-panel px-5 py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.24em] text-primary">Operations</p>
            <h1 className="text-3xl font-semibold tracking-tight">Recruitment Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Live metrics from your current organization pipeline.
            </p>
          </div>
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link href="/candidates">Open Pipeline</Link>
          </Button>
          </div>
        </div>
        <DashboardOverview />
      </div>
    </main>
  );
}
