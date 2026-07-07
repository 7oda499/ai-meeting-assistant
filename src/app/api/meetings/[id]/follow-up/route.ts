import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateFollowUpEmail } from "@/lib/openai/analysis";
import type { MeetingAnalysis } from "@/types/meeting";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: meeting, error } = await supabase
    .from("meetings")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error || !meeting?.analysis) {
    return NextResponse.json({ error: "Meeting or analysis not found" }, { status: 404 });
  }

  try {
    const email = await generateFollowUpEmail(meeting.analysis as MeetingAnalysis, {
      title: meeting.title,
      meetingDate: meeting.meeting_date,
      participants: meeting.participants,
    });

    await supabase
      .from("meetings")
      .update({ follow_up_email: email })
      .eq("id", id);

    return NextResponse.json({ email });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Email generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
