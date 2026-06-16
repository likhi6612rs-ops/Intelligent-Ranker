import { Router } from "express";
import { parseResume } from "../lib/resume-parser.js";
import { rankCandidates } from "../lib/ranking-engine.js";

const router = Router();

// ─── JD Validation ───────────────────────────────────────────────────────────

const JD_SIGNAL_WORDS = [
  // Role indicators
  "role","position","responsibilities","duties","job","title","department",
  // Requirement indicators
  "requirements","qualifications","required","preferred","must","minimum",
  "experience","years","degree","bachelor","master","phd",
  // Skill/task indicators
  "skills","ability","knowledge","familiar","proficient","expertise",
  "build","develop","design","manage","lead","collaborate","analyze",
  "implement","maintain","support","deliver","communicate",
  // Company / culture indicators
  "team","company","organization","candidate","offer","salary","benefits",
  "remote","hybrid","onsite","full-time","part-time",
];

const JOB_TITLE_WORDS = [
  "engineer","developer","designer","analyst","manager","director","scientist",
  "architect","lead","head","specialist","consultant","officer","coordinator",
  "associate","intern","researcher","recruiter","executive","administrator",
];

function validateJobDescription(jd: string): { valid: boolean; reason?: string } {
  const trimmed = jd.trim();

  // Too short to be a real JD
  if (trimmed.length < 80) {
    return {
      valid: false,
      reason:
        "Invalid Job Description provided. Please provide a full description including qualifications, responsibilities, and required skills.",
    };
  }

  const lower = trimmed.toLowerCase();
  const words = lower.split(/\s+/);
  const wordSet = new Set(words);

  // Must contain at least 3 signal words
  const signalMatches = JD_SIGNAL_WORDS.filter(w => lower.includes(w)).length;
  if (signalMatches < 3) {
    // Allow if it contains a job title word and some content
    const hasTitle = JOB_TITLE_WORDS.some(w => lower.includes(w));
    const hasEnoughContent = wordSet.size >= 30;
    if (!hasTitle || !hasEnoughContent) {
      return {
        valid: false,
        reason:
          "Invalid Job Description provided. The input does not appear to contain job responsibilities or qualification requirements. Please paste a complete job description.",
      };
    }
  }

  return { valid: true };
}

// ─── Route ────────────────────────────────────────────────────────────────────

router.post("/analyze", (req, res) => {
  const body = req.body as {
    resumes?: unknown;
    jobDescription?: unknown;
    weights?: unknown;
  };

  const { resumes, jobDescription, weights: rawWeights } = body;

  // Basic input validation
  if (!jobDescription || typeof jobDescription !== "string" || jobDescription.trim().length < 10) {
    res.status(400).json({ error: "jobDescription must be at least 10 characters" });
    return;
  }

  if (!Array.isArray(resumes) || resumes.length === 0) {
    res.status(400).json({ error: "resumes must be a non-empty array" });
    return;
  }

  for (const r of resumes) {
    if (
      typeof r !== "object" ||
      r === null ||
      typeof (r as { filename?: unknown }).filename !== "string" ||
      typeof (r as { text?: unknown }).text !== "string"
    ) {
      res.status(400).json({ error: "Each resume must have { filename: string, text: string }" });
      return;
    }
  }

  // JD guardrail — reject non-job-description inputs
  const jdCheck = validateJobDescription(jobDescription);
  if (!jdCheck.valid) {
    res.status(422).json({ error: jdCheck.reason, code: "INVALID_JD" });
    return;
  }

  // Parse optional recruiter weights (default 50/30/20)
  let weights = { skillsMatch: 50, experienceRelevance: 30, experienceDuration: 20 };
  if (rawWeights && typeof rawWeights === "object" && !Array.isArray(rawWeights)) {
    const w = rawWeights as Record<string, unknown>;
    const sm = Number(w.skillsMatch);
    const er = Number(w.experienceRelevance);
    const ed = Number(w.experienceDuration);
    if (!isNaN(sm) && !isNaN(er) && !isNaN(ed)) {
      const total = sm + er + ed;
      if (total > 0) {
        // Normalize so they always sum to 100
        weights = {
          skillsMatch: Math.round((sm / total) * 100),
          experienceRelevance: Math.round((er / total) * 100),
          experienceDuration: Math.round((ed / total) * 100),
        };
      }
    }
  }

  const resumeInputs = resumes as { filename: string; text: string }[];
  const parsedCandidates = resumeInputs.map(r => parseResume(r.filename, r.text));
  const rankedCandidates = rankCandidates(jobDescription, parsedCandidates, weights);

  const topScore = rankedCandidates[0]?.fitScore ?? 0;

  res.json({
    rankedCandidates,
    totalAnalyzed: parsedCandidates.length,
    topMatchThreshold: topScore,
    processingStages: [
      `Parsing ${parsedCandidates.length} resume${parsedCandidates.length !== 1 ? "s" : ""}`,
      "Extracting skills and career signals",
      "Scoring skills match (50%)",
      "Scoring experience relevance (30%)",
      "Scoring experience duration (20%)",
      "Generating recruiter insights",
    ],
  });
});

export default router;
