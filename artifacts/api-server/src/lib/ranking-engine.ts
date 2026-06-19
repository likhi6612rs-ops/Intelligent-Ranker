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

// ─── Deep Analysis ─────────────────────────────────────────────────────────────

interface GapAnalysisItem { skill: string; probeQuestion: string; }

function detectRoleType(jd: string): string {
  const j = jd.toLowerCase();
  if (/machine learning|ml engineer|deep learning|llm|pytorch|tensorflow|nlp/.test(j)) return "ml";
  if (/data engineer|data pipeline|etl|spark|airflow|dbt|warehouse/.test(j)) return "data-eng";
  if (/data scientist|data analysis|analytics|statistics|tableau|looker/.test(j)) return "data-sci";
  if (/devops|sre|platform engineer|kubernetes|terraform|ci\/cd|infrastructure/.test(j)) return "devops";
  if (/frontend|react|vue|angular|ui engineer|user interface/.test(j)) return "frontend";
  if (/backend|api|microservice|node|django|spring|rails/.test(j)) return "backend";
  if (/mobile|ios|android|react native|flutter|swift|kotlin/.test(j)) return "mobile";
  if (/product manager|pm|roadmap|stakeholder|go-to-market/.test(j)) return "pm";
  if (/security|cybersecurity|appsec|infosec|pentest/.test(j)) return "security";
  if (/fullstack|full-stack|full stack/.test(j)) return "fullstack";
  return "software";
}

const GAP_PROBE_TEMPLATES: Record<string, (skill: string) => string> = {
  default: s => `Your resume doesn't list ${s}. Walk me through any exposure you've had to it — even in a learning or side-project context. How quickly could you get up to speed?`,
  production: s => `${s} is a core requirement here. Describe a production scenario where you would have needed it. How did you solve the same problem without it?`,
  leadership: s => `The role requires ${s} expertise that isn't visible on your resume. If you were handed a project requiring ${s}, what would your ramp-up plan look like in the first 30 days?`,
};

function generateGapProbeQuestion(skill: string, candidateYears: number, rank: number): string {
  const s = skill;
  if (candidateYears >= 5)
    return `Your profile is strong, but ${s} isn't listed. Given your seniority, how would you leverage your existing experience to quickly close this gap if needed in the role?`;
  if (rank === 1)
    return `Even as the top candidate, ${s} is a requirement you haven't demonstrated. Can you walk me through a project where you solved a similar problem with a different tool?`;
  return GAP_PROBE_TEMPLATES.default(s);
}

const QUESTION_BANKS: Record<string, (candidate: ParsedCandidate, matchedSkills: string[], missingSkills: string[], jd: string) => string[]> = {
  ml: (c, matched, missing, jd) => {
    const recentRole = c.careerHistory[0];
    const skillStr = matched.slice(0, 2).join(" and ") || "machine learning tools";
    const company = recentRole?.company || "your previous employer";
    const req = extractRequiredYears(jd);
    return [
      `At ${company}, you worked with ${skillStr}. Walk me through how you took a model from research prototype to a production-serving system — what were the biggest deployment challenges and how did you resolve them?`,
      `Describe a time when a model you shipped degraded in production due to data drift or distribution shift. How did you detect it, diagnose the root cause, and implement a fix without a full retraining cycle?`,
      missing.length > 0
        ? `This role requires ${missing[0]}. If you were tasked with integrating it into an existing ${skillStr}-based pipeline on a tight deadline, how would you approach the learning curve while managing delivery risk?`
        : `You have ${req ? req + "+ years" : "strong experience"} in this space. Describe the most complex ML system you've architected — what trade-offs did you make between model accuracy, latency, and maintainability?`,
    ];
  },
  devops: (c, matched, missing) => {
    const recentRole = c.careerHistory[0];
    const company = recentRole?.company || "your last role";
    const skillStr = matched.slice(0, 2).join(" and ") || "infrastructure tooling";
    return [
      `At ${company} using ${skillStr}, walk me through an incident where a deployment caused a production outage. What was your incident response process and what systemic changes did you implement afterward?`,
      `Describe your approach to designing a zero-downtime deployment pipeline for a high-traffic service. What's the most complex rollback scenario you've had to handle, and how did it go?`,
      missing.length > 0
        ? `The role requires ${missing[0]}, which isn't listed on your resume. Describe a situation where you had to learn a new infrastructure tool under deadline pressure — what was your approach?`
        : `How do you balance infrastructure security hardening with developer velocity? Give a specific example where you had to enforce a security policy that the dev team pushed back on.`,
    ];
  },
  frontend: (c, matched, missing) => {
    const recentRole = c.careerHistory[0];
    const company = recentRole?.company || "your previous role";
    const skillStr = matched[0] || "your frontend stack";
    return [
      `At ${company} with ${skillStr}, describe the most complex UI performance problem you've debugged — what were the symptoms, how did you identify the root cause, and what did you ship to fix it?`,
      `Walk me through how you would architect a large-scale ${skillStr} application for a team of 15 engineers — how do you handle state management, code splitting, and component reusability at that scale?`,
      missing.length > 0
        ? `${missing[0]} is a key requirement here. If you were inheriting a codebase built on it, what would your first two weeks look like to become productive?`
        : `Describe a time you had to advocate for an accessibility or UX improvement that required significant engineering effort. How did you build the case and what was the outcome?`,
    ];
  },
  backend: (c, matched, missing) => {
    const recentRole = c.careerHistory[0];
    const company = recentRole?.company || "a previous role";
    const skillStr = matched.slice(0, 2).join(" and ") || "your backend stack";
    return [
      `At ${company} with ${skillStr}, describe the highest-scale API or service you've designed. What were the traffic patterns, how did you handle peak load, and what would you do differently today?`,
      `Walk me through a situation where you had to refactor a critical backend service with zero downtime. What was your migration strategy, how did you test it, and what risks did you mitigate?`,
      missing.length > 0
        ? `The role relies heavily on ${missing[0]}. Describe a scenario from your experience with ${skillStr} where you solved a problem that ${missing[0]} is typically used for. How transferable are those skills?`
        : `Describe a time when a database schema decision you made early on became a bottleneck at scale. How did you diagnose it and what was the remediation plan?`,
    ];
  },
  data_eng: (c, matched, missing) => {
    const recentRole = c.careerHistory[0];
    const company = recentRole?.company || "your last role";
    const skillStr = matched.slice(0, 2).join(" and ") || "your data stack";
    return [
      `At ${company} using ${skillStr}, describe the most complex data pipeline you've built. How did you handle late-arriving data, schema evolution, and downstream SLA guarantees simultaneously?`,
      `Walk me through how you would design a real-time + batch hybrid pipeline for a dataset that grows by 10TB/day. What trade-offs would you make between latency, cost, and reliability?`,
      missing.length > 0
        ? `${missing[0]} is central to this role. Describe a data quality or transformation problem you've solved where ${missing[0]} would have been the obvious choice — how did you handle it without it?`
        : `Describe a time a data pipeline failure cascaded into a business-critical dashboard going dark. How did you detect it, communicate it, and prevent recurrence?`,
    ];
  },
  software: (c, matched, missing) => {
    const recentRole = c.careerHistory[0];
    const title = recentRole?.title || "your previous role";
    const company = recentRole?.company || "a previous company";
    const skillStr = matched.slice(0, 2).join(" and ") || "your technical stack";
    return [
      `In your role as ${title} at ${company}, describe the most technically complex problem you've owned end-to-end — from design through production. What would you do differently with the benefit of hindsight?`,
      `Walk me through a time you had to make a significant architectural decision under ambiguity and time pressure. How did you evaluate options, get alignment from the team, and measure the outcome?`,
      missing.length > 0
        ? `${missing[0]} is a listed requirement. While it's not on your resume, describe a situation where you learned a critical new technology quickly to meet a project deadline — what was your approach?`
        : `Describe a situation where you inherited a problematic codebase or system. What was your strategy to stabilize it, establish trust with stakeholders, and incrementally improve it?`,
    ];
  },
};

function generateDeepAnalysis(
  candidate: ParsedCandidate,
  rank: number,
  overall: number,
  smRaw: number,
  erRaw: number,
  edScore: number,
  matchedSkills: string[],
  jdSkills: string[],
  topCandidate: { name: string; fitScore: number; matchedSkills: string[] } | null,
  jd: string,
): { justification: string; gapAnalysis: GapAnalysisItem[]; interviewQuestions: string[] } {

  // ── Justification ──────────────────────────────────────────────────────────
  const strongest = smRaw >= erRaw && smRaw >= edScore ? "skills alignment"
    : erRaw >= edScore ? "experience relevance" : "experience duration";

  let sentence1: string;
  if (overall >= 80) {
    sentence1 = `${candidate.name} is a strong fit with a ${overall}/100 overall score, driven primarily by ${strongest} — matched ${matchedSkills.length} of ${jdSkills.length} required skills${candidate.yearsOfExperiencePrecise > 0 ? ` and brings ${candidate.yearsOfExperiencePrecise.toFixed(1)} years of directly relevant experience` : ""}.`;
  } else if (overall >= 50) {
    sentence1 = `${candidate.name} is a viable candidate (${overall}/100) with solid ${strongest}, matching ${matchedSkills.length} of ${jdSkills.length} required skills${candidate.yearsOfExperiencePrecise > 0 ? ` across ${candidate.yearsOfExperiencePrecise.toFixed(1)} years in the field` : ""}.`;
  } else {
    sentence1 = `${candidate.name} scores ${overall}/100 — a limited fit, with ${matchedSkills.length} of ${jdSkills.length} required skills matched${candidate.isEntryLevel ? " and no prior professional experience on record" : ` and ${candidate.yearsOfExperiencePrecise.toFixed(1)} years of experience`}.`;
  }

  let sentence2: string;
  if (rank === 1) {
    const topStrengths = matchedSkills.slice(0, 3).join(", ") || "overall profile";
    sentence2 = `As the top-ranked candidate, their key differentiators are ${topStrengths}${erRaw >= 70 ? " and strong role-scope alignment with the target position" : ""}.`;
  } else if (topCandidate) {
    const topMissing = jdSkills.filter(s => !matchedSkills.map(m => m.toLowerCase()).includes(s.toLowerCase()));
    const topExtraSkills = topCandidate.matchedSkills.filter(s => !matchedSkills.map(m => m.toLowerCase()).includes(s.toLowerCase())).slice(0, 2);
    if (topExtraSkills.length > 0) {
      sentence2 = `Compared to #1 (${topCandidate.name}, ${topCandidate.fitScore}/100), this candidate lacks ${topExtraSkills.join(" and ")} and scores ${topCandidate.fitScore - overall} points lower overall.`;
    } else if (topMissing.length > 0) {
      sentence2 = `Compared to ${topCandidate.name} (${topCandidate.fitScore}/100), the primary gaps are ${topMissing.slice(0, 2).join(" and ")}, which drove the ${topCandidate.fitScore - overall}-point score differential.`;
    } else {
      sentence2 = `${topCandidate.name} outscores this candidate by ${topCandidate.fitScore - overall} points, primarily on experience depth and role-scope alignment.`;
    }
  } else {
    sentence2 = `The strongest gap is in ${smRaw < erRaw ? "skills coverage" : "experience relevance"} — addressing this would significantly improve the candidate's fit score.`;
  }

  const justification = `${sentence1} ${sentence2}`;

  // ── Gap Analysis ───────────────────────────────────────────────────────────
  const missingSkills = jdSkills
    .filter(s => !matchedSkills.map(m => m.toLowerCase()).includes(s.toLowerCase()))
    .slice(0, 4);

  const gapAnalysis: GapAnalysisItem[] = missingSkills.slice(0, 2).map(skill => ({
    skill,
    probeQuestion: generateGapProbeQuestion(skill, candidate.yearsOfExperiencePrecise, rank),
  }));

  if (gapAnalysis.length === 0 && !candidate.isEntryLevel) {
    // No hard skill gaps — probe soft gaps
    if (erRaw < 60) {
      gapAnalysis.push({
        skill: "Role-specific domain experience",
        probeQuestion: "Your technical skills are solid, but your past roles appear to be in a different domain. Walk me through how you'd approach ramping up on [this domain] within the first 90 days.",
      });
    }
    if (edScore < 60) {
      gapAnalysis.push({
        skill: "Years of professional experience",
        probeQuestion: `The role has a higher experience bar than your ${candidate.yearsOfExperiencePrecise.toFixed(1)} years reflects. Describe a time you operated above your level — what did you take on, and how did you succeed?`,
      });
    }
  }

  if (candidate.isEntryLevel && gapAnalysis.length < 2) {
    gapAnalysis.push({
      skill: "Professional work experience",
      probeQuestion: "You have limited professional experience. Walk me through a project (academic, open-source, or personal) where you applied these skills under real constraints. What was the scope and what did you ship?",
    });
  }

  // ── Interview Questions ────────────────────────────────────────────────────
  const roleType = detectRoleType(jd);
  const bankKey = roleType === "data-eng" ? "data_eng" : roleType === "data-sci" ? "software" : roleType;
  const bank = QUESTION_BANKS[bankKey] ?? QUESTION_BANKS.software;
  const interviewQuestions = bank(candidate, matchedSkills, missingSkills, jd);

  return { justification, gapAnalysis, interviewQuestions };
}

// ─── Main Ranking Function ─────────────────────────────────────────────────────

export interface GapAnalysisItem { skill: string; probeQuestion: string; }

export interface RankedCandidate {
  candidate: ParsedCandidate;
  fitScore: number;
  recruiterInsight: string;
  justification: string;
  gapAnalysis: GapAnalysisItem[];
  interviewQuestions: string[];
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
      jdSkills,
      smRaw,
      erRaw,
      edScore: edResult.score,
      rank: 0,
      // placeholders filled in after sorting
      justification: "",
      gapAnalysis: [] as GapAnalysisItem[],
      interviewQuestions: [] as string[],
    };
  });

  scored.sort((a, b) => b.fitScore - a.fitScore);
  scored.forEach((s, i) => { s.rank = i + 1; });

  // Now generate deep analysis with rank context
  const top = scored[0];
  scored.forEach(s => {
    const topRef = s.rank === 1 ? null : {
      name: top.candidate.name,
      fitScore: top.fitScore,
      matchedSkills: top.matchedSkills,
    };
    const deep = generateDeepAnalysis(
      s.candidate,
      s.rank,
      s.fitScore,
      s.smRaw,
      s.erRaw,
      s.edScore,
      s.matchedSkills,
      s.jdSkills,
      topRef,
      jobDescription,
    );
    s.justification = deep.justification;
    s.gapAnalysis = deep.gapAnalysis;
    s.interviewQuestions = deep.interviewQuestions;
  });

  // Strip internal-only fields before returning
  return scored.map(({ jdSkills: _j, smRaw: _s, erRaw: _e, edScore: _d, ...rest }) => rest);
}
