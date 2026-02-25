import type { SupabaseClient } from "@supabase/supabase-js";

import type {
  Organization,
  OrganizationSettings,
} from "@/features/organizations/domain/organization.types";
import type { Database } from "@/lib/supabase/types";

type Client = SupabaseClient<Database>;

export async function listMyOrganizations(client: Client) {
  const { data, error } = await client
    .from("organization_members")
    .select("organizations(*)")
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  const organizations = (data ?? [])
    .map((row) => row.organizations)
    .filter(Boolean) as Organization[];

  return organizations;
}

export async function createOrganization(client: Client, name: string) {
  const { data, error } = await client
    .from("organizations")
    .insert({ name })
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data as Organization;
}

export async function createOwnerMembership(client: Client, organizationId: string, userId: string) {
  const { error } = await client.from("organization_members").insert({
    organization_id: organizationId,
    user_id: userId,
    role: "owner",
  });

  if (error) {
    throw error;
  }
}

export async function getOrganizationSettings(client: Client, organizationId: string) {
  const { data, error } = await client
    .from("organization_settings")
    .select("*")
    .eq("organization_id", organizationId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return (data ?? null) as OrganizationSettings | null;
}

export async function markOrganizationDemoOnboardingSeen(client: Client, organizationId: string) {
  const { data, error } = await client
    .from("organization_settings")
    .update({ onboarding_demo_seen: true })
    .eq("organization_id", organizationId)
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data as OrganizationSettings;
}
