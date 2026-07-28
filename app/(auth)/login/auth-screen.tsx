"use client";

import { HeartPulse, ShieldCheck, UserPlus } from "lucide-react";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RegisterForm } from "../register/register-form";
import { LoginForm } from "./login-form";

type AuthMode = "login" | "register";

type AuthScreenProps = {
  callbackUrl: string;
  authError?: string;
};

const modeContent = {
  login: {
    title: "Sign in",
    description: "Continue with email and password or your Google account.",
    helperIcon: ShieldCheck,
    helper:
      "Sign in with your Steady Path account to keep your dashboard, ERP practice, check-ins, triggers, and journal entries synced."
  },
  register: {
    title: "Create account",
    description: "Choose an email and password for your private workspace.",
    helperIcon: UserPlus,
    helper:
      "Create a Steady Path account to protect your recovery data and return to it from the same browser or device."
  }
} as const;

export function AuthScreen({ callbackUrl, authError }: AuthScreenProps) {
  const [mode, setMode] = useState<AuthMode>("login");
  const content = modeContent[mode];
  const HelperIcon = content.helperIcon;

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-8 sm:px-6">
      <div className="grid w-full max-w-5xl gap-8 lg:grid-cols-[1fr_440px] lg:items-center">
        <section className="space-y-6">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <HeartPulse className="h-6 w-6" aria-hidden />
          </div>
          <div className="max-w-xl space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Steady Path</p>
            <h1 className="text-4xl font-semibold leading-tight text-foreground sm:text-5xl">
              Your recovery workspace, kept private.
            </h1>
            <p className="text-base leading-7 text-muted-foreground sm:text-lg">
              Sign in to keep episodes, ERP practice, check-ins, triggers, and journal entries connected to your
              account.
            </p>
          </div>
          <div className="flex max-w-xl items-start gap-3 rounded-md border bg-card/70 p-4 text-sm text-muted-foreground">
            <HelperIcon className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
            <p>{content.helper}</p>
          </div>
        </section>
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-2xl">{content.title}</CardTitle>
            <p className="text-sm text-muted-foreground">{content.description}</p>
          </CardHeader>
          <CardContent>
            {mode === "login" ? (
              <LoginForm callbackUrl={callbackUrl} authError={authError} onSwitchToRegister={() => setMode("register")} />
            ) : (
              <RegisterForm onSwitchToLogin={() => setMode("login")} />
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
