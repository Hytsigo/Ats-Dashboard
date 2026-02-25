"use client";

import { useState } from "react";
import { toast } from "sonner";

import { CANDIDATE_STAGES, STAGE_LABELS } from "@/features/candidates/domain/candidate.constants";
import { useCreateCandidateMutation } from "@/features/candidates/hooks/use-create-candidate-mutation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getErrorMessage } from "@/lib/errors";
import type { CandidateStage } from "@/lib/supabase/types";

type CreateCandidateDialogProps = {
  organizationId: string;
};

type FormState = {
  fullName: string;
  email: string;
  phone: string;
  stage: CandidateStage;
  salaryExpectation: string;
  source: string;
};

const INITIAL_FORM: FormState = {
  fullName: "",
  email: "",
  phone: "",
  stage: "applied",
  salaryExpectation: "",
  source: "",
};

export function CreateCandidateDialog({ organizationId }: CreateCandidateDialogProps) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const createMutation = useCreateCandidateMutation({ organizationId });

  const setField = <K extends keyof FormState>(field: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    try {
      await createMutation.mutateAsync({
        organizationId,
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        stage: form.stage,
        salaryExpectation: form.salaryExpectation
          ? Number(form.salaryExpectation)
          : undefined,
        source: form.source.trim() || undefined,
      });

      toast.success("Candidate created");
      setOpen(false);
      setForm(INITIAL_FORM);
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not create candidate"));
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full sm:w-auto">New Candidate</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create candidate</DialogTitle>
          <DialogDescription>
            Add a new candidate to your recruitment pipeline.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="candidate-name">Full name</Label>
            <Input
              id="candidate-name"
              value={form.fullName}
              onChange={(event) => setField("fullName", event.target.value)}
              placeholder="Jane Doe"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="candidate-email">Email</Label>
            <Input
              id="candidate-email"
              type="email"
              value={form.email}
              onChange={(event) => setField("email", event.target.value)}
              placeholder="jane@company.com"
            />
          </div>

          <div className="grid gap-2 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="candidate-phone">Phone</Label>
              <Input
                id="candidate-phone"
                value={form.phone}
                onChange={(event) => setField("phone", event.target.value)}
                placeholder="+34 600 000 000"
              />
            </div>

            <div className="grid gap-2">
              <Label>Stage</Label>
              <Select
                value={form.stage}
                onValueChange={(value) => setField("stage", value as CandidateStage)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select stage" />
                </SelectTrigger>
                <SelectContent>
                  {CANDIDATE_STAGES.map((stage) => (
                    <SelectItem key={stage} value={stage}>
                      {STAGE_LABELS[stage]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-2 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="candidate-salary">Salary expectation</Label>
              <Input
                id="candidate-salary"
                type="number"
                min="0"
                value={form.salaryExpectation}
                onChange={(event) => setField("salaryExpectation", event.target.value)}
                placeholder="45000"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="candidate-source">Source</Label>
              <Input
                id="candidate-source"
                value={form.source}
                onChange={(event) => setField("source", event.target.value)}
                placeholder="LinkedIn"
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={createMutation.isPending}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={createMutation.isPending}>
            Create Candidate
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
