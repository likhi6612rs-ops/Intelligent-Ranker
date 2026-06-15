import { Router } from "express";
import { candidates } from "../data/candidates.js";

const router = Router();

router.get("/", (_req, res) => {
  res.json(candidates);
});

router.get("/:id", (req, res) => {
  const candidate = candidates.find(c => c.id === req.params.id);
  if (!candidate) {
    res.status(404).json({ error: "Candidate not found" });
    return;
  }
  res.json(candidate);
});

export default router;
