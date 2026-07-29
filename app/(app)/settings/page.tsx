"use client";

import { ArrowRight, BookOpen, KeyRound, Moon, Save, Sun, UserRound } from "lucide-react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { FormEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { useRecoveryData } from "@/lib/recovery-store";

type ProfileData = {
  name: string;
  email: string;
  timezone: string;
};

const fallbackProfile: ProfileData = {
  name: "",
  email: "local@steady-path.app",
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Dhaka"
};

const timezoneOptions = [
  "Asia/Dhaka",
  "Asia/Kolkata",
  "Asia/Karachi",
  "Asia/Dubai",
  "Asia/Riyadh",
  "Europe/London",
  "Europe/Berlin",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "UTC"
];

const workflowItems: { href: "/triggers" | "/erp" | "/episodes" | "/insights"; title: string; text: string }[] = [
  {
    href: "/triggers",
    title: "1. Identify triggers",
    text: "Recurring fears and situations feed trigger averages."
  },
  {
    href: "/erp",
    title: "2. Build ERP plan",
    text: "Turn triggers into hierarchy items and response prevention."
  },
  {
    href: "/episodes",
    title: "3. Log episodes",
    text: "Episodes update calendar, trigger counts, and anxiety trends."
  },
  {
    href: "/insights",
    title: "4. Review progress",
    text: "Completed sessions and check-ins become progress signals."
  }
];

export default function SettingsPage() {
  const { setTheme } = useTheme();
  const { state, actions } = useRecoveryData();
  const toast = useToast();
  const [profile, setProfile] = useState<ProfileData>(fallbackProfile);
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [isProfileSaving, setIsProfileSaving] = useState(false);
  const [isPasswordSaving, setIsPasswordSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      const response = await fetch("/api/profile");
      if (!response.ok) return;
      const data = (await response.json()) as ProfileData;
      if (!cancelled) setProfile(data);
    }

    void loadProfile();
    return () => {
      cancelled = true;
    };
  }, []);

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsProfileSaving(true);

    const response = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profile)
    });

    setIsProfileSaving(false);

    if (!response.ok) {
      const result = (await response.json().catch(() => null)) as { error?: string } | null;
      toast.destructive("Profile not saved", result?.error || "Please check the profile fields.");
      return;
    }

    const updatedProfile = (await response.json()) as ProfileData;
    setProfile(updatedProfile);
    toast.success("Profile saved", "Your account details were updated.");
  }

  async function changePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.destructive("Password not changed", "New password and confirmation must match.");
      return;
    }

    setIsPasswordSaving(true);
    const response = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(passwords)
    });

    setIsPasswordSaving(false);

    if (!response.ok) {
      const result = (await response.json().catch(() => null)) as { error?: string } | null;
      toast.destructive("Password not changed", result?.error || "Please check your password fields.");
      return;
    }

    setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
    toast.success("Password changed", "Use the new password next time you sign in.");
  }

  function exportJson() {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `steady-path-export-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    toast.success("Export downloaded");
  }

  function deleteData() {
    actions.clearAllData();
    toast.destructive("Local data deleted", "All local recovery data was removed from this browser.");
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header className="max-w-3xl">
        <p className="text-sm font-medium text-muted-foreground">Account, privacy, and preferences</p>
        <h1 className="text-2xl font-semibold">Settings</h1>
      </header>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(22rem,0.9fr)]">
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserRound className="h-5 w-5 text-primary" aria-hidden />
              Personal details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form className="grid gap-4" onSubmit={saveProfile}>
              <label className="grid gap-2 text-sm font-medium">
                Preferred name
                <Input
                  value={profile.name}
                  onChange={(event) => setProfile((current) => ({ ...current, name: event.target.value }))}
                />
              </label>
              <label className="grid gap-2 text-sm font-medium">
                Email
                <Input
                  type="email"
                  value={profile.email}
                  onChange={(event) => setProfile((current) => ({ ...current, email: event.target.value }))}
                  required
                />
              </label>
              <label className="grid gap-2 text-sm font-medium">
                Local timezone
                <select
                  className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-medium text-foreground ring-offset-background transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={profile.timezone}
                  onChange={(event) => setProfile((current) => ({ ...current, timezone: event.target.value }))}
                  required
                >
                  {timezoneOptions.map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </label>
              <Button className="w-full sm:w-fit" disabled={isProfileSaving}>
                <Save className="h-4 w-4" aria-hidden />
                {isProfileSaving ? "Saving..." : "Save profile"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <KeyRound className="h-5 w-5 text-primary" aria-hidden />
              Change password
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form className="grid gap-4" onSubmit={changePassword}>
              <label className="grid gap-2 text-sm font-medium">
                Current password
                <Input
                  type="password"
                  autoComplete="current-password"
                  value={passwords.currentPassword}
                  onChange={(event) => setPasswords((current) => ({ ...current, currentPassword: event.target.value }))}
                />
              </label>
              <label className="grid gap-2 text-sm font-medium">
                New password
                <Input
                  type="password"
                  autoComplete="new-password"
                  minLength={8}
                  value={passwords.newPassword}
                  onChange={(event) => setPasswords((current) => ({ ...current, newPassword: event.target.value }))}
                  required
                />
              </label>
              <label className="grid gap-2 text-sm font-medium">
                Confirm new password
                <Input
                  type="password"
                  autoComplete="new-password"
                  minLength={8}
                  value={passwords.confirmPassword}
                  onChange={(event) => setPasswords((current) => ({ ...current, confirmPassword: event.target.value }))}
                  required
                />
              </label>
              <Button className="w-full sm:w-fit" disabled={isPasswordSaving}>
                <KeyRound className="h-4 w-4" aria-hidden />
                {isPasswordSaving ? "Changing..." : "Change password"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Theme</CardTitle></CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <Button variant="secondary" onClick={() => setTheme("light")}><Sun className="h-4 w-4" aria-hidden />Light</Button>
            <Button variant="secondary" onClick={() => setTheme("dark")}><Moon className="h-4 w-4" aria-hidden />Dark</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Data and privacy</CardTitle></CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <Button variant="secondary" onClick={exportJson}>Export JSON</Button>
            <Button variant="destructive" onClick={deleteData}>Delete local data</Button>
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" aria-hidden />
            Recovery workflow
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm sm:grid-cols-2">
          {workflowItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group flex min-h-28 flex-col justify-between rounded-md border bg-card p-4 transition hover:border-primary hover:bg-muted/50"
            >
              <span>
                <span className="block font-medium">{item.title}</span>
                <span className="mt-2 block text-muted-foreground">{item.text}</span>
              </span>
              <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary">
                Open <ArrowRight className="h-3 w-3 transition group-hover:translate-x-0.5" aria-hidden />
              </span>
            </Link>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
