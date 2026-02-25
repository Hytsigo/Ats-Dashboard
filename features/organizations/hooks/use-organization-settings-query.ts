"use client";

import { useQuery } from "@tanstack/react-query";

import { getOrganizationSettingsService } from "@/features/organizations/services/organizations.service";

export function useOrganizationSettingsQuery(organizationId: string) {
  return useQuery({
    queryKey: ["organization", "settings", organizationId],
    queryFn: () => getOrganizationSettingsService(organizationId),
    enabled: Boolean(organizationId),
  });
}
