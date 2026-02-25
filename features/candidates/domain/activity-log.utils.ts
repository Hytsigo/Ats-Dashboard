import { STAGE_LABELS } from "@/features/candidates/domain/candidate.constants";
import type { CandidateStage } from "@/lib/supabase/types";

function isStage(value: string): value is CandidateStage {
  return value in STAGE_LABELS;
}

export function toHumanActivityAction(action: string) {
  if (action.startsWith("stage_changed:")) {
    const [oldStage, newStage] = action.replace("stage_changed:", "").split("->");

    if (oldStage && newStage && isStage(oldStage) && isStage(newStage)) {
      return `Stage moved: ${STAGE_LABELS[oldStage]} -> ${STAGE_LABELS[newStage]}`;
    }
  }

  if (action === "candidate_created") {
    return "Candidate created";
  }

  if (action === "note_added") {
    return "Note added";
  }

  return action.replaceAll("_", " ");
}
