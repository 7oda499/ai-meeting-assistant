# Product Documentation

## Functional Requirements

| ID | Requirement | Status |
|----|------------|--------|
| FR-01 | User authentication (sign in/sign up) | ✅ MVP |
| FR-02 | Create meeting with metadata | ✅ MVP |
| FR-03 | Upload audio recording | ✅ MVP |
| FR-04 | Upload/paste transcript | ✅ MVP |
| FR-05 | AI analysis with structured output | ✅ MVP |
| FR-06 | Review and edit results | ✅ MVP |
| FR-07 | Save meeting | ✅ MVP |
| FR-08 | Export meeting minutes (markdown) | ✅ MVP |
| FR-09 | Download PDF | ✅ MVP |
| FR-10 | Generate follow-up email | ✅ MVP |
| FR-11 | Copy results to clipboard | ✅ MVP |
| FR-12 | Search previous meetings | ✅ MVP |
| FR-13 | Conversational Q&A | ✅ MVP |

## Non-Functional Requirements

| ID | Requirement | Target |
|----|------------|--------|
| NFR-01 | Analysis latency | < 30s for typical transcript |
| NFR-02 | Page load time | < 2s |
| NFR-03 | Mobile responsive | Yes |
| NFR-04 | Data isolation | Row-level security per user |
| NFR-05 | API cost per meeting | < $0.10 |

## User Stories

### US-01: Create Meeting
**As a** meeting facilitator, **I want to** create a meeting with title, date, participants, and type **so that** the AI has context for analysis.

**Acceptance Criteria:**
- Form validates required fields
- Participants can be added/removed dynamically
- Meeting is saved as draft status

### US-02: Upload & Analyze
**As a** user, **I want to** upload audio or paste a transcript **so that** AI can extract structured meeting output.

**Acceptance Criteria:**
- Audio files transcribed via Whisper
- Transcripts analyzed within 30 seconds
- All output fields populated (summary, decisions, actions, risks, etc.)

### US-03: Review & Edit
**As a** user, **I want to** edit AI-generated results **so that** I can correct errors before sharing.

**Acceptance Criteria:**
- All fields editable inline
- Action items support add/remove/edit
- Changes persist on save

### US-04: Export
**As a** user, **I want to** export meeting minutes **so that** I can share with stakeholders.

**Acceptance Criteria:**
- PDF download works
- Markdown export works
- Copy to clipboard works
- Follow-up email generated on demand

### US-05: Search & Q&A
**As a** user, **I want to** search and ask questions about past meetings **so that** I can find decisions and action items quickly.

**Acceptance Criteria:**
- Text and semantic search return relevant results
- Q&A answers based on saved meeting data only
- Q&A cites source meetings

## MVP Scope

**In Scope:**
- Single-user auth and meeting management
- Audio + transcript input
- Full AI analysis pipeline
- Edit, save, export workflow
- Search and Q&A

**Out of Scope (Future):**
- Team collaboration / shared meetings
- Calendar integration
- Real-time meeting recording
- Slack/Teams notifications
- Multi-language support
- Custom AI prompt templates

## Future Roadmap

### Phase 2 — Collaboration
- Team workspaces with shared meetings
- Role-based access (viewer, editor, admin)
- Comments and @mentions on action items

### Phase 3 — Integrations
- Google Calendar / Outlook sync
- Slack bot for meeting summaries
- Jira/Linear action item sync
- Zoom/Teams recording import

### Phase 4 — Intelligence
- Meeting trend analytics
- Action item completion tracking
- Recurring meeting comparison
- Custom extraction templates per meeting type

### Phase 5 — Enterprise
- SSO (SAML/OIDC)
- Audit logs
- Data retention policies
- On-premise deployment option
