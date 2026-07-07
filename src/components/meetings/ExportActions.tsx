"use client";

import { useState } from "react";
import type { Meeting, MeetingAnalysis } from "@/types/meeting";
import { formatMeetingMinutes, generatePDF } from "@/lib/export/minutes";
import {
  Download,
  Copy,
  Mail,
  Save,
  Check,
  Loader2,
  FileText,
} from "lucide-react";

interface ExportActionsProps {
  meeting: Meeting;
  analysis: MeetingAnalysis;
  onSave: () => Promise<void>;
  saving: boolean;
}

export function ExportActions({ meeting, analysis, onSave, saving }: ExportActionsProps) {
  const [copied, setCopied] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [followUpEmail, setFollowUpEmail] = useState(meeting.follow_up_email || "");
  const [showEmail, setShowEmail] = useState(false);

  async function handleCopy() {
    const text = formatMeetingMinutes(meeting, analysis);
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleDownloadMarkdown() {
    const text = formatMeetingMinutes(meeting, analysis);
    const blob = new Blob([text], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${meeting.title.replace(/\s+/g, "-")}-minutes.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleDownloadPDF() {
    const blob = await generatePDF(meeting, analysis);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${meeting.title.replace(/\s+/g, "-")}-minutes.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleGenerateEmail() {
    setEmailLoading(true);
    try {
      const res = await fetch(`/api/meetings/${meeting.id}/follow-up`, { method: "POST" });
      const data = await res.json();
      if (data.email) {
        setFollowUpEmail(data.email);
        setShowEmail(true);
      }
    } finally {
      setEmailLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <button
          onClick={onSave}
          disabled={saving}
          className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm font-medium"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Meeting
        </button>

        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-gray-50 text-sm"
        >
          {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
          {copied ? "Copied!" : "Copy Results"}
        </button>

        <button
          onClick={handleDownloadMarkdown}
          className="inline-flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-gray-50 text-sm"
        >
          <FileText className="w-4 h-4" />
          Export Markdown
        </button>

        <button
          onClick={handleDownloadPDF}
          className="inline-flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-gray-50 text-sm"
        >
          <Download className="w-4 h-4" />
          Download PDF
        </button>

        <button
          onClick={handleGenerateEmail}
          disabled={emailLoading}
          className="inline-flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-gray-50 text-sm"
        >
          {emailLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Mail className="w-4 h-4" />
          )}
          Generate Follow-up Email
        </button>
      </div>

      {showEmail && followUpEmail && (
        <div className="bg-white rounded-xl border border-border p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium">Follow-up Email</h3>
            <button
              onClick={() => navigator.clipboard.writeText(followUpEmail)}
              className="text-sm text-indigo-600 hover:underline"
            >
              Copy email
            </button>
          </div>
          <pre className="whitespace-pre-wrap text-sm text-muted font-sans">{followUpEmail}</pre>
        </div>
      )}
    </div>
  );
}
