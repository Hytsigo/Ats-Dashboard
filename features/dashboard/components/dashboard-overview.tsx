"use client";

import { endOfWeek, isWithinInterval, startOfWeek } from "date-fns";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { STAGE_LABELS, CANDIDATE_STAGES } from "@/features/candidates/domain/candidate.constants";
import { useCandidatesQuery } from "@/features/candidates/hooks/use-candidates-query";
import { useBootstrapOrganizationMutation } from "@/features/organizations/hooks/use-bootstrap-organization-mutation";
import { useCurrentOrganizationQuery } from "@/features/organizations/hooks/use-current-organization-query";
import { getErrorMessage } from "@/lib/errors";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

const STAGE_COLORS = ["#0f766e", "#0d9488", "#14b8a6", "#0891b2", "#334155", "#475569"];

export function DashboardOverview() {
  const organizationQuery = useCurrentOrganizationQuery();
  const bootstrapOrganization = useBootstrapOrganizationMutation();
  const organizationId = organizationQuery.data?.id ?? "";
  const candidatesQuery = useCandidatesQuery(organizationId);

  if (organizationQuery.isLoading || candidatesQuery.isLoading) {
    return <Skeleton className="h-[560px] w-full" />;
  }

  if (!organizationQuery.data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No organization found</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>Create your first organization to unlock dashboard metrics.</p>
          <Button
            onClick={async () => {
              try {
                await bootstrapOrganization.mutateAsync("My Company");
                toast.success("Organization created");
              } catch (error) {
                toast.error(getErrorMessage(error, "Could not create organization"));
              }
            }}
            disabled={bootstrapOrganization.isPending}
          >
            Create My Organization
          </Button>
        </CardContent>
      </Card>
    );
  }

  const candidates = candidatesQuery.data?.items ?? [];
  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

  const stageData = CANDIDATE_STAGES.map((stage) => {
    const total = candidates.filter((candidate) => candidate.stage === stage).length;

    return {
      stage,
      label: STAGE_LABELS[stage],
      total,
    };
  });

  const newThisWeek = candidates.filter((candidate) =>
    isWithinInterval(new Date(candidate.created_at), { start: weekStart, end: weekEnd }),
  ).length;

  const hiredTotal = stageData.find((item) => item.stage === "hired")?.total ?? 0;
  const conversionRate = candidates.length > 0 ? Math.round((hiredTotal / candidates.length) * 100) : 0;

  return (
    <section className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total Candidates</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold text-primary">{candidates.length}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>New This Week</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold text-primary">{newThisWeek}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Conversion Rate</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold text-primary">{conversionRate}%</CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card className="surface-soft">
          <CardHeader>
            <CardTitle>Candidates by Stage</CardTitle>
          </CardHeader>
          <CardContent className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stageData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="label" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="total" radius={[8, 8, 0, 0]}>
                  {stageData.map((entry, index) => (
                    <Cell key={entry.stage} fill={STAGE_COLORS[index % STAGE_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="surface-soft">
          <CardHeader>
            <CardTitle>Pipeline Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={stageData} dataKey="total" nameKey="label" outerRadius={110} label>
                  {stageData.map((entry, index) => (
                    <Cell key={entry.stage} fill={STAGE_COLORS[index % STAGE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
