"use client";

import {
  DndContext,
  PointerSensor,
  closestCenter,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import Link from "next/link";

import { STAGE_LABELS } from "@/features/candidates/domain/candidate.constants";
import { groupCandidatesByStage } from "@/features/candidates/domain/candidate.selectors";
import type { Candidate } from "@/features/candidates/domain/candidate.types";
import type { CandidateStage } from "@/lib/supabase/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type CandidateKanbanBoardProps = {
  candidates: Candidate[];
  onMoveCandidate: (candidateId: string, stage: CandidateStage) => Promise<void>;
  isMutating?: boolean;
};

type CandidateCardProps = {
  candidate: Candidate;
};

type StageColumnProps = {
  stage: CandidateStage;
  candidates: Candidate[];
};

const STAGE_ACCENTS: Record<CandidateStage, string> = {
  applied: "bg-slate-500/70",
  screening: "bg-cyan-500/70",
  interview: "bg-teal-500/70",
  offer: "bg-emerald-500/70",
  hired: "bg-lime-500/70",
  rejected: "bg-rose-500/70",
};

function CandidateCard({ candidate }: CandidateCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: candidate.id,
    data: {
      type: "candidate",
      stage: candidate.stage,
      candidateId: candidate.id,
    },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.45 : 1,
  };

  return (
    <article
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="rounded-xl border border-border/80 bg-card/85 p-3 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
    >
      <h3 className="font-medium text-sm text-card-foreground">{candidate.full_name}</h3>
      <p className="mt-1 text-xs text-muted-foreground">{candidate.email}</p>
      {candidate.salary_expectation ? (
        <p className="mt-2 text-xs text-muted-foreground">
          Salary expectation: ${candidate.salary_expectation.toLocaleString()}
        </p>
      ) : null}
      <div className="mt-3 flex justify-end">
        <Button
          asChild
          size="sm"
          variant="outline"
          onPointerDown={(event) => event.stopPropagation()}
        >
          <Link href={`/candidates/${candidate.id}`}>View Profile</Link>
        </Button>
      </div>
    </article>
  );
}

function StageColumn({ stage, candidates }: StageColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `column-${stage}`,
    data: {
      type: "column",
      stage,
    },
  });

  return (
    <div ref={setNodeRef} className="min-w-[260px] md:min-w-[300px] xl:min-w-0">
      <Card
        className={
          isOver
            ? "border-primary/70 bg-primary/5 ring-2 ring-primary/20"
            : "border-border/80 bg-card/75"
        }
      >
        <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
          <CardTitle className="flex items-center gap-2 text-base">
            <span className={`inline-block size-2 rounded-full ${STAGE_ACCENTS[stage]}`} />
            {STAGE_LABELS[stage]}
          </CardTitle>
          <Badge variant="secondary">{candidates.length}</Badge>
        </CardHeader>
        <CardContent className="space-y-3">
          {candidates.length > 0 ? (
            candidates.map((candidate) => (
              <CandidateCard key={candidate.id} candidate={candidate} />
            ))
          ) : (
            <p className="rounded-lg border border-dashed p-3 text-xs text-muted-foreground">
              Drop candidates here
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export function CandidateKanbanBoard({
  candidates,
  onMoveCandidate,
  isMutating,
}: CandidateKanbanBoardProps) {
  const sensors = useSensors(useSensor(PointerSensor));
  const grouped = groupCandidatesByStage(candidates);

  const handleDragEnd = async (event: DragEndEvent) => {
    const activeData = event.active.data.current;

    if (!activeData || activeData.type !== "candidate" || !event.over) {
      return;
    }

    const sourceStage = activeData.stage as CandidateStage;
    let targetStage: CandidateStage | null = null;

    const overData = event.over.data.current;

    if (overData?.type === "column") {
      targetStage = overData.stage as CandidateStage;
    } else {
      const targetCandidate = candidates.find((candidate) => candidate.id === event.over?.id);
      targetStage = targetCandidate?.stage ?? null;
    }

    if (!targetStage || sourceStage === targetStage || isMutating) {
      return;
    }

    await onMoveCandidate(activeData.candidateId as string, targetStage);
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-2 xl:grid xl:grid-cols-3 2xl:grid-cols-6 xl:overflow-visible">
        {Object.entries(grouped).map(([stage, stageCandidates]) => (
          <StageColumn
            key={stage}
            stage={stage as CandidateStage}
            candidates={stageCandidates}
          />
        ))}
      </div>
    </DndContext>
  );
}
