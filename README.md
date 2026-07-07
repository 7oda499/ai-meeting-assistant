# AI Meeting Assistant

Transform meeting recordings and transcripts into structured, actionable business outputs — executive summaries, action items, decisions, risks, and follow-up emails.

## Live Demo

> Deploy to Vercel and add your URL here after deployment.

## Features

- **Authentication** — Email/password sign-in via Supabase Auth
- **Meeting Management** — Create meetings with title, date, participants, department, and type
- **Dual Input** — Upload audio recordings (Whisper transcription) or paste transcripts directly
- **AI Analysis** — GPT-4o-mini extracts summaries, decisions, risks, action items with owners/due dates/priority
- **Review & Edit** — Edit all AI-generated fields before saving
- **Export** — Markdown minutes, PDF download, copy to clipboard, follow-up email generation
- **Smart Search** — Semantic search across saved meetings using embeddings
- **Conversational Q&A** — Ask questions about your meeting history

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, React 19, Tailwind CSS 4 |
| Backend | Next.js API Routes |
| Database | Supabase (PostgreSQL + pgvector) |
| Auth | Supabase Auth |
| Storage | Supabase Storage |
| AI | OpenAI (GPT-4o-mini, Whisper, text-embedding-3-small) |
| Deployment | Vercel |

## Quick Start

### Prerequisites

- Node.js 18+
- Supabase account
- OpenAI API key

### 1. Clone & Install

```bash
git clone https://github.com/YOUR_USERNAME/ai-meeting-assistant.git
cd ai-meeting-assistant
npm install
```

### 2. Set Up Supabase

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Run the SQL migration in `supabase/migrations/001_initial_schema.sql` via the SQL Editor
3. Enable Email auth in Authentication → Providers
4. Copy your project URL and anon key

### 3. Configure Environment

```bash
cp .env.example .env.local
```

Fill in your values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
OPENAI_API_KEY=sk-your-openai-api-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 5. Deploy to Vercel

```bash
npx vercel
```

Add the same environment variables in Vercel project settings.

## Project Structure

```
├── docs/                    # Product & architecture documentation
├── src/
│   ├── app/                 # Next.js App Router pages & API routes
│   ├── components/          # React components
│   ├── lib/                 # Supabase, OpenAI, export utilities
│   └── types/               # TypeScript type definitions
├── supabase/
│   └── migrations/          # Database schema
└── public/                  # Static assets
```

## Documentation

- [Product Discovery](docs/PRODUCT.md)
- [Technical Architecture](docs/ARCHITECTURE.md)
- [AI Design](docs/AI_DESIGN.md)
- [Developer Handover](docs/HANDOVER.md)

## Sample Workflow

1. Sign in / create account
2. Click **New Meeting** → fill in details
3. Paste a transcript or upload audio
4. Click **Analyze Meeting** → AI generates structured output
5. Review and edit results
6. **Save Meeting** → export PDF, copy, or generate follow-up email
7. Use **Search** or **Ask AI** to query past meetings

## License

MIT
