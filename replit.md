# TalentLens — AI Candidate Ranking Dashboard

An AI-powered candidate ranking dashboard that scores candidates against a job description using hybrid vector similarity, BM25 keyword relevance, and behavioral signal analysis — then generates per-candidate recruiter insights explaining exactly why each person fits the role.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/dashboard run dev` — run the frontend (port 23183)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- Frontend: React + Vite, Tailwind CSS, Framer Motion, shadcn/ui
- Validation: Zod, plain JS guards on the API server
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/api-server/src/data/candidates.ts` — candidate JSON data store (12 rich profiles)
- `artifacts/api-server/src/lib/ranking-engine.ts` — TF-IDF + BM25 + behavioral hybrid scoring + insight generation
- `artifacts/api-server/src/routes/candidates.ts` — GET /api/candidates, GET /api/candidates/:id
- `artifacts/api-server/src/routes/ranking.ts` — POST /api/ranking/analyze, GET /api/ranking/stats
- `lib/api-spec/openapi.yaml` — OpenAPI contract (source of truth)
- `artifacts/dashboard/src/` — React frontend

## Architecture decisions

- **No LLM API required**: Recruiter insights are generated dynamically from the scoring breakdown using a template engine in `ranking-engine.ts`, not an external AI call — zero API cost, zero latency.
- **Hybrid scoring**: TF-IDF cosine similarity (35%) + BM25 keyword relevance (30%) + experience matching (20%) + behavioral signals (15%). Each dimension is independently normalized before combining.
- **Skill bonus**: Directly matched skills add a small bonus (capped at 12 points) on top of the hybrid score, rewarding explicit technology alignment.
- **API-first**: All data flows through OpenAPI-defined contracts; codegen produces typed React Query hooks consumed by the frontend.
- **zod/v4 not bundleable by esbuild**: Use plain `zod` (without `/v4` sub-path) in api-server routes, or use plain JS guards instead.

## Product

- Header strip shows live pool stats (total candidates, avg experience, top skills)
- Paste any job description and click "Run Smart Analysis"
- Multi-stage animated loading (Vectorizing → Semantic Matching → Scoring → Insights)
- Ranked candidate cards with: circular fit score arc, recruiter insight callout, score breakdown bars, matched skill chips, behavioral signal indicators, expandable career history

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Do NOT import `zod/v4` in `artifacts/api-server` — esbuild cannot resolve the sub-path. Use plain `zod` or raw JS validation.
- The api-server does NOT use a database — all candidate data lives in `src/data/candidates.ts`.
- After any OpenAPI spec change, run codegen before editing frontend code.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
