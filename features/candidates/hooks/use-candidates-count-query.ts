"use client";

import { useQuery } from "@tanstack/react-query";

import { getCandidatesCountService } from "@/features/candidates/services/candidates.service";

export function useCandidatesCountQuery(organizationId: string) {
  return useQuery({
    queryKey: ["candidates-count", organizationId],
    queryFn: () => getCandidatesCountService(organizationId),
    enabled: Boolean(organizationId),
  });
}
