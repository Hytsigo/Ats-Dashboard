"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { uploadCandidateFileService } from "@/features/candidates/services/candidates.service";

type Params = {
  organizationId: string;
  candidateId: string;
};

export function useUploadCandidateFileMutation({ organizationId, candidateId }: Params) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) =>
      uploadCandidateFileService({
        organizationId,
        candidateId,
        file,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["candidate-profile", organizationId, candidateId],
      });
    },
  });
}
