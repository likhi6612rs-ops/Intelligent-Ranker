import type { ParsedCandidate } from "./resume-parser.js";

// ─── Text Utilities ──────────────────────────────────────────────────────────

const STOP_WORDS = new Set([
  "a","an","and","are","as","at","be","been","by","for","from","has","he","in",
  "is","it","its","of","on","that","the","to","was","were","will","with","we",
  "our","you","your","their","they","this","these","those","or","but","not",
  "have","had","do","does","did","so","if","up","out","about","would","there",
  "what","which","who","when","where","how","all","each","both","any","can",
  "more","also","than","then","into","such","like","very","over","just","some",
  "years","year","experience","role","team","work","working","strong","ability",
  "candidate","candidates","looking","seeking","required","requirements","job",
  "position","company","opportunity","responsibilities","must","should","help",
  "well","good","great","excellent","knowledge","understanding","including",
  "within","responsible","across","level","senior","junior","lead",
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9#+.\-/]/g, " ")
    .split(/\s+/)
    .filter(t => t.length > 1 && !STOP_WORDS.has(t));
}

// ─── 1. SKILLS MATCH (50%) ────────────────────────────────────────────────────
// Extract every distinct skill/technology/tool mentioned in the JD and
// check which ones appear in the candidate's parsed skills list.

function extractJdSkills(jd: string, allSkillsDictionary: string[]): string[] {
  const jdLower = jd.toLowerCase();
  const found = new Set<string>();
  for (const skill of allSkillsDictionary) {
    const sl = skill.toLowerCase();
    const escaped = sl.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\+/g, "\\+");
    const re = new RegExp(`(?<![a-z0-9])${escaped}(?![a-z0-9])`, "i");
    if (re.test(jdLower)) found.add(skill);
  }
  return [...found];
}

const SKILLS_DICT = [
  "Python","JavaScript","TypeScript","Java","Go","Rust","C++","C#","Ruby","Swift",
  "Kotlin","Scala","PHP","R","MATLAB","Elixir","Haskell","Clojure","Dart","Lua",
  "React","Next.js","Vue","Angular","Svelte","HTML","CSS","Tailwind CSS","Sass",
  "Redux","MobX","Zustand","GraphQL","Apollo","Webpack","Vite","Storybook","Cypress",
  "Node.js","Express","FastAPI","Django","Flask","Spring Boot","Rails","Laravel",
  "NestJS","Fastify","gRPC","REST","WebSocket","Microservices","Kafka","RabbitMQ",
  "AWS","GCP","Azure","Docker","Kubernetes","Terraform","Ansible","Helm","ArgoCD",
  "CI/CD","GitHub Actions","Jenkins","GitOps","Prometheus","Grafana","Datadog",
  "Nginx","Linux","Bash","Shell","Vagrant","Pulumi","CloudFormation","Serverless",
  "PostgreSQL","MySQL","MongoDB","Redis","Elasticsearch","Cassandra","DynamoDB",
  "Snowflake","BigQuery","Redshift","SQLite","Neo4j","ClickHouse","Supabase",
  "Drizzle","Prisma","SQLAlchemy","Hibernate","dbt","Airflow","Spark","Hadoop",
  "PyTorch","TensorFlow","Keras","Scikit-learn","Pandas","NumPy","Jupyter",
  "LangChain","OpenAI","Hugging Face","Transformers","RLHF","RAG","LLM","MLOps",
  "Vector Database","Pinecone","Weaviate","JAX","CUDA","TensorRT","ONNX",
  "Computer Vision","NLP","Deep Learning","Machine Learning","Data Science",
  "iOS","Android","React Native","Flutter","SwiftUI","Objective-C","Expo",
  "Xcode","Android Studio","Firebase","Push Notifications",
  "Git","GitHub","GitLab","Bitbucket","Jira","Confluence","Figma","Postman",
  "Stripe","Twilio","Auth0","Clerk","Sentry","Segment","Mixpanel","Amplitude",
  "A/B Testing","Agile","Scrum","SOLID","Design Patterns","System Design",
  "Event-Driven","Domain-Driven Design","TDD","BDD",
  "SQL","ETL","Data Pipeline","Data Modeling","Analytics",
  "Tableau","Looker","Power BI","Kafka Streams",
  "communication","presentation","leadership","management","mentoring","coaching",
  "project management","stakeholder","agile","scrum","kanban","excel","word","powerpoint",
];

function skillsMatchScore(jd: string, candidate: ParsedCandidate): { score: number; matched: string[]; jdSkills: string[] } {
  const jdSkills = extractJdSkills(jd, SKILLS_DICT);

  if (jdSkills.length === 0) {
    // No identifiable skills in JD — fall back to keyword overlap
    const jdTokens = new Set(tokenize(jd));
    const matched = candidate.skills.filter(s => jdTokens.has(s.toLowerCase()));
    const score = candidate.skills.length === 0 ? 0 : Math.min(matched.length / Math.max(jdSkills.length, 3) * 100, 100);
    return { score, matched, jdSkills };
  }

  const candidateSkillsLower = candidate.skills.map(s => s.toLowerCase());
  const matched = jdSkills.filter(jdSkill =>
    candidateSkillsLower.some(cs => cs === jdSkill.toLowerCase() || cs.includes(jdSkill.toLowerCase()) || jdSkill.toLowerCase().includes(cs))
  );

  const score = Math.round((matched.length / jdSkills.length) * 100);
  return { score, matched, jdSkills };
}

// ─── 2. EXPERIENCE RELEVANCE (30%) ───────────────────────────────────────────
// Semantic similarity: do the candidate's past roles, titles, and job scope
// match the target role described in the JD?

function buildRoleDoc(candidate: ParsedCandidate): string {
  return [
    candidate.title,
    candidate.summary,
    candidate.industries.join(" "),
    ...candidate.careerHistory.map(e => `${e.title} ${e.company} ${e.highlights.join(" ")}`),
  ].join(" ").toLowerCase();
}

function cosineSimilarity(a: Map<string, number>, b: Map<string, number>): number {
  let dot = 0, magA = 0, magB = 0;
  a.forEach((v, k) => { magA += v * v; if (b.has(k)) dot += v * b.get(k)!; });
  b.forEach(v => (magB += v * v));
  const denom = Math.sqrt(magA) * Math.sqrt(magB);
  return denom === 0 ? 0 : dot / denom;
}

function termFrequency(tokens: string[]): Map<string, number> {
  const tf = new Map<string, number>();
  for (const t of tokens) tf.set(t, (tf.get(t) ?? 0) + 1);
  const total = tokens.length || 1;
  tf.forEach((v, k) => tf.set(k, v / total));
  return tf;
}

function experienceRelevanceScore(jd: string, candidates: ParsedCandidate[], idx: number): number {
  const jdTokens = tokenize(jd);
  const allDocs = candidates.map(buildRoleDoc);
  const N = allDocs.length;

  const jdTF = termFrequency(jdTokens);
  const candTF = termFrequency(tokenize(allDocs[idx]));

  // IDF
  const idf = new Map<string, number>();
  jdTF.forEach((_, term) => {
    const df = allDocs.filter(doc => doc.includes(term)).length;
    idf.set(term, Math.log((N + 1) / (df + 1)) + 1);
  });

  const jdVec = new Map<string, number>();
  const candVec = new Map<string, number>();
  jdTF.forEach((v, k) => jdVec.set(k, v * (idf.get(k) ?? 1)));
  candTF.forEach((v, k) => { if (jdTF.has(k)) candVec.set(k, v * (idf.get(k) ?? 1)); });

  const raw = cosineSimilarity(jdVec, candVec);
  // Scale: cosine similarity tops out low in practice; multiply and clamp
  return Math.min(Math.round(raw * 4.5 * 100), 100);
}

// ─── 3. EXPERIENCE DURATION (20%) ────────────────────────────────────────────
// Compare precise years of experience vs. the JD's minimum requirement.
// Significant penalty for being under the minimum.

function extractRequiredYears(jd: string): number | null {
  const patterns = [
    /(\d+)\+?\s*years?\s+of\s+(?:professional\s+)?experience/i,
    /minimum\s+(?:of\s+)?(\d+)\s*years?/i,
    /at\s+least\s+(\d+)\s*years?/i,
    /(\d+)-\d+\s+years?/i,
    /(\d+)\+?\s*\+\s*years?/i,
    /(\d+)\s*years?\s+(?:minimum|min)/i,
  ];
  for (const p of patterns) {
    const m = jd.match(p);
    if (m) return parseFloat(m[1]);
  }
  return null;
}

function experienceDurationScore(candidate: ParsedCandidate, requiredYears: number | null): { score: number; label: string } {
  const actual = candidate.yearsOfExperiencePrecise;

  if (candidate.isEntryLevel || actual < 0.25) {
    if (requiredYears && requiredYears > 0) {
      return { score: 5, label: `Entry Level / No Prior Experience (required: ${requiredYears}y)` };
    }
    return { score: 30, label: "Entry Level / No Prior Experience" };
  }

  if (requiredYears === null) {
    // No explicit requirement — normalize by seniority
    const score = Math.min(Math.round(30 + Math.min(actual / 10, 1) * 70), 100);
    return { score, label: `${actual.toFixed(1)} years (no minimum specified)` };
  }

  if (actual >= requiredYears) {
    // Meets or exceeds requirement
    const excess = actual - requiredYears;
    const score = excess > 8 ? 90 : 100; // slight penalty if very overqualified
    return { score, label: `${actual.toFixed(1)} years (meets ${requiredYears}y requirement)` };
  }

  // Under the requirement — significant penalty
  const ratio = actual / requiredYears;
  // ratio 0.9 → ~72, ratio 0.5 → ~40, ratio 0.1 → ~5
  const score = Math.max(Math.round(ratio * ratio * 100), 3);
  const shortfall = (requiredYears - actual).toFixed(1);
  return { score, label: `${actual.toFixed(1)} years — ${shortfall}y short of ${requiredYears}y requirement` };
}

// ─── Key Insight Generation ───────────────────────────────────────────────────

function generateInsight(
  candidate: ParsedCandidate,
  skillsM: number,
  expRel: number,
  expDur: { score: number; label: string },
  matchedSkills: string[],
  jdSkills: string[],
  overall: number,
  requiredYears: number | null,
): string {
  const parts: string[] = [];

  // Experience status
  if (candidate.isEntryLevel || candidate.yearsOfExperiencePrecise < 0.25) {
    parts.push("Candidate lacks professional work experience.");
  } else if (requiredYears && candidate.yearsOfExperiencePrecise < requiredYears) {
    const shortfall = (requiredYears - candidate.yearsOfExperiencePrecise).toFixed(1);
    parts.push(`Under-experienced by ${shortfall} year${parseFloat(shortfall) !== 1 ? "s" : ""} against the stated minimum.`);
  } else if (requiredYears && candidate.yearsOfExperiencePrecise >= requiredYears) {
    parts.push(`Meets the ${requiredYears}-year experience requirement with ${candidate.yearsOfExperiencePrecise.toFixed(1)} years.`);
  } else {
    parts.push(`${candidate.yearsOfExperiencePrecise.toFixed(1)} years of total experience.`);
  }

  // Skills assessment
  if (jdSkills.length > 0) {
    const missing = jdSkills.filter(s => !matchedSkills.map(m => m.toLowerCase()).includes(s.toLowerCase()));
    if (skillsM >= 80) {
      parts.push(`Strong skills alignment — matches ${matchedSkills.length}/${jdSkills.length} required skills.`);
    } else if (skillsM >= 50) {
      const topMissing = missing.slice(0, 3).join(", ");
      parts.push(`Partial skills match (${matchedSkills.length}/${jdSkills.length}). Missing: ${topMissing || "none identified"}.`);
    } else {
      const topMissing = missing.slice(0, 4).join(", ");
      parts.push(`Weak skills alignment (${matchedSkills.length}/${jdSkills.length}). Key gaps: ${topMissing || "skills not found in resume"}.`);
    }
  } else if (skillsM >= 70) {
    parts.push("Good keyword alignment with the job requirements.");
  } else {
    parts.push("Limited keyword overlap with the job requirements.");
  }

  // Role relevance
  if (expRel >= 70) {
    parts.push("Past roles are closely related to the target position.");
  } else if (expRel >= 40) {
    parts.push("Career history is partially relevant to this role.");
  } else {
    parts.push("Past experience appears to be in a different domain.");
  }

  // Overall verdict
  if (overall >= 80) {
    parts.push("Strong overall candidate — recommend advancing.");
  } else if (overall >= 60) {
    parts.push("Viable candidate worth interviewing.");
  } else if (overall >= 40) {
    parts.push("Borderline fit — consider if pool is limited.");
  } else {
    parts.push("Does not meet the stated requirements.");
  }

  return parts.join(" ");
}

// ─── Main Ranking Function ─────────────────────────────────────────────────────

export interface RankedCandidate {
  candidate: ParsedCandidate;
  fitScore: number;
  recruiterInsight: string;
  scoreBreakdown: {
    skillsMatch: number;
    experienceRelevance: number;
    experienceDuration: number;
    overall: number;
  };
  matchedSkills: string[];
  rank: number;
}

export interface ScoringWeights {
  skillsMatch: number;       // e.g. 50
  experienceRelevance: number; // e.g. 30
  experienceDuration: number;  // e.g. 20
}

const DEFAULT_WEIGHTS: ScoringWeights = { skillsMatch: 50, experienceRelevance: 30, experienceDuration: 20 };

export function rankCandidates(
  jobDescription: string,
  candidates: ParsedCandidate[],
  weights: ScoringWeights = DEFAULT_WEIGHTS,
): RankedCandidate[] {
  if (candidates.length === 0) return [];

  // Normalize weights to fractions that sum to 1
  const total = weights.skillsMatch + weights.experienceRelevance + weights.experienceDuration;
  const wSM = total > 0 ? weights.skillsMatch / total : 0.50;
  const wER = total > 0 ? weights.experienceRelevance / total : 0.30;
  const wED = total > 0 ? weights.experienceDuration / total : 0.20;

  const requiredYears = extractRequiredYears(jobDescription);

  const scored = candidates.map((candidate, i) => {
    // 1. Skills Match
    const { score: smRaw, matched: matchedSkills, jdSkills } = skillsMatchScore(jobDescription, candidate);

    // 2. Experience Relevance
    const erRaw = experienceRelevanceScore(jobDescription, candidates, i);

    // 3. Experience Duration
    const edResult = experienceDurationScore(candidate, requiredYears);

    // Weighted overall using recruiter-configured weights
    const overall = Math.round(smRaw * wSM + erRaw * wER + edResult.score * wED);

    const scoreBreakdown = {
      skillsMatch: smRaw,
      experienceRelevance: erRaw,
      experienceDuration: edResult.score,
      overall,
    };

    const recruiterInsight = generateInsight(
      candidate,
      smRaw,
      erRaw,
      edResult,
      matchedSkills,
      jdSkills,
      overall,
      requiredYears,
    );

    return {
      candidate,
      fitScore: overall,
      recruiterInsight,
      scoreBreakdown,
      matchedSkills,
      rank: 0,
    };
  });

  scored.sort((a, b) => b.fitScore - a.fitScore);
  scored.forEach((s, i) => { s.rank = i + 1; });

  return scored;
}
