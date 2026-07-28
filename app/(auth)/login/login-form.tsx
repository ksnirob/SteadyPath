"use client";

import { AlertCircle, Loader2, Mail } from "lucide-react";
import { signIn } from "next-auth/react";
import { useMemo, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type LoginFormProps = {
  callbackUrl: string;
  authError?: string;
  onSwitchToRegister?: () => void;
};

export function LoginForm({ callbackUrl, authError, onSwitchToRegister }: LoginFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [isCredentialsPending, setIsCredentialsPending] = useState(false);
  const [isGooglePending, setIsGooglePending] = useState(false);

  const visibleError = useMemo(() => {
    if (error) return error;
    if (!authError) return null;
    return authError === "OAuthAccountNotLinked"
      ? "That email is already linked to another sign-in method."
      : "We could not complete sign-in. Please try again.";
  }, [authError, error]);

  async function handleCredentialsSignIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsCredentialsPending(true);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") || "");
    const password = String(formData.get("password") || "");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl
    });

    setIsCredentialsPending(false);

    if (result?.error) {
      setError("Email or password is incorrect.");
      return;
    }

    window.location.assign(result?.url || callbackUrl);
  }

  async function handleGoogleSignIn() {
    setError(null);
    setIsGooglePending(true);
    await signIn("google", { callbackUrl });
  }

  const isPending = isCredentialsPending || isGooglePending;

  return (
    <form className="grid gap-4" onSubmit={handleCredentialsSignIn}>
      {visibleError ? (
        <div className="flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <p>{visibleError}</p>
        </div>
      ) : null}
      <label className="grid gap-2 text-sm font-medium">
        Email
        <Input name="email" type="email" autoComplete="email" required placeholder="you@example.com" />
      </label>
      <label className="grid gap-2 text-sm font-medium">
        Password
        <Input name="password" type="password" autoComplete="current-password" required minLength={8} />
      </label>
      <Button type="submit" className="w-full" disabled={isPending}>
        {isCredentialsPending ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        ) : (
          <Mail className="h-4 w-4" aria-hidden />
        )}
        Sign in with email
      </Button>
      <Button
        type="button"
        variant="secondary"
        className="w-full"
        disabled={isPending}
        onClick={handleGoogleSignIn}
      >
        {isGooglePending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
        Continue with Google
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        Need an account?{" "}
        <button type="button" className="font-medium text-primary hover:underline" onClick={onSwitchToRegister}>
          Sign up
        </button>
      </p>
    </form>
  );
}
