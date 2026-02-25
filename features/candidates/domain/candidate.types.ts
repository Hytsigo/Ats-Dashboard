import type { CandidateFilters } from "@/features/candidates/domain/candidate.schemas";
import type { CandidateStage, Database } from "@/lib/supabase/types";

export type Candidate = Database["public"]["Tables"]["candidates"]["Row"];
export type CandidateNote = Database["public"]["Tables"]["notes"]["Row"];
export type CandidateActivityLog = Database["public"]["Tables"]["activity_logs"]["Row"];
export type CandidateFile = Database["public"]["Tables"]["files"]["Row"];

export type CandidateListResult = {
  items: Candidate[];
  total: number;
};

export type CandidateProfile = {
  candidate: Candidate;
  notes: CandidateNote[];
  activityLogs: CandidateActivityLog[];
  files: CandidateFile[];
};

export type ListCandidatesParams = {
  organizationId: string;
  filters?: CandidateFilters;
};

export type MoveStageParams = {
  candidateId: string;
  stage: CandidateStage;
};

export type CreateCandidateParams = {
  organizationId: string;
  fullName: string;
  email: string;
  phone?: string;
  stage: CandidateStage;
  salaryExpectation?: number;
  source?: string;
  createdBy: string;
};

export type UpdateCandidateParams = {
  candidateId: string;
  fullName: string;
  email: string;
  phone?: string;
  stage: CandidateStage;
  salaryExpectation?: number;
  source?: string;
};

export type DeleteCandidateParams = {
  candidateId: string;
};
