"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { addCandidateNoteService } from "@/features/candidates/services/candidates.service";

type Params = {
  organizationId: string;
  candidateId: string;
};

export function useAddCandidateNoteMutation({ organizationId, candidateId }: Params) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addCandidateNoteService,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["candidate-profile", organizationId, candidateId],
      });
    },
  });
}
