import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function OfflinePage() {
  return (
    <main className="grid min-h-screen place-items-center px-4">
      <Card className="max-w-md">
        <CardHeader><CardTitle>You’re offline</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Drafts and recent screens stay available. New entries will sync when your connection returns.</p>
        </CardContent>
      </Card>
    </main>
  );
}
