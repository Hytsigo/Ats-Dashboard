import Link from "next/link";

import { CandidateProfileSection } from "@/features/candidates/components/candidate-profile-section";
import { Button } from "@/components/ui/button";

type CandidateProfilePageProps = {
  params: Promise<{ candidateId: string }>;
};

export default async function CandidateProfilePage({ params }: CandidateProfilePageProps) {
  const { candidateId } = await params;

  return (
    <main className="px-4 py-6 sm:px-6 sm:py-8">
      <div className="mx-auto w-full max-w-[1500px] space-y-6">
        <div className="surface-panel px-5 py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.24em] text-primary">Candidate</p>
              <h1 className="text-3xl font-semibold tracking-tight">Candidate Profile</h1>
            </div>
            <Button asChild variant="outline" className="w-full sm:w-auto">
              <Link href="/candidates">Back to Pipeline</Link>
            </Button>
          </div>
        </div>
        <CandidateProfileSection candidateId={candidateId} />
      </div>
    </main>
  );
}
