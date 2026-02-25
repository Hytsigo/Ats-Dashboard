import {
  candidateFiltersSchema,
  createCandidateSchema,
  deleteCandidateSchema,
  moveCandidateStageSchema,
  updateCandidateSchema,
  type CandidateFiltersInput,
  type CreateCandidateInput,
  type DeleteCandidateInput,
  type UpdateCandidateInput,
} from "@/features/candidates/domain/candidate.schemas";
import {
  addCandidateNote,
  countCandidatesByOrganization,
  createCandidate,
  createCandidateFileRecord,
  deleteCandidate,
  getCandidateById,
  insertCandidates,
  listCandidateActivityLogs,
  listCandidateFiles,
  listCandidateNotes,
  listCandidates,
  moveCandidateStage,
  updateCandidate,
} from "@/features/candidates/repository/candidates.repository";
import { createClient } from "@/lib/supabase/client";

export async function listCandidatesService(
  organizationId: string,
  filters?: CandidateFiltersInput,
) {
  const parsedFilters = filters ? candidateFiltersSchema.parse(filters) : undefined;
  const supabase = createClient();

  return listCandidates(supabase, {
    organizationId,
    filters: parsedFilters,
  });
}

export async function moveCandidateStageService(input: {
  candidateId: string;
  stage: string;
}) {
  const supabase = createClient();
  const parsedInput = moveCandidateStageSchema.parse(input);

  return moveCandidateStage(supabase, parsedInput);
}

export async function createCandidateService(input: CreateCandidateInput) {
  const supabase = createClient();
  const parsedInput = createCandidateSchema.parse(input);
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("You must be authenticated to create candidates.");
  }

  return createCandidate(supabase, {
    ...parsedInput,
    createdBy: user.id,
  });
}

export async function updateCandidateService(input: UpdateCandidateInput) {
  const supabase = createClient();
  const parsedInput = updateCandidateSchema.parse(input);

  return updateCandidate(supabase, parsedInput);
}

export async function deleteCandidateService(input: DeleteCandidateInput) {
  const supabase = createClient();
  const parsedInput = deleteCandidateSchema.parse(input);

  await deleteCandidate(supabase, parsedInput);
}

export async function getCandidateProfileService(organizationId: string, candidateId: string) {
  const supabase = createClient();

  const [candidate, notes, activityLogs, files] = await Promise.all([
    getCandidateById(supabase, organizationId, candidateId),
    listCandidateNotes(supabase, candidateId),
    listCandidateActivityLogs(supabase, candidateId),
    listCandidateFiles(supabase, candidateId),
  ]);

  return {
    candidate,
    notes,
    activityLogs,
    files,
  };
}

export async function addCandidateNoteService(input: {
  candidateId: string;
  content: string;
}) {
  const supabase = createClient();

  return addCandidateNote(supabase, {
    candidateId: input.candidateId,
    content: input.content.trim(),
  });
}

export async function uploadCandidateFileService(input: {
  organizationId: string;
  candidateId: string;
  file: File;
}) {
  const supabase = createClient();
  const safeName = input.file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
  const filePath = `${input.organizationId}/${input.candidateId}/${Date.now()}-${safeName}`;

  const { error: uploadError } = await supabase.storage
    .from("candidate-files")
    .upload(filePath, input.file, { upsert: false });

  if (uploadError) {
    throw uploadError;
  }

  return createCandidateFileRecord(supabase, {
    candidateId: input.candidateId,
    filePath,
    fileName: input.file.name,
  });
}

export async function getCandidateFileDownloadUrlService(filePath: string) {
  const supabase = createClient();

  const { data, error } = await supabase.storage
    .from("candidate-files")
    .createSignedUrl(filePath, 60 * 5);

  if (error) {
    throw error;
  }

  return data.signedUrl;
}

export async function getCandidatesCountService(organizationId: string) {
  const supabase = createClient();

  return countCandidatesByOrganization(supabase, organizationId);
}

export async function loadDemoCandidatesService(organizationId: string) {
  const supabase = createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("You must be authenticated to load demo candidates.");
  }

  const total = await countCandidatesByOrganization(supabase, organizationId);

  if (total > 0) {
    throw new Error("Demo candidates can only be loaded into an empty pipeline.");
  }

  const baseDate = Date.now();
  const demoCandidates = [
    ["Ana Torres", "ana.torres@demo.ats", "applied", 35000, "LinkedIn", "+34 600 111 111", 2],
    ["Bruno Diaz", "bruno.diaz@demo.ats", "screening", 42000, "Referral", "+34 600 222 222", 6],
    ["Carla Mendez", "carla.mendez@demo.ats", "interview", 50000, "Indeed", "+34 600 333 333", 10],
    ["Diego Herrera", "diego.herrera@demo.ats", "offer", 60000, "LinkedIn", "+34 600 444 444", 14],
    ["Elena Soto", "elena.soto@demo.ats", "hired", 65000, "Referral", "+34 600 555 555", 20],
    ["Fabian Ruiz", "fabian.ruiz@demo.ats", "rejected", 38000, "Website", "+34 600 666 666", 8],
    ["Gabriela Cruz", "gabriela.cruz@demo.ats", "screening", 47000, "LinkedIn", "+34 600 777 777", 4],
    ["Hector Lima", "hector.lima@demo.ats", "applied", 33000, "Website", "+34 600 888 888", 1],
    ["Irene Martin", "irene.martin@demo.ats", "interview", 54000, "Referral", "+34 600 999 999", 9],
    ["Javier Nunez", "javier.nunez@demo.ats", "offer", 59000, "LinkedIn", "+34 600 000 123", 12],
  ] as const;

  return insertCandidates(
    supabase,
    demoCandidates.map(([fullName, email, stage, salary, source, phone, daysAgo], index) => ({
      organization_id: organizationId,
      full_name: fullName,
      email,
      phone,
      stage,
      salary_expectation: salary,
      source,
      created_by: user.id,
      created_at: new Date(baseDate - daysAgo * 86_400_000 - index * 30_000).toISOString(),
    })),
  );
}
