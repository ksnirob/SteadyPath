import { ClipboardCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function CheckInPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header>
        <p className="text-sm font-medium text-muted-foreground">Morning or evening check-in</p>
        <h1 className="text-2xl font-semibold">Today’s check-in</h1>
      </header>
      <Card>
        <CardHeader>
          <CardTitle>How are you doing?</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2 text-sm font-medium">Anxiety 0-10<Input type="number" min="0" max="10" defaultValue="4" /></label>
              <label className="grid gap-2 text-sm font-medium">Energy 0-10<Input type="number" min="0" max="10" defaultValue="6" /></label>
              <label className="grid gap-2 text-sm font-medium">Sleep hours<Input type="number" min="0" step="0.5" defaultValue="7" /></label>
              <label className="grid gap-2 text-sm font-medium">Mood<select className="h-11 rounded-md border bg-background px-3 text-sm" defaultValue="GOOD"><option>VERY_LOW</option><option>LOW</option><option>NEUTRAL</option><option>GOOD</option><option>GREAT</option></select></label>
            </div>
            <label className="grid gap-2 text-sm font-medium">Notes<Textarea /></label>
            <Button className="w-full sm:w-fit"><ClipboardCheck className="h-4 w-4" aria-hidden />Save check-in</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
