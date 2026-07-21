import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ProfilePage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header>
        <p className="text-sm font-medium text-muted-foreground">Account profile</p>
        <h1 className="text-2xl font-semibold">Profile</h1>
      </header>
      <Card>
        <CardHeader><CardTitle>Personal details</CardTitle></CardHeader>
        <CardContent>
          <form className="grid gap-4">
            <label className="grid gap-2 text-sm font-medium">Preferred name<Input defaultValue="Khaled" /></label>
            <label className="grid gap-2 text-sm font-medium">Email<Input type="email" defaultValue="you@example.com" /></label>
            <label className="grid gap-2 text-sm font-medium">Timezone<Input defaultValue="Asia/Dhaka" /></label>
            <Button className="w-full sm:w-fit">Save profile</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
