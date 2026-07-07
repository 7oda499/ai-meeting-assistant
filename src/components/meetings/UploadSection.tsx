"use client";

import { useState } from "react";
import { Upload, FileText, Loader2, Sparkles } from "lucide-react";

interface UploadSectionProps {
  meetingId: string;
  onAnalysisComplete: () => void;
  existingTranscript?: string | null;
}

export function UploadSection({ meetingId, onAnalysisComplete, existingTranscript }: UploadSectionProps) {
  const [mode, setMode] = useState<"transcript" | "audio">("transcript");
  const [transcript, setTranscript] = useState(existingTranscript || "");
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleAnalyze() {
    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      if (mode === "transcript") {
        if (!transcript.trim()) throw new Error("Please enter a transcript");
        formData.append("transcript", transcript);
      } else {
        if (!audioFile) throw new Error("Please select an audio file");
        formData.append("audio", audioFile);
      }

      const res = await fetch(`/api/meetings/${meetingId}/analyze`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Analysis failed");
      }

      onAnalysisComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-xl border border-border p-6">
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Upload className="w-5 h-5 text-indigo-600" />
        Upload Meeting Content
      </h2>

      <div className="flex gap-2 mb-4">
        <button
          type="button"
          onClick={() => setMode("transcript")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            mode === "transcript"
              ? "bg-indigo-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          <FileText className="w-4 h-4" />
          Transcript
        </button>
        <button
          type="button"
          onClick={() => setMode("audio")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            mode === "audio"
              ? "bg-indigo-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          <Upload className="w-4 h-4" />
          Audio Recording
        </button>
      </div>

      {mode === "transcript" ? (
        <textarea
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          rows={12}
          className="w-full px-4 py-3 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm"
          placeholder="Paste your meeting transcript here..."
        />
      ) : (
        <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
          <input
            type="file"
            accept="audio/*,.mp3,.wav,.m4a,.webm,.ogg"
            onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
            className="hidden"
            id="audio-upload"
          />
          <label htmlFor="audio-upload" className="cursor-pointer">
            <Upload className="w-10 h-10 text-muted mx-auto mb-3" />
            <p className="font-medium">
              {audioFile ? audioFile.name : "Click to upload audio file"}
            </p>
            <p className="text-sm text-muted mt-1">MP3, WAV, M4A, WebM supported</p>
          </label>
        </div>
      )}

      {error && (
        <div className="mt-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm">{error}</div>
      )}

      <button
        onClick={handleAnalyze}
        disabled={loading}
        className="mt-4 w-full py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Analyzing with AI...
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            Analyze Meeting
          </>
        )}
      </button>
    </div>
  );
}
