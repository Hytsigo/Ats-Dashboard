"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { loadDemoCandidatesService } from "@/features/candidates/services/candidates.service";

type Params = {
  organizationId: string;
};

export function useLoadDemoCandidatesMutation({ organizationId }: Params) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => loadDemoCandidatesService(organizationId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["candidates", organizationId] });
      await queryClient.invalidateQueries({ queryKey: ["candidates-count", organizationId] });
    },
  });
}
