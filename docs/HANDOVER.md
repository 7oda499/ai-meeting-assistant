# Developer Handover Document

## Product Overview

AI Meeting Assistant is a web application that transforms meeting recordings and transcripts into structured business outputs. Users upload content, AI extracts summaries/decisions/action items, users review and edit, then save and export.

**Core Value:** Automate 30-45 minutes of manual meeting documentation per meeting.

## Architecture Overview

See [ARCHITECTURE.md](./ARCHITECTURE.md) for the full architecture diagram and data flows.

**Stack:** Next.js 15 + Supabase + OpenAI, deployed on Vercel.

## Folder Structure

```
ai-meeting-assistant/
├── docs/                           # Documentation
│   ├── PRODUCT.md                  # Product discovery
│   ├── REQUIREMENTS.md             # Functional/non-functional requirements
│   ├── ARCHITECTURE.md             # System architecture
│   ├── AI_DESIGN.md                # AI workflow and decisions
│   └── HANDOVER.md                 # This document
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── chat/route.ts       # Q&A endpoint
│   │   │   ├── search/route.ts     # Search endpoint
│   │   │   └── meetings/
│   │   │       ├── route.ts        # List/create meetings
│   │   │       └── [id]/
│   │   │           ├── route.ts    # Get/update/delete meeting
│   │   │           ├── analyze/route.ts   # Upload + AI analysis
│   │   │           └── follow-up/route.ts # Email generation
│   │   ├── auth/callback/route.ts  # OAuth callback
│   │   ├── chat/page.tsx           # Q&A UI
│   │   ├── dashboard/page.tsx      # Meeting list
│   │   ├── login/page.tsx          # Auth page
│   │   ├── meetings/
│   │   │   ├── new/page.tsx        # Create meeting form
│   │   │   └── [id]/page.tsx       # Meeting detail + review
│   │   ├── search/page.tsx         # Search UI
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx                # Root redirect
│   ├── components/
│   │   ├── layout/AppShell.tsx     # App header/nav
│   │   └── meetings/
│   │       ├── AnalysisEditor.tsx  # Editable analysis fields
│   │       ├── ExportActions.tsx   # Export buttons
│   │       ├── MeetingCard.tsx     # Dashboard card
│   │       └── UploadSection.tsx   # Upload UI
│   ├── lib/
│   │   ├── export/minutes.ts       # PDF/markdown generation
│   │   ├── openai/
│   │   │   ├── analysis.ts         # AI functions
│   │   │   └── client.ts           # OpenAI client
│   │   └── supabase/
│   │       ├── client.ts           # Browser client
│   │       ├── middleware.ts       # Session refresh
│   │       └── server.ts           # Server client
│   ├── middleware.ts               # Next.js middleware
│   └── types/meeting.ts            # TypeScript types
├── supabase/migrations/
│   └── 001_initial_schema.sql      # Database schema
├── .env.example
├── package.json
└── README.md
```

## API Documentation

### Authentication
All endpoints require authenticated session (Supabase cookie). Returns 401 if unauthenticated.

### Meetings

#### `GET /api/meetings`
List all meetings for authenticated user.

**Response:** `Meeting[]`

#### `POST /api/meetings`
Create a new meeting.

**Body:**
```json
{
  "title": "Q1 Planning",
  "meetingDate": "2026-03-15",
  "participants": ["Alice", "Bob"],
  "department": "Engineering",
  "meetingType": "planning"
}
```

**Response:** `Meeting` (201)

#### `GET /api/meetings/[id]`
Get single meeting.

**Response:** `Meeting`

#### `PATCH /api/meetings/[id]`
Update meeting fields.

**Body:** Partial meeting object (e.g., `{ "analysis": {...}, "status": "saved" }`)

**Response:** `Meeting`

#### `DELETE /api/meetings/[id]`
Delete meeting.

**Response:** `{ "success": true }`

#### `POST /api/meetings/[id]/analyze`
Upload content and run AI analysis.

**Body:** `FormData` with either:
- `transcript` (string) — pasted transcript text
- `audio` (File) — audio recording

**Response:** Updated `Meeting` with analysis

#### `POST /api/meetings/[id]/follow-up`
Generate follow-up email from saved analysis.

**Response:** `{ "email": "..." }`

### Search

#### `GET /api/search?q=query&mode=semantic|text`
Search saved meetings.

**Response:** Array of `{ id, title, meeting_date, department, similarity? }`

### Chat

#### `POST /api/chat`
Ask a question about saved meetings.

**Body:** `{ "question": "What action items were assigned to Alice?" }`

**Response:** `{ "answer": "..." }`

## Database Design

### `meetings` Table

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | FK to auth.users |
| title | TEXT | Meeting title |
| meeting_date | DATE | Meeting date |
| participants | TEXT[] | Array of participant names |
| department | TEXT | Department name |
| meeting_type | TEXT | standup/planning/review/etc. |
| status | TEXT | draft/processing/review/saved |
| transcript | TEXT | Full transcript text |
| audio_url | TEXT | Storage URL for audio file |
| analysis | JSONB | Structured AI analysis |
| follow_up_email | TEXT | Generated follow-up email |
| search_embedding | vector(1536) | Semantic search embedding |
| created_at | TIMESTAMPTZ | Creation timestamp |
| updated_at | TIMESTAMPTZ | Last update timestamp |

### Analysis JSON Schema

```json
{
  "executiveSummary": "string",
  "keyDiscussionPoints": ["string"],
  "decisionsMade": ["string"],
  "risks": ["string"],
  "openQuestions": ["string"],
  "actionItems": [{
    "id": "string",
    "task": "string",
    "owner": "string",
    "dueDate": "YYYY-MM-DD",
    "priority": "high|medium|low"
  }],
  "followUpRecommendations": ["string"]
}
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | No | Service role key (admin ops) |
| `OPENAI_API_KEY` | Yes | OpenAI API key |
| `NEXT_PUBLIC_APP_URL` | Yes | App URL for auth redirects |

## AI Flow

1. **Input:** User uploads audio or transcript via `/api/meetings/[id]/analyze`
2. **Transcription:** If audio, Whisper-1 converts to text
3. **Analysis:** GPT-4o-mini with JSON mode extracts structured data
4. **Embedding:** text-embedding-3-small generates search vector
5. **Storage:** Analysis + embedding saved to database
6. **Review:** User edits in AnalysisEditor component
7. **Save:** PATCH updates meeting with status "saved"
8. **Search:** Query embedding compared via pgvector cosine similarity
9. **Q&A:** Last 20 meetings loaded as context for GPT-4o-mini

## Deployment Instructions

### Supabase Setup
1. Create project at supabase.com
2. Run `supabase/migrations/001_initial_schema.sql` in SQL Editor
3. Enable Email provider in Auth settings
4. Note URL and keys

### Vercel Deployment
1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Local Development
```bash
npm install
cp .env.example .env.local
# Fill in env vars
npm run dev
```

## Known Limitations

1. **English only** — Whisper and prompts optimized for English
2. **Single user** — No team sharing or collaboration
3. **No real-time** — Post-meeting processing only
4. **Audio size** — Limited by Vercel serverless payload (25MB configured)
5. **Q&A context** — Limited to last 20 saved meetings
6. **No offline** — Requires internet for AI processing
7. **Email auth only** — No SSO or social login in MVP
8. **Vector search** — Requires pgvector extension; falls back to text search

## Future Improvements

1. **Team workspaces** — Shared meetings with role-based access
2. **Calendar integration** — Auto-create meetings from calendar events
3. **Real-time transcription** — Live meeting capture
4. **Action item tracking** — Status updates and reminders
5. **Custom templates** — Per meeting type extraction rules
6. **Multi-language** — Support for non-English meetings
7. **Slack/Teams bot** — Post summaries to channels
8. **Analytics dashboard** — Meeting trends, action completion rates
9. **Chunk-level RAG** — Better search for long transcripts
10. **Streaming analysis** — Progressive results display

## Getting Help

- **Supabase docs:** https://supabase.com/docs
- **OpenAI docs:** https://platform.openai.com/docs
- **Next.js docs:** https://nextjs.org/docs
- **Project README:** ../README.md
