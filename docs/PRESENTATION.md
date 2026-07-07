# Presentation Outline — AI Meeting Assistant

**Duration:** 30 minutes + 30 minutes Q&A

---

## Slide 1: Title
- AI Meeting Assistant
- Your Name | Date
- Transforming meetings into actionable business outputs

## Slide 2: The Business Problem (3 min)
- 31 hours/month in meetings for average knowledge worker
- Manual documentation: error-prone, inconsistent, not searchable
- Cost: hundreds of hours/month across teams
- **Our solution:** AI-powered meeting assistant

## Slide 3: Product Thinking (4 min)
- **Target users:** Engineering managers, PMs, Operations leads
- **Core insight:** Human-in-the-loop — AI extracts, human validates
- **MVP scope:** Single-user workflow from upload to export
- **Key differentiator:** Structured output, not just summaries

## Slide 4: User Journey (2 min)
- Show user journey diagram
- 7 steps: Sign In → Create → Upload → Analyze → Review → Save → Export

## Slide 5: Product Design (3 min)
- Dashboard-first design
- Progressive disclosure: metadata → upload → results → export
- Edit-before-save pattern builds trust
- Screenshots of key screens

## Slide 6: Technical Architecture (4 min)
- Architecture diagram (from docs/ARCHITECTURE.md)
- Next.js + Supabase + OpenAI on Vercel
- Why these choices: speed to MVP, managed infra, proven AI

## Slide 7: AI Design Decisions (4 min)
- Model selection rationale (cost vs quality)
- Prompt engineering: JSON mode, low temperature, explicit guardrails
- RAG strategy: embedding-based search + context injection for Q&A
- Hallucination prevention: prompt rules + human review
- Cost: ~$0.02-0.10 per meeting

## Slide 8: Live Demo (5 min)
1. Sign in
2. Create meeting with sample data
3. Paste sample transcript
4. Show AI analysis results
5. Edit an action item
6. Save and export PDF
7. Search for a past meeting
8. Ask AI a question

## Slide 9: GitHub Walkthrough (2 min)
- Repository structure
- Documentation (5 docs files)
- Commit history
- README and setup guide

## Slide 10: Lessons Learned (2 min)
- Human-in-the-loop is essential for trust
- Structured JSON output > free-form text
- pgvector adds search with minimal complexity
- Start simple, iterate on AI prompts

## Slide 11: Future Roadmap (2 min)
- Phase 2: Team collaboration
- Phase 3: Calendar/Slack integrations
- Phase 4: Analytics and tracking
- Phase 5: Enterprise (SSO, audit logs)

## Slide 12: Q&A
- Thank you
- GitHub URL | Live Demo URL

---

## Demo Script

Use `sample-transcript.txt` for the live demo:

1. Create meeting: "Q1 Product Planning" / Engineering / Planning
2. Add participants: Sarah Chen, James Park, Maria Lopez, Alex Kim
3. Paste sample transcript
4. After analysis, highlight:
   - Executive summary
   - 5 action items with owners and due dates
   - Decision: mobile app launch by March 31
   - Risk: Apple Pay review delays
5. Edit one action item owner
6. Save → Export PDF
7. Search: "Apple Pay"
8. Ask AI: "What is the mobile app launch date?"

## Anticipated Q&A Topics

- Why GPT-4o-mini over GPT-4o? → Cost optimization, sufficient for extraction
- How do you prevent hallucinations? → Prompt guardrails + human review step
- Scalability? → Serverless architecture, Supabase scales horizontally
- Team features? → Roadmap Phase 2
- Data privacy? → RLS isolation, no cross-user access, OpenAI data policy
- Accuracy metrics? → Future: user edit rate as quality signal
