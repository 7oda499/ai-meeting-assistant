# AI Design

## AI Workflow

```
Input (Audio/Transcript)
    ↓
[Audio?] → Whisper-1 Transcription
    ↓
Transcript + Meeting Context
    ↓
GPT-4o-mini Structured Analysis (JSON mode)
    ↓
Human Review & Edit
    ↓
Save → Generate Embedding → Store
    ↓
Available for Search & Q&A
```

## Model Selection

| Task | Model | Rationale |
|------|-------|-----------|
| Transcription | whisper-1 | Industry standard, supports multiple formats |
| Analysis | gpt-4o-mini | Cost-effective, strong JSON output, sufficient for extraction |
| Embeddings | text-embedding-3-small | 1536 dims, fast, cheap, good semantic search |
| Q&A | gpt-4o-mini | Sufficient for context-grounded answers |
| Follow-up Email | gpt-4o-mini | Creative but controlled output |

**Cost Estimate per Meeting:**
- Whisper: ~$0.006/min of audio
- Analysis: ~$0.01-0.03 per transcript
- Embedding: ~$0.0001
- Q&A: ~$0.005 per question
- **Total: ~$0.02-0.10 per meeting**

## Prompt Engineering Strategy

### Analysis Prompt
- **System role:** Expert meeting analyst with strict extraction rules
- **JSON mode:** Enforced structured output via `response_format: { type: "json_object" }`
- **Context injection:** Meeting title, department, type, participants prepended
- **Temperature:** 0.2 (low creativity, high consistency)
- **Guardrails in prompt:**
  - "Extract ONLY information explicitly stated"
  - "Never invent facts"
  - "Use empty arrays if not mentioned"
  - "Assign owners from participant names or 'Unassigned'"

### Q&A Prompt
- **Grounding:** Only answer from provided meeting data
- **Fallback:** Explicit "I don't have that information" instruction
- **Citation:** Instructed to reference source meetings

### Follow-up Email Prompt
- **Tone:** Professional but friendly
- **Structure:** Summary + action items with owners/dates
- **Constraint:** No invented information

## RAG Strategy

**Approach:** Simple context injection (not full RAG pipeline for MVP)

1. **Indexing:** On save, generate embedding from title + summary + key points + decisions
2. **Storage:** pgvector column on meetings table
3. **Retrieval:** Cosine similarity search via `search_meetings()` function
4. **Generation:** Top results injected into Q&A prompt context

**Why not full RAG:**
- MVP has single-table data model
- Meeting count per user is manageable (< 100)
- Full meeting analysis JSON provides rich context
- Simpler architecture, easier to debug

**Future RAG Enhancement:**
- Chunk transcripts into segments
- Store chunk-level embeddings
- Hybrid search (vector + BM25)
- Re-ranking step

## Agent Design

Not applicable for MVP. The pipeline is a linear workflow, not an agent loop.

**Future Agent Opportunities:**
- Multi-step analysis agent (extract → validate → enrich)
- Action item verification agent (cross-reference with past meetings)
- Meeting preparation agent (summarize previous related meetings)

## Memory Strategy

- **Session memory:** None (stateless API)
- **Persistent memory:** PostgreSQL stores all meeting data + embeddings
- **Q&A context:** Last 20 saved meetings loaded per query
- **No conversation memory:** Each Q&A question is independent

## Guardrails

| Guardrail | Implementation |
|-----------|---------------|
| No hallucination | Prompt instructions + human review step |
| Input size limit | Transcript truncated to 100K chars |
| JSON validation | Parse + default missing fields |
| Auth check | Every API route verifies user |
| Data isolation | RLS policies on database |
| Rate limiting | Vercel serverless natural limits |

## Hallucination Prevention

1. **Prompt-level:** Explicit "only extract stated information" rules
2. **Schema-level:** JSON mode forces structured output
3. **Human-in-the-loop:** Review step before saving/sharing
4. **Q&A grounding:** Context-only answers with fallback message
5. **Temperature:** Low (0.2-0.3) across all generation tasks

## Cost Optimization Strategy

1. **Model selection:** gpt-4o-mini instead of gpt-4o (10x cheaper)
2. **Embedding model:** text-embedding-3-small (cheapest viable)
3. **Context truncation:** Limit transcript to 100K chars, Q&A context to 20 meetings
4. **On-demand generation:** Follow-up emails generated only when requested
5. **Caching potential:** Store analysis results, never re-analyze unless re-uploaded
6. **Batch future:** Could batch embedding generation for bulk imports

**Scaling Cost Projection:**
| Users | Meetings/mo | Est. Cost/mo |
|-------|------------|-------------|
| 10 | 100 | ~$5-10 |
| 100 | 1,000 | ~$50-100 |
| 1,000 | 10,000 | ~$500-1,000 |
