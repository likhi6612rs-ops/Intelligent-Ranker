---
name: Resume parsing architecture
description: How resumes flow from upload to ranked results — client extracts text, server parses and ranks
---

The app does NOT use an LLM for any step. All parsing and ranking is algorithmic.

**Upload flow:**
1. Client-side: user drops PDF/TXT files or pastes text
2. For PDFs: `pdfjs-dist` extracts text in the browser (`GlobalWorkerOptions.workerSrc` via `new URL(...)`)
3. For TXT files: `FileReader.text()` API
4. Text is sent as `{filename, text}` pairs to the server via `POST /api/ranking/analyze`

**Server-side parsing** (`artifacts/api-server/src/lib/resume-parser.ts`):
- Name: first 2-4 word line near top, or "Name:" pattern, fallback to filename
- Skills: match against ~200-skill dictionary with regex word-boundary checks
- Years: parse date ranges (2019–2023 = 4 years), or "X years of experience" pattern
- Career history: look for date range lines, extract title/company/highlights around them
- Behavioral signals: keyword counting (leadership, collaboration, adaptability)
- Education: degree pattern matching

**Why:** Session is stateless — no database. All candidate data comes from resumes uploaded per-session, which lives in React context and is discarded on page refresh.

**How to apply:** When adding new candidate fields, add extraction in resume-parser.ts AND update the ParsedCandidate interface AND the OpenAPI spec AND re-run codegen.
