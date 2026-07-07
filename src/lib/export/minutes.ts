import type { MeetingAnalysis } from "@/types/meeting";

export function formatMeetingMinutes(
  meeting: {
    title: string;
    meeting_date: string;
    participants: string[];
    department: string;
    meeting_type: string;
  },
  analysis: MeetingAnalysis
): string {
  const lines: string[] = [
    `# Meeting Minutes: ${meeting.title}`,
    "",
    `**Date:** ${meeting.meeting_date}`,
    `**Department:** ${meeting.department}`,
    `**Type:** ${meeting.meeting_type}`,
    `**Participants:** ${meeting.participants.join(", ")}`,
    "",
    "## Executive Summary",
    analysis.executiveSummary,
    "",
    "## Key Discussion Points",
    ...analysis.keyDiscussionPoints.map((p) => `- ${p}`),
    "",
    "## Decisions Made",
    ...(analysis.decisionsMade.length
      ? analysis.decisionsMade.map((d) => `- ${d}`)
      : ["- None recorded"]),
    "",
    "## Risks",
    ...(analysis.risks.length
      ? analysis.risks.map((r) => `- ${r}`)
      : ["- None identified"]),
    "",
    "## Open Questions",
    ...(analysis.openQuestions.length
      ? analysis.openQuestions.map((q) => `- ${q}`)
      : ["- None"]),
    "",
    "## Action Items",
    "| Task | Owner | Due Date | Priority |",
    "|------|-------|----------|----------|",
    ...analysis.actionItems.map(
      (a) => `| ${a.task} | ${a.owner} | ${a.dueDate} | ${a.priority} |`
    ),
    "",
    "## Follow-up Recommendations",
    ...analysis.followUpRecommendations.map((r) => `- ${r}`),
  ];

  return lines.join("\n");
}

export function formatAnalysisForCopy(
  meeting: { title: string; meeting_date: string },
  analysis: MeetingAnalysis
): string {
  return formatMeetingMinutes(
    {
      ...meeting,
      participants: [],
      department: "",
      meeting_type: "",
    },
    analysis
  );
}

export async function generatePDF(
  meeting: {
    title: string;
    meeting_date: string;
    participants: string[];
    department: string;
    meeting_type: string;
  },
  analysis: MeetingAnalysis
): Promise<Blob> {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF();
  const margin = 20;
  let y = margin;
  const pageWidth = doc.internal.pageSize.getWidth();
  const maxWidth = pageWidth - margin * 2;

  const addText = (text: string, fontSize = 11, bold = false) => {
    doc.setFontSize(fontSize);
    doc.setFont("helvetica", bold ? "bold" : "normal");
    const lines = doc.splitTextToSize(text, maxWidth);
    for (const line of lines) {
      if (y > doc.internal.pageSize.getHeight() - margin) {
        doc.addPage();
        y = margin;
      }
      doc.text(line, margin, y);
      y += fontSize * 0.5;
    }
    y += 4;
  };

  addText(`Meeting Minutes: ${meeting.title}`, 18, true);
  addText(`Date: ${meeting.meeting_date} | ${meeting.department} | ${meeting.meeting_type}`);
  addText(`Participants: ${meeting.participants.join(", ")}`);

  addText("Executive Summary", 14, true);
  addText(analysis.executiveSummary);

  addText("Key Discussion Points", 14, true);
  analysis.keyDiscussionPoints.forEach((p) => addText(`• ${p}`));

  addText("Decisions Made", 14, true);
  (analysis.decisionsMade.length ? analysis.decisionsMade : ["None recorded"]).forEach((d) =>
    addText(`• ${d}`)
  );

  addText("Action Items", 14, true);
  analysis.actionItems.forEach((a) =>
    addText(`• ${a.task} — ${a.owner} (Due: ${a.dueDate}, ${a.priority})`)
  );

  addText("Follow-up Recommendations", 14, true);
  analysis.followUpRecommendations.forEach((r) => addText(`• ${r}`));

  return doc.output("blob");
}
