"use client";

import { AlertCircle, Loader2, UserPlus } from "lucide-react";
import { signIn } from "next-auth/react";
import { type FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type RegisterFormProps = {
  onSwitchToLogin?: () => void;
};

export function RegisterForm({ onSwitchToLogin }: RegisterFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsPending(true);

    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") || "");
    const email = String(formData.get("email") || "");
    const password = String(formData.get("password") || "");

    const response = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password })
    });

    if (!response.ok) {
      const result = (await response.json().catch(() => null)) as { error?: string } | null;
      setError(result?.error || "Could not create account. Please try again.");
      setIsPending(false);
      return;
    }

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl: "/dashboard"
    });

    setIsPending(false);

    if (result?.error) {
      window.location.assign("/login");
      return;
    }

    window.location.assign(result?.url || "/dashboard");
  }

  return (
    <form className="grid gap-4" onSubmit={handleSubmit}>
      {error ? (
        <div className="flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <p>{error}</p>
        </div>
      ) : null}
      <label className="grid gap-2 text-sm font-medium">
        Name
        <Input name="name" type="text" autoComplete="name" placeholder="Your name" />
      </label>
      <label className="grid gap-2 text-sm font-medium">
        Email
        <Input name="email" type="email" autoComplete="email" required placeholder="you@example.com" />
      </label>
      <label className="grid gap-2 text-sm font-medium">
        Password
        <Input name="password" type="password" autoComplete="new-password" required minLength={8} />
      </label>
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        ) : (
          <UserPlus className="h-4 w-4" aria-hidden />
        )}
        Create account
      </Button>
      {onSwitchToLogin ? (
        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <button type="button" className="font-medium text-primary hover:underline" onClick={onSwitchToLogin}>
            Sign in
          </button>
        </p>
      ) : null}
    </form>
  );
}
