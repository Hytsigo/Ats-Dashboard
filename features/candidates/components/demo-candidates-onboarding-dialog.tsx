"use client";

import { useState } from "react";
import { toast } from "sonner";

import { useCandidatesCountQuery } from "@/features/candidates/hooks/use-candidates-count-query";
import { useLoadDemoCandidatesMutation } from "@/features/candidates/hooks/use-load-demo-candidates-mutation";
import { useCurrentOrganizationQuery } from "@/features/organizations/hooks/use-current-organization-query";
import { useMarkDemoOnboardingSeenMutation } from "@/features/organizations/hooks/use-mark-demo-onboarding-seen-mutation";
import { useOrganizationSettingsQuery } from "@/features/organizations/hooks/use-organization-settings-query";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getErrorMessage } from "@/lib/errors";

export function DemoCandidatesOnboardingDialog() {
  const [dismissed, setDismissed] = useState(false);
  const organizationQuery = useCurrentOrganizationQuery();
  const organizationId = organizationQuery.data?.id ?? "";
  const countQuery = useCandidatesCountQuery(organizationId);
  const settingsQuery = useOrganizationSettingsQuery(organizationId);
  const loadDemoMutation = useLoadDemoCandidatesMutation({ organizationId });
  const markSeenMutation = useMarkDemoOnboardingSeenMutation({ organizationId });

  const shouldPrompt =
    Boolean(organizationId) &&
    !organizationQuery.isLoading &&
    !countQuery.isLoading &&
    !settingsQuery.isLoading &&
    (countQuery.data ?? 0) === 0 &&
    !dismissed &&
    !settingsQuery.data?.onboarding_demo_seen;

  const handleClose = () => {
    markSeenMutation.mutate(undefined, {
      onSuccess: () => {
        setDismissed(true);
      },
      onError: (error) => {
        toast.error(getErrorMessage(error, "Could not update onboarding status"));
      },
    });
  };

  const handleLoadDemo = async () => {
    try {
      await loadDemoMutation.mutateAsync();
      await markSeenMutation.mutateAsync();
      toast.success("Demo candidates loaded");
      setDismissed(true);
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not load demo candidates"));
    }
  };

  return (
    <Dialog open={shouldPrompt} onOpenChange={(nextOpen) => (!nextOpen ? handleClose() : undefined)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Load demo candidates?</DialogTitle>
          <DialogDescription>
            We can add 10 realistic candidates to your pipeline so you can explore Kanban,
            profile pages, filters, and dashboard metrics immediately.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={loadDemoMutation.isPending || markSeenMutation.isPending}
          >
            No, thanks
          </Button>
          <Button
            onClick={handleLoadDemo}
            disabled={loadDemoMutation.isPending || markSeenMutation.isPending}
          >
            Yes, load demo data
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
