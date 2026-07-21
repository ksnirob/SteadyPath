import { HeartPulse } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  return (
    <main className="grid min-h-screen place-items-center px-4 py-10">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="mb-2 grid h-12 w-12 place-items-center rounded-md bg-primary text-primary-foreground">
            <HeartPulse className="h-6 w-6" aria-hidden />
          </div>
          <CardTitle className="text-2xl">Sign in to Steady Path</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4">
            <label className="grid gap-2 text-sm font-medium">
              Email
              <Input type="email" autoComplete="email" />
            </label>
            <label className="grid gap-2 text-sm font-medium">
              Password
              <Input type="password" autoComplete="current-password" />
            </label>
            <Button type="submit" className="w-full">Sign in</Button>
            <Button type="button" variant="secondary" className="w-full">Continue with Google</Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
