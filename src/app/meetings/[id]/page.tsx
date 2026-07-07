"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { UploadSection } from "@/components/meetings/UploadSection";
import { AnalysisEditor } from "@/components/meetings/AnalysisEditor";
import { ExportActions } from "@/components/meetings/ExportActions";
import type { Meeting, MeetingAnalysis } from "@/types/meeting";
import { createEmptyAnalysis } from "@/types/meeting";
import { ArrowLeft, Calendar, Users, Building2, Loader2 } from "lucide-react";

export default function MeetingDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [analysis, setAnalysis] = useState<MeetingAnalysis>(createEmptyAnalysis());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchMeeting = useCallback(async () => {
    try {
      const res = await fetch(`/api/meetings/${id}`);
      if (!res.ok) throw new Error("Meeting not found");
      const data: Meeting = await res.json();
      setMeeting(data);
      if (data.analysis) setAnalysis(data.analysis);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load meeting");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchMeeting();
  }, [fetchMeeting]);

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch(`/api/meetings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ analysis, status: "saved" }),
      });
      if (!res.ok) throw new Error("Failed to save");
      const updated = await res.json();
      setMeeting(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      </AppShell>
    );
  }

  if (error || !meeting) {
    return (
      <AppShell>
        <div className="text-center py-20">
          <p className="text-red-600 mb-4">{error || "Meeting not found"}</p>
          <Link href="/dashboard" className="text-indigo-600 hover:underline">
            Back to Dashboard
          </Link>
        </div>
      </AppShell>
    );
  }

  const showUpload = meeting.status === "draft" || meeting.status === "processing";
  const showAnalysis = meeting.status === "review" || meeting.status === "saved";

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold">{meeting.title}</h1>
            <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 capitalize">
              {meeting.status}
            </span>
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-muted">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              {meeting.meeting_date}
            </span>
            <span className="flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5" />
              {meeting.department} · {meeting.meeting_type}
            </span>
            {meeting.participants.length > 0 && (
              <span className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                {meeting.participants.join(", ")}
              </span>
            )}
          </div>
        </div>

        {meeting.status === "processing" && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6 flex items-center gap-3">
            <Loader2 className="w-5 h-5 animate-spin text-yellow-600" />
            <p className="text-yellow-800">AI is analyzing your meeting...</p>
          </div>
        )}

        {showUpload && (
          <UploadSection
            meetingId={id}
            onAnalysisComplete={fetchMeeting}
            existingTranscript={meeting.transcript}
          />
        )}

        {showAnalysis && (
          <div className="space-y-6 mt-6">
            <div className="bg-white rounded-xl border border-border p-6">
              <h2 className="text-lg font-semibold mb-4">Review & Edit Results</h2>
              <AnalysisEditor
                analysis={analysis}
                onChange={setAnalysis}
                readOnly={false}
              />
            </div>

            <ExportActions
              meeting={meeting}
              analysis={analysis}
              onSave={handleSave}
              saving={saving}
            />
          </div>
        )}
      </div>
    </AppShell>
  );
}
