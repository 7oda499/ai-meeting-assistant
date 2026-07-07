-- AI Meeting Assistant Database Schema
-- Run this in Supabase SQL Editor

-- Enable pgvector for semantic search
CREATE EXTENSION IF NOT EXISTS vector;

-- Meetings table
CREATE TABLE IF NOT EXISTS meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  meeting_date DATE NOT NULL,
  participants TEXT[] DEFAULT '{}',
  department TEXT NOT NULL DEFAULT '',
  meeting_type TEXT NOT NULL DEFAULT 'other',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'processing', 'review', 'saved')),
  transcript TEXT,
  audio_url TEXT,
  analysis JSONB,
  follow_up_email TEXT,
  search_embedding vector(1536),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_meetings_user_id ON meetings(user_id);
CREATE INDEX IF NOT EXISTS idx_meetings_status ON meetings(status);
CREATE INDEX IF NOT EXISTS idx_meetings_meeting_date ON meetings(meeting_date DESC);
CREATE INDEX IF NOT EXISTS idx_meetings_title ON meetings USING gin(to_tsvector('english', title));

-- Vector similarity search index
CREATE INDEX IF NOT EXISTS idx_meetings_embedding ON meetings
  USING ivfflat (search_embedding vector_cosine_ops) WITH (lists = 100);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS meetings_updated_at ON meetings;
CREATE TRIGGER meetings_updated_at
  BEFORE UPDATE ON meetings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Row Level Security
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own meetings"
  ON meetings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own meetings"
  ON meetings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own meetings"
  ON meetings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own meetings"
  ON meetings FOR DELETE
  USING (auth.uid() = user_id);

-- Storage bucket for audio files
INSERT INTO storage.buckets (id, name, public)
VALUES ('meeting-audio', 'meeting-audio', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users can upload own audio"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'meeting-audio'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view own audio"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'meeting-audio'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete own audio"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'meeting-audio'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Semantic search function
CREATE OR REPLACE FUNCTION search_meetings(
  query_embedding vector(1536),
  match_user_id UUID,
  match_count INT DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  meeting_date DATE,
  department TEXT,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    m.id,
    m.title,
    m.meeting_date,
    m.department,
    1 - (m.search_embedding <=> query_embedding) AS similarity
  FROM meetings m
  WHERE m.user_id = match_user_id
    AND m.search_embedding IS NOT NULL
    AND m.status = 'saved'
  ORDER BY m.search_embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Text search function
CREATE OR REPLACE FUNCTION text_search_meetings(
  search_query TEXT,
  match_user_id UUID
)
RETURNS SETOF meetings
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM meetings m
  WHERE m.user_id = match_user_id
    AND m.status = 'saved'
    AND (
      m.title ILIKE '%' || search_query || '%'
      OR m.transcript ILIKE '%' || search_query || '%'
      OR m.department ILIKE '%' || search_query || '%'
    )
  ORDER BY m.meeting_date DESC;
END;
$$;
