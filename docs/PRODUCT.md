# Product Discovery

## Problem Statement

Teams spend hundreds of hours every month on meeting documentation — taking notes, extracting action items, assigning owners, and following up on commitments. This manual work is:

- **Time-consuming** — Average knowledge worker spends 31 hours/month in meetings
- **Error-prone** — Action items get lost, owners aren't assigned, deadlines are missed
- **Inconsistent** — Meeting notes vary wildly in quality and format across teams
- **Not searchable** — Past decisions buried in unstructured documents

## User Personas

### 1. Sarah — Engineering Manager
- Runs 15+ meetings/week (standups, planning, reviews)
- Needs quick action item extraction with clear owners
- Wants to search past decisions without digging through docs

### 2. James — Product Manager
- Facilitates cross-functional decision meetings
- Needs executive summaries for stakeholder updates
- Wants follow-up emails generated automatically

### 3. Maria — Operations Lead
- Tracks commitments across departments
- Needs risk identification and open question tracking
- Wants searchable meeting history for compliance

## Business Value

| Metric | Impact |
|--------|--------|
| Time saved per meeting | 30-45 minutes of manual note-taking |
| Action item capture rate | 95%+ vs ~60% manual |
| Follow-up speed | Same-day vs 2-3 day delay |
| Decision traceability | Searchable archive vs scattered notes |

**ROI Estimate:** For a 50-person team averaging 10 meetings/week, saving 30 min/meeting = **250 hours/month** recovered.

## Assumptions

1. Users have meeting transcripts or can record meetings
2. English-language meetings (MVP scope)
3. Users review AI output before sharing (human-in-the-loop)
4. OpenAI API is available and cost-effective at team scale
5. Single-tenant per user (no team sharing in MVP)

## User Journey

```
Sign In → Create Meeting → Upload Content → AI Analysis → Review & Edit → Save → Export/Search/Q&A
```

### Detailed Journey

1. **Sign In** — User authenticates with email/password
2. **Create Meeting** — Enters title, date, participants, department, type
3. **Upload** — Pastes transcript OR uploads audio recording
4. **AI Analysis** — System transcribes (if audio) and extracts structured output
5. **Review** — User edits summary, action items, owners, due dates, priorities
6. **Save** — Meeting stored with searchable embeddings
7. **Export** — Download PDF, copy markdown, generate follow-up email
8. **Search/Q&A** — Find past meetings or ask conversational questions
