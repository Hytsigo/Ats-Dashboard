"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createCandidateService } from "@/features/candidates/services/candidates.service";

type Params = {
  organizationId: string;
};

export function useCreateCandidateMutation({ organizationId }: Params) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCandidateService,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["candidates", organizationId] });
      await queryClient.invalidateQueries({ queryKey: ["candidates-count", organizationId] });
      await queryClient.invalidateQueries({ queryKey: ["candidate-profile"] });
    },
  });
}
