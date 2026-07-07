export type MeetingType =
  | "standup"
  | "planning"
  | "review"
  | "decision"
  | "brainstorm"
  | "client"
  | "other";

export type MeetingStatus = "draft" | "processing" | "review" | "saved";

export type ActionPriority = "high" | "medium" | "low";

export interface ActionItem {
  id: string;
  task: string;
  owner: string;
  dueDate: string;
  priority: ActionPriority;
}

export interface MeetingAnalysis {
  executiveSummary: string;
  keyDiscussionPoints: string[];
  decisionsMade: string[];
  risks: string[];
  openQuestions: string[];
  actionItems: ActionItem[];
  followUpRecommendations: string[];
}

export interface Meeting {
  id: string;
  user_id: string;
  title: string;
  meeting_date: string;
  participants: string[];
  department: string;
  meeting_type: MeetingType;
  status: MeetingStatus;
  transcript: string | null;
  audio_url: string | null;
  analysis: MeetingAnalysis | null;
  follow_up_email: string | null;
  created_at: string;
  updated_at: string;
}

export interface MeetingFormData {
  title: string;
  meetingDate: string;
  participants: string[];
  department: string;
  meetingType: MeetingType;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export const MEETING_TYPES: { value: MeetingType; label: string }[] = [
  { value: "standup", label: "Standup" },
  { value: "planning", label: "Planning" },
  { value: "review", label: "Review" },
  { value: "decision", label: "Decision" },
  { value: "brainstorm", label: "Brainstorm" },
  { value: "client", label: "Client Meeting" },
  { value: "other", label: "Other" },
];

export const DEPARTMENTS = [
  "Engineering",
  "Product",
  "Design",
  "Marketing",
  "Sales",
  "Operations",
  "Finance",
  "HR",
  "Executive",
  "Other",
];

export function createEmptyAnalysis(): MeetingAnalysis {
  return {
    executiveSummary: "",
    keyDiscussionPoints: [],
    decisionsMade: [],
    risks: [],
    openQuestions: [],
    actionItems: [],
    followUpRecommendations: [],
  };
}

export function createActionItem(partial?: Partial<ActionItem>): ActionItem {
  return {
    id: crypto.randomUUID(),
    task: "",
    owner: "",
    dueDate: "",
    priority: "medium",
    ...partial,
  };
}
