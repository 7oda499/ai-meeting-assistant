"use client";

import { useState } from "react";
import type { MeetingAnalysis, ActionItem, ActionPriority } from "@/types/meeting";
import { createActionItem } from "@/types/meeting";
import { Plus, Trash2 } from "lucide-react";

interface AnalysisEditorProps {
  analysis: MeetingAnalysis;
  onChange: (analysis: MeetingAnalysis) => void;
  readOnly?: boolean;
}

function StringListEditor({
  label,
  items,
  onChange,
  readOnly,
}: {
  label: string;
  items: string[];
  onChange: (items: string[]) => void;
  readOnly?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-2">{label}</label>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex gap-2">
            <input
              type="text"
              value={item}
              readOnly={readOnly}
              onChange={(e) => {
                const updated = [...items];
                updated[i] = e.target.value;
                onChange(updated);
              }}
              className="flex-1 px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {!readOnly && (
              <button
                type="button"
                onClick={() => onChange(items.filter((_, idx) => idx !== i))}
                className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
        {!readOnly && (
          <button
            type="button"
            onClick={() => onChange([...items, ""])}
            className="text-sm text-indigo-600 hover:underline flex items-center gap-1"
          >
            <Plus className="w-3 h-3" /> Add item
          </button>
        )}
      </div>
    </div>
  );
}

export function AnalysisEditor({ analysis, onChange, readOnly = false }: AnalysisEditorProps) {
  const update = (partial: Partial<MeetingAnalysis>) =>
    onChange({ ...analysis, ...partial });

  const updateActionItem = (index: number, partial: Partial<ActionItem>) => {
    const items = [...analysis.actionItems];
    items[index] = { ...items[index], ...partial };
    update({ actionItems: items });
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-2">Executive Summary</label>
        <textarea
          value={analysis.executiveSummary}
          readOnly={readOnly}
          onChange={(e) => update({ executiveSummary: e.target.value })}
          rows={4}
          className="w-full px-4 py-3 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <StringListEditor
        label="Key Discussion Points"
        items={analysis.keyDiscussionPoints}
        onChange={(items) => update({ keyDiscussionPoints: items })}
        readOnly={readOnly}
      />

      <StringListEditor
        label="Decisions Made"
        items={analysis.decisionsMade}
        onChange={(items) => update({ decisionsMade: items })}
        readOnly={readOnly}
      />

      <StringListEditor
        label="Risks"
        items={analysis.risks}
        onChange={(items) => update({ risks: items })}
        readOnly={readOnly}
      />

      <StringListEditor
        label="Open Questions"
        items={analysis.openQuestions}
        onChange={(items) => update({ openQuestions: items })}
        readOnly={readOnly}
      />

      <div>
        <label className="block text-sm font-medium mb-2">Action Items</label>
        <div className="space-y-3">
          {analysis.actionItems.map((item, i) => (
            <div key={item.id} className="grid sm:grid-cols-12 gap-2 p-3 bg-gray-50 rounded-lg">
              <input
                type="text"
                value={item.task}
                readOnly={readOnly}
                onChange={(e) => updateActionItem(i, { task: e.target.value })}
                placeholder="Task"
                className="sm:col-span-4 px-3 py-2 rounded-lg border border-border text-sm"
              />
              <input
                type="text"
                value={item.owner}
                readOnly={readOnly}
                onChange={(e) => updateActionItem(i, { owner: e.target.value })}
                placeholder="Owner"
                className="sm:col-span-2 px-3 py-2 rounded-lg border border-border text-sm"
              />
              <input
                type="date"
                value={item.dueDate}
                readOnly={readOnly}
                onChange={(e) => updateActionItem(i, { dueDate: e.target.value })}
                className="sm:col-span-2 px-3 py-2 rounded-lg border border-border text-sm"
              />
              <select
                value={item.priority}
                disabled={readOnly}
                onChange={(e) => updateActionItem(i, { priority: e.target.value as ActionPriority })}
                className="sm:col-span-2 px-3 py-2 rounded-lg border border-border text-sm"
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
              {!readOnly && (
                <button
                  type="button"
                  onClick={() =>
                    update({ actionItems: analysis.actionItems.filter((_, idx) => idx !== i) })
                  }
                  className="sm:col-span-1 p-2 text-red-500 hover:bg-red-50 rounded-lg justify-self-end"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
          {!readOnly && (
            <button
              type="button"
              onClick={() =>
                update({ actionItems: [...analysis.actionItems, createActionItem()] })
              }
              className="text-sm text-indigo-600 hover:underline flex items-center gap-1"
            >
              <Plus className="w-3 h-3" /> Add action item
            </button>
          )}
        </div>
      </div>

      <StringListEditor
        label="Follow-up Recommendations"
        items={analysis.followUpRecommendations}
        onChange={(items) => update({ followUpRecommendations: items })}
        readOnly={readOnly}
      />
    </div>
  );
}
