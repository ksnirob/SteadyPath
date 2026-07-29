"use client";

import { KeyRound, Save, UserRound } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

type ProfileData = {
  name: string;
  email: string;
  timezone: string;
};

const fallbackProfile: ProfileData = {
  name: "",
  email: "local@steady-path.app",
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC"
};

export default function ProfilePage() {
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

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header>
        <p className="text-sm font-medium text-muted-foreground">Account profile</p>
        <h1 className="text-2xl font-semibold">Profile</h1>
      </header>

      <Card>
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
              Timezone
              <Input
                value={profile.timezone}
                onChange={(event) => setProfile((current) => ({ ...current, timezone: event.target.value }))}
                required
              />
            </label>
            <Button className="w-full sm:w-fit" disabled={isProfileSaving}>
              <Save className="h-4 w-4" aria-hidden />
              {isProfileSaving ? "Saving..." : "Save profile"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
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
    </div>
  );
}
