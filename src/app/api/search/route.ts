import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateSearchEmbedding } from "@/lib/openai/analysis";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const query = request.nextUrl.searchParams.get("q")?.trim();
  if (!query) return NextResponse.json([]);

  const mode = request.nextUrl.searchParams.get("mode") || "text";

  if (mode === "semantic") {
    try {
      const embedding = await generateSearchEmbedding(query);

      const { data, error } = await supabase.rpc("search_meetings", {
        query_embedding: embedding,
        match_user_id: user.id,
        match_count: 10,
      });

      if (error) throw error;
      return NextResponse.json(data);
    } catch {
      // Fall through to text search if vector search unavailable
    }
  }

  const { data, error } = await supabase.rpc("text_search_meetings", {
    search_query: query,
    match_user_id: user.id,
  });

  if (error) {
    const { data: fallback } = await supabase
      .from("meetings")
      .select("id, title, meeting_date, department, status, analysis")
      .eq("user_id", user.id)
      .eq("status", "saved")
      .or(`title.ilike.%${query}%,department.ilike.%${query}%`)
      .order("meeting_date", { ascending: false });

    return NextResponse.json(fallback || []);
  }

  return NextResponse.json(data);
}
