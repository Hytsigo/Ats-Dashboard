import { redirect } from "next/navigation";

import { PrivateShell } from "@/components/layout/private-shell";
import { createClient } from "@/lib/supabase/server";

type PrivateLayoutProps = {
  children: React.ReactNode;
};

export default async function PrivateLayout({ children }: PrivateLayoutProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth");
  }

  return <PrivateShell>{children}</PrivateShell>;
}
