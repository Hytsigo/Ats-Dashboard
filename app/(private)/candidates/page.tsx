import { CandidatesKanbanSection } from "@/features/candidates/components/candidates-kanban-section";

export default function CandidatesPage() {
  return (
    <main className="px-4 py-6 sm:px-6 sm:py-8">
      <div className="mx-auto w-full max-w-[1500px] space-y-6">
        <header className="surface-panel px-5 py-4">
          <p className="font-mono text-xs uppercase tracking-[0.24em] text-primary">Talent Flow</p>
          <h1 className="text-3xl font-semibold tracking-tight">Candidates Pipeline</h1>
          <p className="text-sm text-muted-foreground">
            Drag and drop candidates between stages. Each move updates the database and
            generates an activity log entry.
          </p>
        </header>

        <CandidatesKanbanSection />
      </div>
    </main>
  );
}
