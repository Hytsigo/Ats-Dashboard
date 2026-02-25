"use client";

import { useQuery } from "@tanstack/react-query";

import type { CandidateFiltersInput } from "@/features/candidates/domain/candidate.schemas";
import { listCandidatesService } from "@/features/candidates/services/candidates.service";

export function useCandidatesQuery(
  organizationId: string,
  filters?: CandidateFiltersInput,
) {
  return useQuery({
    queryKey: ["candidates", organizationId, filters],
    queryFn: () => listCandidatesService(organizationId, filters),
    enabled: Boolean(organizationId),
  });
}
