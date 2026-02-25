import type { SupabaseClient } from "@supabase/supabase-js";

import type {
  CandidateActivityLog,
  CandidateFile,
  Candidate,
  CandidateListResult,
  CandidateNote,
  CreateCandidateParams,
  DeleteCandidateParams,
  ListCandidatesParams,
  MoveStageParams,
  UpdateCandidateParams,
} from "@/features/candidates/domain/candidate.types";
import type { Database } from "@/lib/supabase/types";

type Client = SupabaseClient<Database>;

type CandidateInsert = Database["public"]["Tables"]["candidates"]["Insert"];

export async function listCandidates(
  client: Client,
  params: ListCandidatesParams,
): Promise<CandidateListResult> {
  let query = client
    .from("candidates")
    .select("*", { count: "exact" })
    .eq("organization_id", params.organizationId)
    .order("created_at", { ascending: false });

  const filters = params.filters;

  if (filters?.search) {
    query = query.ilike("full_name", `%${filters.search}%`);
  }

  if (filters?.stage) {
    query = query.eq("stage", filters.stage);
  }

  if (filters?.salaryMin !== undefined) {
    query = query.gte("salary_expectation", filters.salaryMin);
  }

  if (filters?.salaryMax !== undefined) {
    query = query.lte("salary_expectation", filters.salaryMax);
  }

  if (filters?.createdFrom) {
    query = query.gte("created_at", filters.createdFrom);
  }

  if (filters?.createdTo) {
    query = query.lte("created_at", filters.createdTo);
  }

  const { data, count, error } = await query;

  if (error) {
    throw error;
  }

  return {
    items: (data ?? []) as Candidate[],
    total: count ?? 0,
  };
}

export async function moveCandidateStage(client: Client, params: MoveStageParams) {
  const { data, error } = await client
    .from("candidates")
    .update({ stage: params.stage })
    .eq("id", params.candidateId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data as Candidate;
}

export async function createCandidate(client: Client, params: CreateCandidateParams) {
  const { data, error } = await client
    .from("candidates")
    .insert({
      organization_id: params.organizationId,
      full_name: params.fullName,
      email: params.email,
      phone: params.phone ?? null,
      stage: params.stage,
      salary_expectation: params.salaryExpectation ?? null,
      source: params.source ?? null,
      created_by: params.createdBy,
    })
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data as Candidate;
}

export async function updateCandidate(client: Client, params: UpdateCandidateParams) {
  const { data, error } = await client
    .from("candidates")
    .update({
      full_name: params.fullName,
      email: params.email,
      phone: params.phone ?? null,
      stage: params.stage,
      salary_expectation: params.salaryExpectation ?? null,
      source: params.source ?? null,
    })
    .eq("id", params.candidateId)
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data as Candidate;
}

export async function deleteCandidate(client: Client, params: DeleteCandidateParams) {
  const { error } = await client.from("candidates").delete().eq("id", params.candidateId);

  if (error) {
    throw error;
  }
}

export async function countCandidatesByOrganization(client: Client, organizationId: string) {
  const { count, error } = await client
    .from("candidates")
    .select("id", { count: "exact", head: true })
    .eq("organization_id", organizationId);

  if (error) {
    throw error;
  }

  return count ?? 0;
}

export async function insertCandidates(client: Client, candidates: CandidateInsert[]) {
  const { data, error } = await client.from("candidates").insert(candidates).select("*");

  if (error) {
    throw error;
  }

  return (data ?? []) as Candidate[];
}

export async function getCandidateById(
  client: Client,
  organizationId: string,
  candidateId: string,
) {
  const { data, error } = await client
    .from("candidates")
    .select("*")
    .eq("organization_id", organizationId)
    .eq("id", candidateId)
    .single();

  if (error) {
    throw error;
  }

  return data as Candidate;
}

export async function listCandidateNotes(client: Client, candidateId: string) {
  const { data, error } = await client
    .from("notes")
    .select("*")
    .eq("candidate_id", candidateId)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []) as CandidateNote[];
}

export async function addCandidateNote(client: Client, input: { candidateId: string; content: string }) {
  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) {
    throw new Error("You must be authenticated to add notes.");
  }

  const { data, error } = await client
    .from("notes")
    .insert({
      candidate_id: input.candidateId,
      content: input.content,
      author_id: user.id,
    })
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data as CandidateNote;
}

export async function listCandidateActivityLogs(client: Client, candidateId: string) {
  const { data, error } = await client
    .from("activity_logs")
    .select("*")
    .eq("candidate_id", candidateId)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []) as CandidateActivityLog[];
}

export async function listCandidateFiles(client: Client, candidateId: string) {
  const { data, error } = await client
    .from("files")
    .select("*")
    .eq("candidate_id", candidateId)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []) as CandidateFile[];
}

export async function createCandidateFileRecord(
  client: Client,
  input: { candidateId: string; filePath: string; fileName: string },
) {
  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) {
    throw new Error("You must be authenticated to upload files.");
  }

  const { data, error } = await client
    .from("files")
    .insert({
      candidate_id: input.candidateId,
      file_url: input.filePath,
      file_name: input.fileName,
      uploaded_by: user.id,
    })
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data as CandidateFile;
}
