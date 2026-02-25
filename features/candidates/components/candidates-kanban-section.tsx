"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";

import { CandidateKanbanBoard } from "@/features/candidates/components/candidate-kanban-board";
import { CreateCandidateDialog } from "@/features/candidates/components/create-candidate-dialog";
import { CANDIDATE_STAGES, STAGE_LABELS } from "@/features/candidates/domain/candidate.constants";
import type { CandidateFiltersInput } from "@/features/candidates/domain/candidate.schemas";
import { useCandidatesQuery } from "@/features/candidates/hooks/use-candidates-query";
import { useMoveCandidateStageMutation } from "@/features/candidates/hooks/use-move-candidate-stage-mutation";
import { useBootstrapOrganizationMutation } from "@/features/organizations/hooks/use-bootstrap-organization-mutation";
import { useCurrentOrganizationQuery } from "@/features/organizations/hooks/use-current-organization-query";
import { getErrorMessage } from "@/lib/errors";
import type { CandidateStage } from "@/lib/supabase/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

export function CandidatesKanbanSection() {
  const [search, setSearch] = useState("");
  const [stage, setStage] = useState<string>("all");
  const [salaryMin, setSalaryMin] = useState("");
  const [salaryMax, setSalaryMax] = useState("");
  const [createdFrom, setCreatedFrom] = useState("");
  const [createdTo, setCreatedTo] = useState("");

  const { data: organization, isLoading: isOrganizationLoading } = useCurrentOrganizationQuery();

  const filters = useMemo<CandidateFiltersInput>(() => {
    return {
      ...(search ? { search } : {}),
      ...(stage !== "all" ? { stage: stage as CandidateFiltersInput["stage"] } : {}),
      ...(salaryMin ? { salaryMin: Number(salaryMin) } : {}),
      ...(salaryMax ? { salaryMax: Number(salaryMax) } : {}),
      ...(createdFrom ? { createdFrom: new Date(`${createdFrom}T00:00:00.000Z`).toISOString() } : {}),
      ...(createdTo ? { createdTo: new Date(`${createdTo}T23:59:59.999Z`).toISOString() } : {}),
    };
  }, [createdFrom, createdTo, salaryMax, salaryMin, search, stage]);

  const organizationId = organization?.id ?? "";
  const candidatesQuery = useCandidatesQuery(organizationId, filters);
  const moveStageMutation = useMoveCandidateStageMutation({ organizationId });
  const bootstrapOrganization = useBootstrapOrganizationMutation();

  const handleMoveCandidate = async (candidateId: string, nextStage: CandidateStage) => {
    try {
      await moveStageMutation.mutateAsync({
        candidateId,
        stage: nextStage,
      });

      toast.success("Candidate moved", {
        description: `Moved to ${STAGE_LABELS[nextStage]}.`,
      });
    } catch {
      toast.error("Could not update candidate stage");
    }
  };

  if (isOrganizationLoading) {
    return <Skeleton className="h-[520px] w-full" />;
  }

  if (!organization) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No organization found</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>Join or create an organization to start using the recruitment pipeline.</p>
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

  return (
    <section className="space-y-6">
      <div className="flex justify-end">
        <CreateCandidateDialog organizationId={organizationId} />
      </div>

      <div className="surface-panel grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-6">
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search candidates by name"
          className="lg:col-span-2"
        />

        <Select value={stage} onValueChange={setStage}>
          <SelectTrigger>
            <SelectValue placeholder="Stage" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All stages</SelectItem>
            {CANDIDATE_STAGES.map((candidateStage) => (
              <SelectItem key={candidateStage} value={candidateStage}>
                {STAGE_LABELS[candidateStage]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          type="number"
          min="0"
          value={salaryMin}
          onChange={(event) => setSalaryMin(event.target.value)}
          placeholder="Salary min"
        />

        <Input
          type="number"
          min="0"
          value={salaryMax}
          onChange={(event) => setSalaryMax(event.target.value)}
          placeholder="Salary max"
        />

        <Input type="date" value={createdFrom} onChange={(event) => setCreatedFrom(event.target.value)} />

        <Input type="date" value={createdTo} onChange={(event) => setCreatedTo(event.target.value)} />
      </div>

      {candidatesQuery.isLoading ? (
        <Skeleton className="h-[520px] w-full" />
      ) : (
        <CandidateKanbanBoard
          candidates={candidatesQuery.data?.items ?? []}
          onMoveCandidate={handleMoveCandidate}
          isMutating={moveStageMutation.isPending}
        />
      )}
    </section>
  );
}
