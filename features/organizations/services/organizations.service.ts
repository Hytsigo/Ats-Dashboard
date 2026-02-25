import {
  getOrganizationSettings,
  listMyOrganizations,
  markOrganizationDemoOnboardingSeen,
} from "@/features/organizations/repository/organizations.repository";
import { createClient } from "@/lib/supabase/client";

export async function getCurrentOrganizationService() {
  const supabase = createClient();
  const organizations = await listMyOrganizations(supabase);

  return organizations[0] ?? null;
}

export async function bootstrapOrganizationService(name = "My Company") {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("bootstrap_organization", {
    org_name: name,
  });

  if (error) {
    throw error;
  }

  return data;
}

export async function getOrganizationSettingsService(organizationId: string) {
  const supabase = createClient();

  return getOrganizationSettings(supabase, organizationId);
}

export async function markDemoOnboardingSeenService(organizationId: string) {
  const supabase = createClient();

  return markOrganizationDemoOnboardingSeen(supabase, organizationId);
}
