"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ChromeIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

export function AuthForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const signIn = async () => {
    const supabase = createClient();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Welcome back");
    router.push("/dashboard");
    router.refresh();
  };

  const signUp = async () => {
    const supabase = createClient();
    setLoading(true);

    const { error } = await supabase.auth.signUp({ email, password });
    setLoading(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Account created. If confirmation is enabled, check your email.");
  };

  const signInWithGoogle = async () => {
    const supabase = createClient();
    setLoading(true);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
      },
    });

    if (error) {
      setLoading(false);
      toast.error(error.message);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await signIn();
  };

  return (
    <Card className="w-full border-border/70 bg-background/95 shadow-none">
      <CardHeader>
        <CardTitle className="text-2xl">Sign in to Mini-ATS</CardTitle>
        <CardDescription>
          Use your email and password. You can create a new account from here too.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit}>
        <Button
          type="button"
          variant="outline"
          onClick={signInWithGoogle}
          disabled={loading}
          className="w-full"
        >
          <ChromeIcon className="mr-2 size-4" />
          Continue with Google
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border/80" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">or</span>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@company.com"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="At least 6 characters"
          />
        </div>

        <div className="flex gap-2">
          <Button type="submit" disabled={loading || !email || !password} className="flex-1">
            Sign in
          </Button>
          <Button
            type="button"
            onClick={signUp}
            disabled={loading || !email || password.length < 6}
            variant="outline"
            className="flex-1"
          >
            Sign up
          </Button>
        </div>
        </form>
      </CardContent>
    </Card>
  );
}
