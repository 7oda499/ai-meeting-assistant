import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  analyzeTranscript,
  transcribeAudio,
  generateSearchEmbedding,
} from "@/lib/openai/analysis";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: meeting, error: fetchError } = await supabase
    .from("meetings")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (fetchError || !meeting) {
    return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
  }

  await supabase
    .from("meetings")
    .update({ status: "processing" })
    .eq("id", id);

  try {
    const formData = await request.formData();
    const transcriptText = formData.get("transcript") as string | null;
    const audioFile = formData.get("audio") as File | null;

    let transcript = transcriptText?.trim() || meeting.transcript;

    if (audioFile && audioFile.size > 0) {
      const buffer = Buffer.from(await audioFile.arrayBuffer());
      const ext = audioFile.name.split(".").pop() || "mp3";
      const storagePath = `${user.id}/${id}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("meeting-audio")
        .upload(storagePath, buffer, { upsert: true, contentType: audioFile.type });

      if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

      const { data: urlData } = supabase.storage
        .from("meeting-audio")
        .getPublicUrl(storagePath);

      transcript = await transcribeAudio(buffer, audioFile.name);

      await supabase
        .from("meetings")
        .update({ audio_url: urlData.publicUrl, transcript })
        .eq("id", id);
    }

    if (!transcript) {
      return NextResponse.json(
        { error: "Please provide a transcript or audio file" },
        { status: 400 }
      );
    }

    const analysis = await analyzeTranscript(transcript, {
      title: meeting.title,
      participants: meeting.participants,
      department: meeting.department,
      meetingType: meeting.meeting_type,
    });

    const embeddingText = [
      meeting.title,
      meeting.department,
      analysis.executiveSummary,
      ...analysis.keyDiscussionPoints,
      ...analysis.decisionsMade,
    ].join(" ");

    const embedding = await generateSearchEmbedding(embeddingText);

    const { data: updated, error: updateError } = await supabase
      .from("meetings")
      .update({
        transcript,
        analysis,
        status: "review",
        search_embedding: embedding,
      })
      .eq("id", id)
      .select()
      .single();

    if (updateError) throw new Error(updateError.message);

    return NextResponse.json(updated);
  } catch (err) {
    await supabase
      .from("meetings")
      .update({ status: "draft" })
      .eq("id", id);

    const message = err instanceof Error ? err.message : "Analysis failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
