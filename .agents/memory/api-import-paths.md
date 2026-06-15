---
name: API client import paths
description: How to correctly import from the generated API client in the dashboard
---

**Rule:** Always import from the package name `@workspace/api-client-react`, never from its internal src path.

**Correct:**
```ts
import { useAnalyzeResumes } from "@workspace/api-client-react";
import type { RankedCandidate, RankingResult } from "@workspace/api-client-react";
```

**Wrong (causes TS2307):**
```ts
import { RankedCandidate } from "@workspace/api-client-react/src/generated/api.schemas";
```

**Why:** The package barrel exports everything from `src/index.ts`. Using the sub-path directly bypasses the package resolution and causes "Cannot find module" errors in TypeScript, even though Vite can sometimes resolve it at runtime.
