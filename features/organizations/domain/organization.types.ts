import type { Database } from "@/lib/supabase/types";

export type Organization = Database["public"]["Tables"]["organizations"]["Row"];
export type OrganizationSettings = Database["public"]["Tables"]["organization_settings"]["Row"];
