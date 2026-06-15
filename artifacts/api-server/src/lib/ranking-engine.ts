import type { Candidate } from "../data/candidates.js";

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
  "well","good","great","excellent","excellent","knowledge","understanding"
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9#+.\-/]/g, " ")
    .split(/\s+/)
    .filter(t => t.length > 1 && !STOP_WORDS.has(t));
}

function termFrequency(tokens: string[]): Map<string, number> {
  const tf = new Map<string, number>();
  for (const t of tokens) tf.set(t, (tf.get(t) ?? 0) + 1);
  // normalize
  const total = tokens.length || 1;
  tf.forEach((v, k) => tf.set(k, v / total));
  return tf;
}

// ─── TF-IDF Cosine Similarity ────────────────────────────────────────────────

function buildCandidateDoc(c: Candidate): string {
  const parts = [
    c.title,
    c.summary,
    c.skills.join(" "),
    c.industries.join(" "),
    ...c.careerHistory.map(e => `${e.title} ${e.company} ${e.highlights.join(" ")}`),
  ];
  return parts.join(" ");
}

function cosineSimilarity(a: Map<string, number>, b: Map<string, number>): number {
  let dot = 0, magA = 0, magB = 0;
  a.forEach((v, k) => {
    magA += v * v;
    if (b.has(k)) dot += v * b.get(k)!;
  });
  b.forEach(v => magB += v * v);
  const denom = Math.sqrt(magA) * Math.sqrt(magB);
  return denom === 0 ? 0 : dot / denom;
}

function tfidfScore(jdTokens: string[], candidateDoc: string, allDocs: string[]): number {
  const jdTF = termFrequency(jdTokens);
  const candTF = termFrequency(tokenize(candidateDoc));
  const N = allDocs.length;

  // IDF = log(N / df)
  const idf = new Map<string, number>();
  jdTF.forEach((_, term) => {
    const df = allDocs.filter(doc => doc.toLowerCase().includes(term)).length;
    idf.set(term, Math.log((N + 1) / (df + 1)) + 1);
  });

  // Apply IDF to both
  const jdVec = new Map<string, number>();
  const candVec = new Map<string, number>();
  jdTF.forEach((v, k) => jdVec.set(k, v * (idf.get(k) ?? 1)));
  candTF.forEach((v, k) => {
    if (jdTF.has(k)) candVec.set(k, v * (idf.get(k) ?? 1));
  });

  return cosineSimilarity(jdVec, candVec);
}

// ─── BM25 Keyword Scoring ─────────────────────────────────────────────────────

const BM25_K1 = 1.4;
const BM25_B = 0.75;

function bm25Score(queryTerms: string[], docText: string, avgDocLen: number): number {
  const docTokens = tokenize(docText);
  const docLen = docTokens.length;
  const tf = new Map<string, number>();
  for (const t of docTokens) tf.set(t, (tf.get(t) ?? 0) + 1);

  let score = 0;
  for (const term of queryTerms) {
    const f = tf.get(term) ?? 0;
    if (f === 0) continue;
    const numerator = f * (BM25_K1 + 1);
    const denominator = f + BM25_K1 * (1 - BM25_B + BM25_B * (docLen / avgDocLen));
    score += numerator / denominator;
  }
  return score;
}

// ─── Experience Scoring ───────────────────────────────────────────────────────

function extractRequiredYears(jd: string): number | null {
  const patterns = [
    /(\d+)\+?\s*years?\s+of\s+experience/i,
    /(\d+)\+?\s*\+\s*years?/i,
    /minimum\s+(\d+)\s*years?/i,
    /at\s+least\s+(\d+)\s*years?/i,
    /(\d+)-\d+\s+years?/i,
  ];
  for (const p of patterns) {
    const m = jd.match(p);
    if (m) return parseInt(m[1], 10);
  }
  return null;
}

function experienceScore(candidate: Candidate, requiredYears: number | null): number {
  if (requiredYears === null) {
    // No explicit requirement — score based on seniority keywords in JD
    return 0.6 + Math.min(candidate.yearsOfExperience / 15, 0.4);
  }
  const years = candidate.yearsOfExperience;
  if (years >= requiredYears && years <= requiredYears + 4) return 1.0;
  if (years >= requiredYears - 1 && years < requiredYears) return 0.75;
  if (years > requiredYears + 4) return 0.85; // overqualified slight penalty
  // Under required
  const gap = requiredYears - years;
  return Math.max(0, 1 - gap * 0.15);
}

// ─── Skill Matching ────────────────────────────────────────────────────────────

function matchSkills(jd: string, candidate: Candidate): string[] {
  const jdLower = jd.toLowerCase();
  return candidate.skills.filter(skill =>
    jdLower.includes(skill.toLowerCase()) ||
    jdLower.includes(skill.toLowerCase().replace(/\./g, "").replace(/#/g, "sharp"))
  );
}

// ─── Behavioral Scoring ────────────────────────────────────────────────────────

function behavioralScore(candidate: Candidate, jd: string): number {
  const s = candidate.behavioralSignals;
  const jdLower = jd.toLowerCase();
  let base = (s.leadershipScore + s.collaborationScore + s.adaptabilityScore) / 300;

  // Boost for trajectory
  if (s.growthTrajectory === "steep") base += 0.06;
  if (s.growthTrajectory === "steady") base += 0.03;

  // Context-specific boosts
  const isLeadershipRole = /manager|lead|director|head of|principal|staff|vp|chief/i.test(jd);
  if (isLeadershipRole) base += (s.leadershipScore / 100) * 0.1;

  const isTeamRole = /team|cross.functional|collaborate|mentor/i.test(jd);
  if (isTeamRole) base += (s.collaborationScore / 100) * 0.05;

  return Math.min(base, 1.0);
}

// ─── Recruiter Insight Generation ─────────────────────────────────────────────

function generateInsight(
  candidate: Candidate,
  breakdown: { semantic: number; keyword: number; experience: number; behavioral: number },
  matchedSkills: string[],
  jd: string
): string {
  const parts: string[] = [];
  const overall = breakdown.semantic * 0.35 + breakdown.keyword * 0.30 + breakdown.experience * 0.20 + breakdown.behavioral * 0.15;
  const score = Math.round(overall * 100);

  // Lead with what drives the match
  if (breakdown.semantic > 0.65) {
    const topDomain = candidate.industries[0] ?? "this domain";
    parts.push(
      `${candidate.name}'s career trajectory maps closely to this role's scope — the semantic alignment between their background in ${topDomain} and the job context is strong, suggesting they've operated in the same problem space, not just used similar keywords.`
    );
  } else if (breakdown.keyword > 0.7) {
    const top3 = matchedSkills.slice(0, 3).join(", ");
    parts.push(
      `Direct keyword match on core requirements (${top3}) is very high, indicating ${candidate.name} has explicitly worked with the technologies and methodologies you're asking for.`
    );
  } else {
    parts.push(
      `${candidate.name} is a lateral match — their background doesn't map perfectly to every listed requirement, but the overlap is meaningful enough to warrant a conversation.`
    );
  }

  // Experience fit
  const years = candidate.yearsOfExperience;
  const reqYears = extractRequiredYears(jd);
  if (reqYears && Math.abs(years - reqYears) <= 2) {
    parts.push(`At ${years} years of experience, they sit right in the target window.`);
  } else if (reqYears && years > reqYears + 3) {
    parts.push(`With ${years} years, they're somewhat senior for the stated requirements — consider if that's an asset or a flight risk.`);
  } else if (reqYears && years < reqYears) {
    parts.push(`They're ${reqYears - years} year${reqYears - years > 1 ? "s" : ""} short of the stated requirement — but their trajectory suggests they're punching above their experience level.`);
  } else {
    parts.push(`Their ${years} years of hands-on experience are distributed across companies where the craft bar is genuinely high.`);
  }

  // Behavioral / behavioral standout
  const sig = candidate.behavioralSignals;
  const topBehavior = (() => {
    const scores = {
      leadership: sig.leadershipScore,
      collaboration: sig.collaborationScore,
      adaptability: sig.adaptabilityScore
    };
    return Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
  })();

  if (topBehavior[1] >= 88) {
    const behaviorLabel = topBehavior[0] === "leadership"
      ? "leadership signal"
      : topBehavior[0] === "collaboration"
      ? "cross-functional effectiveness"
      : "adaptability to new environments";
    parts.push(`Notably strong ${behaviorLabel} (${topBehavior[1]}/100) — a differentiator at this level.`);
  }

  // Growth trajectory
  if (sig.growthTrajectory === "steep" && score >= 70) {
    parts.push(`Their growth trajectory is steep — they've consistently taken on more scope at each stage, which suggests headroom beyond the immediate role.`);
  }

  // Platform signal
  if (candidate.platformActivity.responseRate === 100) {
    parts.push(`Highly responsive on platform — ${candidate.platformActivity.avgTimeToRespond} average response time, signaling active intent.`);
  }

  // Career pedigree highlight
  const topCompany = candidate.careerHistory[0]?.company;
  if (topCompany) {
    parts.push(`Current role at ${topCompany} adds credibility — it's a high-bar environment that filters for quality.`);
  }

  return parts.join(" ");
}

// ─── Main Ranking Function ─────────────────────────────────────────────────────

export interface RankedCandidate {
  candidate: Candidate;
  fitScore: number;
  recruiterInsight: string;
  scoreBreakdown: {
    semantic: number;
    keyword: number;
    experience: number;
    behavioral: number;
    overall: number;
  };
  matchedSkills: string[];
  rank: number;
}

export function rankCandidates(jobDescription: string, candidates: Candidate[]): RankedCandidate[] {
  const jdTokens = tokenize(jobDescription);
  const allDocs = candidates.map(buildCandidateDoc);
  const avgDocLen = allDocs.reduce((sum, d) => sum + tokenize(d).length, 0) / allDocs.length;
  const requiredYears = extractRequiredYears(jobDescription);

  // Compute raw BM25 scores for normalization
  const rawBm25 = candidates.map((c, i) => bm25Score(jdTokens, allDocs[i], avgDocLen));
  const maxBm25 = Math.max(...rawBm25, 1);

  const scored = candidates.map((candidate, i) => {
    const doc = allDocs[i];

    const semantic = Math.min(tfidfScore(jdTokens, doc, allDocs) * 3.2, 1.0);
    const keyword = Math.min(rawBm25[i] / maxBm25, 1.0);
    const experience = experienceScore(candidate, requiredYears);
    const behavioral = behavioralScore(candidate, jobDescription);

    const overall = semantic * 0.35 + keyword * 0.30 + experience * 0.20 + behavioral * 0.15;

    const matchedSkills = matchSkills(jobDescription, candidate);

    // Skill bonus
    const skillBonus = Math.min(matchedSkills.length * 0.018, 0.12);
    const finalScore = Math.min(overall + skillBonus, 1.0);

    const scoreBreakdown = {
      semantic: Math.round(semantic * 100),
      keyword: Math.round(keyword * 100),
      experience: Math.round(experience * 100),
      behavioral: Math.round(behavioral * 100),
      overall: Math.round(finalScore * 100),
    };

    const recruiterInsight = generateInsight(candidate, {
      semantic,
      keyword,
      experience,
      behavioral,
    }, matchedSkills, jobDescription);

    return {
      candidate,
      fitScore: Math.round(finalScore * 100),
      recruiterInsight,
      scoreBreakdown,
      matchedSkills,
      rank: 0,
    };
  });

  // Sort and assign ranks
  scored.sort((a, b) => b.fitScore - a.fitScore);
  scored.forEach((s, i) => { s.rank = i + 1; });

  return scored;
}

export function getPoolStats(candidates: Candidate[]) {
  const totalCandidates = candidates.length;
  const avgYearsExperience = candidates.reduce((s, c) => s + c.yearsOfExperience, 0) / totalCandidates;

  // Top skills by frequency
  const skillCount = new Map<string, number>();
  for (const c of candidates) {
    for (const s of c.skills) skillCount.set(s, (skillCount.get(s) ?? 0) + 1);
  }
  const topSkills = [...skillCount.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(e => e[0]);

  // Industry breakdown
  const industryBreakdown: Record<string, number> = {};
  for (const c of candidates) {
    for (const ind of c.industries) {
      industryBreakdown[ind] = (industryBreakdown[ind] ?? 0) + 1;
    }
  }

  const avgBehavioralScore = candidates.reduce((s, c) => {
    const avg = (c.behavioralSignals.leadershipScore + c.behavioralSignals.collaborationScore + c.behavioralSignals.adaptabilityScore) / 3;
    return s + avg;
  }, 0) / totalCandidates;

  return {
    totalCandidates,
    avgYearsExperience: Math.round(avgYearsExperience * 10) / 10,
    topSkills,
    industryBreakdown,
    avgBehavioralScore: Math.round(avgBehavioralScore * 10) / 10,
  };
}
