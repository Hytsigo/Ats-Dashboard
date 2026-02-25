"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { updateCandidateService } from "@/features/candidates/services/candidates.service";

type Params = {
  organizationId: string;
  candidateId: string;
};

export function useUpdateCandidateMutation({ organizationId, candidateId }: Params) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateCandidateService,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["candidates", organizationId] });
      await queryClient.invalidateQueries({
        queryKey: ["candidate-profile", organizationId, candidateId],
      });
    },
  });
}
