import { z } from "zod";

import { CANDIDATE_STAGES } from "@/features/candidates/domain/candidate.constants";

export const candidateStageSchema = z.enum(CANDIDATE_STAGES);

export const candidateFiltersSchema = z.object({
  search: z.string().trim().optional(),
  stage: candidateStageSchema.optional(),
  salaryMin: z.coerce.number().nonnegative().optional(),
  salaryMax: z.coerce.number().nonnegative().optional(),
  createdFrom: z.string().datetime().optional(),
  createdTo: z.string().datetime().optional(),
});

export const createCandidateSchema = z.object({
  organizationId: z.string().uuid(),
  fullName: z.string().min(2).max(120),
  email: z.string().email(),
  phone: z.string().max(30).optional(),
  stage: candidateStageSchema.default("applied"),
  salaryExpectation: z.number().nonnegative().optional(),
  source: z.string().max(120).optional(),
});

export const moveCandidateStageSchema = z.object({
  candidateId: z.string().uuid(),
  stage: candidateStageSchema,
});

export const updateCandidateSchema = z.object({
  candidateId: z.string().uuid(),
  fullName: z.string().min(2).max(120),
  email: z.string().email(),
  phone: z.string().max(30).optional(),
  stage: candidateStageSchema,
  salaryExpectation: z.number().nonnegative().optional(),
  source: z.string().max(120).optional(),
});

export const deleteCandidateSchema = z.object({
  candidateId: z.string().uuid(),
});

export type CandidateFiltersInput = z.input<typeof candidateFiltersSchema>;
export type CandidateFilters = z.output<typeof candidateFiltersSchema>;
export type CreateCandidateInput = z.output<typeof createCandidateSchema>;
export type MoveCandidateStageInput = z.output<typeof moveCandidateStageSchema>;
export type UpdateCandidateInput = z.output<typeof updateCandidateSchema>;
export type DeleteCandidateInput = z.output<typeof deleteCandidateSchema>;
