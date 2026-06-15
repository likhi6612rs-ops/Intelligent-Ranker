import { Router } from "express";
import { parseResume } from "../lib/resume-parser.js";
import { rankCandidates } from "../lib/ranking-engine.js";

const router = Router();

router.post("/analyze", (req, res) => {
  const body = req.body as { resumes?: unknown; jobDescription?: unknown };

  const { resumes, jobDescription } = body;

  if (!jobDescription || typeof jobDescription !== "string" || jobDescription.trim().length < 10) {
    res.status(400).json({ error: "jobDescription must be at least 10 characters" });
    return;
  }

  if (!Array.isArray(resumes) || resumes.length === 0) {
    res.status(400).json({ error: "resumes must be a non-empty array" });
    return;
  }

  for (const r of resumes) {
    if (typeof r !== "object" || r === null || typeof (r as { filename?: unknown }).filename !== "string" || typeof (r as { text?: unknown }).text !== "string") {
      res.status(400).json({ error: "Each resume must have { filename: string, text: string }" });
      return;
    }
  }

  const resumeInputs = resumes as { filename: string; text: string }[];

  const parsedCandidates = resumeInputs.map(r => parseResume(r.filename, r.text));
  const rankedCandidates = rankCandidates(jobDescription, parsedCandidates);

  const topScore = rankedCandidates[0]?.fitScore ?? 0;

  res.json({
    rankedCandidates,
    totalAnalyzed: parsedCandidates.length,
    topMatchThreshold: topScore,
    processingStages: [
      "Parsing resume content",
      "Extracting skills and career signals",
      "Running semantic similarity matching",
      "Scoring behavioral signals",
      "Generating recruiter insights",
    ],
  });
});

export default router;
