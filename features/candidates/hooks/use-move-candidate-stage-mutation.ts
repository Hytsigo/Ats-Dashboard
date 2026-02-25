"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { moveCandidateStageService } from "@/features/candidates/services/candidates.service";

type Params = {
  organizationId: string;
};

export function useMoveCandidateStageMutation({ organizationId }: Params) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: moveCandidateStageService,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["candidates", organizationId],
      });
      await queryClient.invalidateQueries({ queryKey: ["candidate-profile"] });
    },
  });
}
