"use client";

import { useQuery } from "@tanstack/react-query";

import { getCurrentOrganizationService } from "@/features/organizations/services/organizations.service";

export function useCurrentOrganizationQuery() {
  return useQuery({
    queryKey: ["organization", "current"],
    queryFn: getCurrentOrganizationService,
  });
}
