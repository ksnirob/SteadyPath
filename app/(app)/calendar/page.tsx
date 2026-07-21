import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const days = Array.from({ length: 35 }, (_, index) => index + 1);

export default function CalendarPage() {
  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-medium text-muted-foreground">Recovery activity calendar</p>
        <h1 className="text-2xl font-semibold">July 2026</h1>
      </header>
      <Card>
        <CardHeader>
          <CardTitle>Monthly overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2 text-center text-sm">
            {["S", "M", "T", "W", "T", "F", "S"].map((day) => <div key={day} className="py-2 font-medium text-muted-foreground">{day}</div>)}
            {days.map((day) => (
              <div key={day} className="aspect-square rounded-md border p-2 text-left">
                <span className="text-sm font-medium">{day <= 31 ? day : ""}</span>
                {day % 3 === 0 && day <= 31 ? <div className="mt-2 h-2 rounded-full bg-primary" /> : null}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
