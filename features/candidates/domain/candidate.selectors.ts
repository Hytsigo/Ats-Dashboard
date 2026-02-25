import { CANDIDATE_STAGES } from "@/features/candidates/domain/candidate.constants";
import type { Candidate } from "@/features/candidates/domain/candidate.types";
import type { CandidateStage } from "@/lib/supabase/types";

export function groupCandidatesByStage(candidates: Candidate[]) {
  const grouped = CANDIDATE_STAGES.reduce(
    (acc, stage) => {
      acc[stage] = [];
      return acc;
    },
    {} as Record<CandidateStage, Candidate[]>,
  );

  candidates.forEach((candidate) => {
    grouped[candidate.stage].push(candidate);
  });

  return grouped;
}
