import type { MeetingAnalysis } from "@/types/meeting";

function extractNames(text: string): string[] {
  const matches = text.match(/\b[A-Z][a-z]+\b/g);
  return [...new Set(matches || [])];
}

function createSummary(transcript: string): string {
  const sentences = transcript
    .split(/[.!?]/)
    .map((s) => s.trim())
    .filter(Boolean);

  return sentences.slice(0, 3).join(". ") + ".";
}

function extractActionItems(
  transcript: string,
  participants: string[]
) {
  const items: MeetingAnalysis["actionItems"] = [];

  const lines = transcript.split(/[.!?]/);

  lines.forEach((line, index) => {
    const lower = line.toLowerCase();

    if (
      lower.includes("will") ||
      lower.includes("prepare") ||
      lower.includes("finish") ||
      lower.includes("complete") ||
      lower.includes("send")
    ) {
      let owner = "Unassigned";

      for (const p of participants) {
        if (line.toLowerCase().includes(p.toLowerCase())) {
          owner = p;
          break;
        }
      }

      items.push({
        id: `action-${index + 1}`,
        task: line.trim(),
        owner,
        dueDate: "",
        priority: "medium",
      });
    }
  });

  return items;
}

export async function analyzeTranscript(
  transcript: string,
  context: {
    title: string;
    participants: string[];
    department: string;
    meetingType: string;
  }
): Promise<MeetingAnalysis> {

  const names =
    context.participants.length
      ? context.participants
      : extractNames(transcript);

  const decisions = [];

  if (transcript.toLowerCase().includes("agreed"))
    decisions.push("The team reached an agreement.");

  if (transcript.toLowerCase().includes("decided"))
    decisions.push("A decision was made during the meeting.");

  const risks = [];

  if (transcript.toLowerCase().includes("delay"))
    risks.push("Possible project delay.");

  if (transcript.toLowerCase().includes("budget"))
    risks.push("Budget should be monitored.");

  return {
    executiveSummary: createSummary(transcript),

    keyDiscussionPoints: transcript
      .split(/[.!?]/)
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 6),

    decisionsMade: decisions,

    risks,

    openQuestions: [],

    actionItems: extractActionItems(
      transcript,
      names
    ),

    followUpRecommendations: [
      "Review action items.",
      "Track deadlines.",
      "Schedule a follow-up meeting if needed."
    ]
  };
}
export async function transcribeAudio(
  audioBuffer: Buffer,
  filename: string
): Promise<string> {
  return `Audio transcription is unavailable in offline mode.

File: ${filename}

Please upload the transcript manually.`;
}

export async function generateFollowUpEmail(
  analysis: MeetingAnalysis,
  context: {
    title: string;
    meetingDate: string;
    participants: string[];
  }
): Promise<string> {

  const actions =
    analysis.actionItems.length > 0
      ? analysis.actionItems
          .map(
            (a) =>
              `- ${a.task} (${a.owner}${
                a.dueDate ? ` - ${a.dueDate}` : ""
              })`
          )
          .join("\n")
      : "- No action items.";

  return `Subject: Follow-up - ${context.title}

Hello everyone,

Thank you for attending today's meeting.

Summary:
${analysis.executiveSummary}

Action Items:
${actions}

Best regards,
AI Meeting Assistant`;
}

export async function answerMeetingQuestion(
  question: string,
  meetings: Array<{
    title: string;
    meeting_date: string;
    analysis: MeetingAnalysis | null;
    transcript: string | null;
  }>
): Promise<string> {

  const q = question.toLowerCase();

  for (const meeting of meetings) {

    if (!meeting.analysis) continue;

    if (q.includes("summary")) {
      return `${meeting.title}

${meeting.analysis.executiveSummary}`;
    }

    if (
      q.includes("action") ||
      q.includes("task")
    ) {
      return meeting.analysis.actionItems.length
        ? meeting.analysis.actionItems
            .map(
              (a) =>
                `${a.task} - ${a.owner}`
            )
            .join("\n")
        : "No action items found.";
    }

    if (
      q.includes("decision")
    ) {
      return meeting.analysis.decisionsMade.join("\n") ||
        "No decisions found.";
    }
  }

  return "I couldn't find relevant information in your meetings.";
}
export async function generateSearchEmbedding(
  text: string
): Promise<number[]> {

  const embedding: number[] = [];

  for (let i = 0; i < 1536; i++) {
    const char = text.charCodeAt(i % Math.max(text.length, 1)) || 0;
    embedding.push((char % 100) / 100);
  }

  return embedding;
}