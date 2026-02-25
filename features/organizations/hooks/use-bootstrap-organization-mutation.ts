"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { bootstrapOrganizationService } from "@/features/organizations/services/organizations.service";

export function useBootstrapOrganizationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: bootstrapOrganizationService,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["organization", "current"] });
      await queryClient.invalidateQueries({ queryKey: ["candidates"] });
    },
  });
}
