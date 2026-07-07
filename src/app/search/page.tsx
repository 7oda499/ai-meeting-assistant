"use client";

import { useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { Search, ArrowLeft, Loader2 } from "lucide-react";

interface SearchResult {
  id: string;
  title: string;
  meeting_date: string;
  department: string;
  similarity?: number;
}

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setSearched(true);

    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&mode=semantic`);
      const data = await res.json();
      setResults(data);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        <h1 className="text-2xl font-bold mb-6">Search Meetings</h1>

        <form onSubmit={handleSearch} className="flex gap-3 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by topic, decision, participant..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Search
          </button>
        </form>

        {searched && results.length === 0 && !loading && (
          <p className="text-center text-muted py-8">No meetings found matching your query.</p>
        )}

        <div className="space-y-3">
          {results.map((result) => (
            <Link
              key={result.id}
              href={`/meetings/${result.id}`}
              className="block bg-white rounded-xl border border-border p-4 hover:border-indigo-300 transition-colors"
            >
              <h3 className="font-semibold">{result.title}</h3>
              <p className="text-sm text-muted mt-1">
                {result.meeting_date} · {result.department}
                {result.similarity !== undefined && (
                  <span className="ml-2 text-indigo-600">
                    {Math.round(result.similarity * 100)}% match
                  </span>
                )}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
