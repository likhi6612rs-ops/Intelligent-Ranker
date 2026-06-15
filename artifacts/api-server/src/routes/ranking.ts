import { Router } from "express";
import { candidates } from "../data/candidates.js";
import { rankCandidates, getPoolStats } from "../lib/ranking-engine.js";

const router = Router();

router.post("/analyze", (req, res) => {
  const { jobDescription } = req.body as { jobDescription?: string };
  if (!jobDescription || typeof jobDescription !== "string" || jobDescription.trim().length < 10) {
    res.status(400).json({ error: "jobDescription must be at least 10 characters" });
    return;
  }

  const rankedCandidates = rankCandidates(jobDescription, candidates);

  const topScore = rankedCandidates[0]?.fitScore ?? 0;

  res.json({
    rankedCandidates,
    totalAnalyzed: candidates.length,
    topMatchThreshold: topScore,
    processingStages: [
      "Vectorizing candidate profiles",
      "Running semantic similarity matching",
      "Scoring behavioral signals",
      "Generating recruiter insights",
    ],
  });
});

router.get("/stats", (_req, res) => {
  res.json(getPoolStats(candidates));
});

export default router;
