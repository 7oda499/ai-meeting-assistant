import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { answerMeetingQuestion } from "@/lib/openai/analysis";
import type { MeetingAnalysis } from "@/types/meeting";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { question } = await request.json();
  if (!question?.trim()) {
    return NextResponse.json({ error: "Question is required" }, { status: 400 });
  }

  const { data: meetings, error } = await supabase
    .from("meetings")
    .select("title, meeting_date, analysis, transcript")
    .eq("user_id", user.id)
    .eq("status", "saved")
    .order("meeting_date", { ascending: false })
    .limit(20);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const answer = await answerMeetingQuestion(
    question,
    (meetings || []).map((m) => ({
      title: m.title,
      meeting_date: m.meeting_date,
      analysis: m.analysis as MeetingAnalysis | null,
      transcript: m.transcript,
    }))
  );

  return NextResponse.json({ answer });
}
