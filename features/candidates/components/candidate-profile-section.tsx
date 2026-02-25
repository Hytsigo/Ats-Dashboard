"use client";

import { format } from "date-fns";
import { useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { toHumanActivityAction } from "@/features/candidates/domain/activity-log.utils";
import { CANDIDATE_STAGES, STAGE_LABELS } from "@/features/candidates/domain/candidate.constants";
import { useAddCandidateNoteMutation } from "@/features/candidates/hooks/use-add-candidate-note-mutation";
import { useCandidateProfileQuery } from "@/features/candidates/hooks/use-candidate-profile-query";
import { useDeleteCandidateMutation } from "@/features/candidates/hooks/use-delete-candidate-mutation";
import { useUpdateCandidateMutation } from "@/features/candidates/hooks/use-update-candidate-mutation";
import { useCurrentOrganizationQuery } from "@/features/organizations/hooks/use-current-organization-query";
import { useUploadCandidateFileMutation } from "@/features/candidates/hooks/use-upload-candidate-file-mutation";
import { getCandidateFileDownloadUrlService } from "@/features/candidates/services/candidates.service";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { getErrorMessage } from "@/lib/errors";
import type { CandidateStage } from "@/lib/supabase/types";

type CandidateProfileSectionProps = {
  candidateId: string;
};

export function CandidateProfileSection({ candidateId }: CandidateProfileSectionProps) {
  const [noteContent, setNoteContent] = useState("");
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    stage: "applied" as CandidateStage,
    salaryExpectation: "",
    source: "",
  });
  const router = useRouter();

  const { data: organization } = useCurrentOrganizationQuery();
  const organizationId = organization?.id ?? "";

  const profileQuery = useCandidateProfileQuery(organizationId, candidateId);
  const noteMutation = useAddCandidateNoteMutation({ organizationId, candidateId });
  const uploadMutation = useUploadCandidateFileMutation({ organizationId, candidateId });
  const updateMutation = useUpdateCandidateMutation({ organizationId, candidateId });
  const deleteMutation = useDeleteCandidateMutation({ organizationId });

  const handleAddNote = async () => {
    if (!noteContent.trim()) {
      return;
    }

    try {
      await noteMutation.mutateAsync({
        candidateId,
        content: noteContent,
      });
      setNoteContent("");
      toast.success("Note added");
    } catch {
      toast.error("Could not add note");
    }
  };

  const handleUploadFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      await uploadMutation.mutateAsync(file);
      toast.success("CV uploaded");
      event.target.value = "";
    } catch {
      toast.error("Could not upload file");
    }
  };

  const handleOpenFile = async (filePath: string) => {
    try {
      const signedUrl = await getCandidateFileDownloadUrlService(filePath);
      window.open(signedUrl, "_blank", "noopener,noreferrer");
    } catch {
      toast.error("Could not generate download URL");
    }
  };

  const openEditDialog = () => {
    const candidate = profileQuery.data?.candidate;

    if (!candidate) {
      return;
    }

    setEditForm({
      fullName: candidate.full_name,
      email: candidate.email,
      phone: candidate.phone ?? "",
      stage: candidate.stage,
      salaryExpectation: candidate.salary_expectation ? String(candidate.salary_expectation) : "",
      source: candidate.source ?? "",
    });
    setIsEditOpen(true);
  };

  const handleUpdateCandidate = async () => {
    try {
      await updateMutation.mutateAsync({
        candidateId,
        fullName: editForm.fullName.trim(),
        email: editForm.email.trim(),
        phone: editForm.phone.trim() || undefined,
        stage: editForm.stage,
        salaryExpectation: editForm.salaryExpectation
          ? Number(editForm.salaryExpectation)
          : undefined,
        source: editForm.source.trim() || undefined,
      });
      toast.success("Candidate updated");
      setIsEditOpen(false);
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not update candidate"));
    }
  };

  const handleDeleteCandidate = async () => {
    try {
      await deleteMutation.mutateAsync({ candidateId });
      toast.success("Candidate deleted");
      setIsDeleteOpen(false);
      router.push("/candidates");
      router.refresh();
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not delete candidate"));
    }
  };

  if (profileQuery.isLoading) {
    return <Skeleton className="h-[540px] w-full" />;
  }

  if (!profileQuery.data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Candidate not found</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  const { candidate, notes, activityLogs, files } = profileQuery.data;

  return (
    <>
      <section className="grid gap-4 xl:grid-cols-3">
      <Card className="border-border/70 bg-card/80 xl:col-span-1">
        <CardHeader className="gap-3">
          <CardTitle>General Info</CardTitle>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button size="sm" variant="outline" onClick={openEditDialog}>
              Edit
            </Button>
            <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="destructive">
                  Delete
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Delete candidate?</DialogTitle>
                  <DialogDescription>
                    This action cannot be undone. Notes, files, and activity history will be
                    removed.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsDeleteOpen(false)}
                    disabled={deleteMutation.isPending}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleDeleteCandidate}
                    disabled={deleteMutation.isPending}
                  >
                    Delete Candidate
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p className="text-lg font-medium">{candidate.full_name}</p>
          <p className="text-muted-foreground">{candidate.email}</p>
          <p className="text-muted-foreground">{candidate.phone ?? "No phone"}</p>
          <Badge>{STAGE_LABELS[candidate.stage]}</Badge>
          <p className="text-muted-foreground">
            Salary expectation: {candidate.salary_expectation ? `$${candidate.salary_expectation}` : "N/A"}
          </p>
          <p className="text-muted-foreground">Source: {candidate.source ?? "N/A"}</p>
        </CardContent>
      </Card>

      <div className="space-y-4 xl:col-span-2">
        <Card className="border-border/70 bg-card/80">
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Textarea
              value={noteContent}
              onChange={(event) => setNoteContent(event.target.value)}
              placeholder="Add interview feedback or recruiter notes"
            />
            <Button onClick={handleAddNote} disabled={noteMutation.isPending}>
              Add Note
            </Button>
            <div className="space-y-2">
              {notes.map((note) => (
                <div key={note.id} className="rounded-lg border border-border/80 bg-background/60 p-3 text-sm">
                  <p>{note.content}</p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {format(new Date(note.created_at), "PPP p")}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-card/80">
          <CardHeader>
            <CardTitle>Files</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input type="file" onChange={handleUploadFile} accept=".pdf,.doc,.docx" />
            <div className="space-y-2">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between rounded-lg border border-border/80 bg-background/60 p-3 text-sm"
                >
                  <span>{file.file_name}</span>
                  <Button variant="outline" size="sm" onClick={() => handleOpenFile(file.file_url)}>
                    Open
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-card/80">
          <CardHeader>
            <CardTitle>Activity Log</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {activityLogs.map((log) => (
              <div key={log.id} className="rounded-lg border border-border/80 bg-background/60 p-3 text-sm">
                <p className="font-medium">{toHumanActivityAction(log.action)}</p>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(log.created_at), "PPP p")}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
      </section>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit candidate</DialogTitle>
            <DialogDescription>
              Update candidate details and current stage in your pipeline.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-candidate-name">Full name</Label>
              <Input
                id="edit-candidate-name"
                value={editForm.fullName}
                onChange={(event) => setEditForm((prev) => ({ ...prev, fullName: event.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-candidate-email">Email</Label>
              <Input
                id="edit-candidate-email"
                type="email"
                value={editForm.email}
                onChange={(event) => setEditForm((prev) => ({ ...prev, email: event.target.value }))}
              />
            </div>
            <div className="grid gap-2 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="edit-candidate-phone">Phone</Label>
                <Input
                  id="edit-candidate-phone"
                  value={editForm.phone}
                  onChange={(event) => setEditForm((prev) => ({ ...prev, phone: event.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label>Stage</Label>
                <Select
                  value={editForm.stage}
                  onValueChange={(value) =>
                    setEditForm((prev) => ({ ...prev, stage: value as CandidateStage }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Stage" />
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
                <Label htmlFor="edit-candidate-salary">Salary expectation</Label>
                <Input
                  id="edit-candidate-salary"
                  type="number"
                  min="0"
                  value={editForm.salaryExpectation}
                  onChange={(event) =>
                    setEditForm((prev) => ({ ...prev, salaryExpectation: event.target.value }))
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-candidate-source">Source</Label>
                <Input
                  id="edit-candidate-source"
                  value={editForm.source}
                  onChange={(event) => setEditForm((prev) => ({ ...prev, source: event.target.value }))}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)} disabled={updateMutation.isPending}>
              Cancel
            </Button>
            <Button onClick={handleUpdateCandidate} disabled={updateMutation.isPending}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
