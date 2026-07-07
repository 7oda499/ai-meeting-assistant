import Link from "next/link";
import type { Meeting } from "@/types/meeting";
import { Calendar, Users, Building2, ChevronRight } from "lucide-react";

const STATUS_STYLES: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700",
  processing: "bg-yellow-100 text-yellow-800",
  review: "bg-blue-100 text-blue-800",
  saved: "bg-green-100 text-green-800",
};

interface MeetingCardProps {
  meeting: Meeting;
}

export function MeetingCard({ meeting }: MeetingCardProps) {
  const actionCount = meeting.analysis?.actionItems?.length || 0;

  return (
    <Link
      href={`/meetings/${meeting.id}`}
      className="block bg-white rounded-xl border border-border p-5 hover:border-indigo-300 hover:shadow-sm transition-all group"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="font-semibold text-lg truncate">{meeting.title}</h3>
            <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${STATUS_STYLES[meeting.status]}`}>
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
              {meeting.department}
            </span>
            {meeting.participants.length > 0 && (
              <span className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                {meeting.participants.length} participants
              </span>
            )}
            {actionCount > 0 && (
              <span className="text-indigo-600">{actionCount} action items</span>
            )}
          </div>

          {meeting.analysis?.executiveSummary && (
            <p className="mt-3 text-sm text-muted line-clamp-2">
              {meeting.analysis.executiveSummary}
            </p>
          )}
        </div>

        <ChevronRight className="w-5 h-5 text-muted group-hover:text-indigo-600 shrink-0 mt-1" />
      </div>
    </Link>
  );
}
