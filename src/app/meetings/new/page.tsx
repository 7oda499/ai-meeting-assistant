"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { MEETING_TYPES, DEPARTMENTS, type MeetingType } from "@/types/meeting";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

export default function NewMeetingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [participantInput, setParticipantInput] = useState("");
  const [form, setForm] = useState({
    title: "",
    meetingDate: new Date().toISOString().split("T")[0],
    participants: [] as string[],
    department: "Engineering",
    meetingType: "standup" as MeetingType,
  });

  function addParticipant() {
    const name = participantInput.trim();
    if (name && !form.participants.includes(name)) {
      setForm((f) => ({ ...f, participants: [...f.participants, name] }));
      setParticipantInput("");
    }
  }

  function removeParticipant(name: string) {
    setForm((f) => ({
      ...f,
      participants: f.participants.filter((p) => p !== name),
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/meetings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          meetingDate: form.meetingDate,
          participants: form.participants,
          department: form.department,
          meetingType: form.meetingType,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create meeting");
      }

      const meeting = await res.json();
      router.push(`/meetings/${meeting.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        <h1 className="text-2xl font-bold mb-6">Create New Meeting</h1>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-border p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium mb-1.5">Meeting Title *</label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Q1 Product Planning"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Meeting Date *</label>
              <input
                type="date"
                required
                value={form.meetingDate}
                onChange={(e) => setForm((f) => ({ ...f, meetingDate: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Department *</label>
              <select
                value={form.department}
                onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Meeting Type *</label>
            <select
              value={form.meetingType}
              onChange={(e) => setForm((f) => ({ ...f, meetingType: e.target.value as MeetingType }))}
              className="w-full px-4 py-2.5 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {MEETING_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Participants</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={participantInput}
                onChange={(e) => setParticipantInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addParticipant())}
                className="flex-1 px-4 py-2.5 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Add participant name"
              />
              <button
                type="button"
                onClick={addParticipant}
                className="px-4 py-2.5 border border-border rounded-lg hover:bg-gray-50"
              >
                Add
              </button>
            </div>
            {form.participants.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {form.participants.map((p) => (
                  <span
                    key={p}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm"
                  >
                    {p}
                    <button
                      type="button"
                      onClick={() => removeParticipant(p)}
                      className="hover:text-indigo-900"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm">{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Continue to Upload
          </button>
        </form>
      </div>
    </AppShell>
  );
}
