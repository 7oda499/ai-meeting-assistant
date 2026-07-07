import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/layout/AppShell";
import { MeetingCard } from "@/components/meetings/MeetingCard";
import { Plus, Search, MessageSquare } from "lucide-react";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: meetings } = await supabase
    .from("meetings")
    .select("*")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  const savedCount = meetings?.filter((m) => m.status === "saved").length || 0;
  const actionCount = meetings?.reduce((acc, m) => {
    const analysis = m.analysis as { actionItems?: unknown[] } | null;
    return acc + (analysis?.actionItems?.length || 0);
  }, 0) || 0;

  return (
    <AppShell userEmail={user.email}>
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="text-muted mt-1">
              {savedCount} saved meetings · {actionCount} action items tracked
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/search"
              className="inline-flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-white transition-colors"
            >
              <Search className="w-4 h-4" />
              Search
            </Link>
            <Link
              href="/chat"
              className="inline-flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-white transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              Ask AI
            </Link>
            <Link
              href="/meetings/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Meeting
            </Link>
          </div>
        </div>

        {!meetings?.length ? (
          <div className="text-center py-16 bg-white rounded-xl border border-border">
            <p className="text-muted mb-4">No meetings yet. Create your first one!</p>
            <Link
              href="/meetings/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              <Plus className="w-4 h-4" />
              New Meeting
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {meetings.map((meeting) => (
              <MeetingCard key={meeting.id} meeting={meeting} />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
