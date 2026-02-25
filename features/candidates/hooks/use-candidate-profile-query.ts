"use client";

import { useQuery } from "@tanstack/react-query";

import { getCandidateProfileService } from "@/features/candidates/services/candidates.service";

export function useCandidateProfileQuery(organizationId: string, candidateId: string) {
  return useQuery({
    queryKey: ["candidate-profile", organizationId, candidateId],
    queryFn: () => getCandidateProfileService(organizationId, candidateId),
    enabled: Boolean(organizationId && candidateId),
  });
}
