"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { markDemoOnboardingSeenService } from "@/features/organizations/services/organizations.service";

type Params = {
  organizationId: string;
};

export function useMarkDemoOnboardingSeenMutation({ organizationId }: Params) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => markDemoOnboardingSeenService(organizationId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["organization", "settings", organizationId],
      });
    },
  });
}
