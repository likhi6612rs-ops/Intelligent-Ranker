import React, { useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, Cpu, Star, Users, RefreshCw, ArrowLeft, Crosshair } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { LoadingStages } from "@/components/loading-stages";
import { useSession } from "@/context/session";
import { useAnalyzeResumes } from "@workspace/api-client-react";
import type { RankedCandidate } from "@workspace/api-client-react";

// ─── Score Arc ────────────────────────────────────────────────────────────────

function ScoreArc({ score, rank }: { score: number; rank: number }) {
  const r = 36;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 80 ? "#22d3ee" : score >= 60 ? "#a78bfa" : "#6b7280";
  const badge = rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : null;

  return (
    <div className="relative flex items-center justify-center w-20 h-20 shrink-0">
      <svg className="w-20 h-20 -rotate-90" viewBox="0 0 88 88">
        <circle cx="44" cy="44" r={r} fill="none" stroke="white" strokeOpacity="0.05" strokeWidth="6" />
        <motion.circle
          cx="44" cy="44" r={r}
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: "easeOut", delay: rank * 0.05 }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-bold text-white leading-none">{score}</span>
        {badge && <span className="text-xs leading-none mt-0.5">{badge}</span>}
      </div>
    </div>
  );
}

// ─── Score Bar ────────────────────────────────────────────────────────────────

function ScoreBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-white/40">
        <span>{label}</span>
        <span className="font-mono text-white/60">{value}%</span>
      </div>
      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

// ─── Candidate Card ────────────────────────────────────────────────────────────

function CandidateCard({ ranked }: { ranked: RankedCandidate }) {
  const [expanded, setExpanded] = useState(false);
  const { candidate, fitScore, recruiterInsight, scoreBreakdown, matchedSkills, rank } = ranked;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: rank * 0.05 }}
      className={`bg-white/[0.03] border rounded-2xl overflow-hidden transition-all duration-200 ${
        rank === 1
          ? "border-cyan-400/30"
          : rank <= 3
          ? "border-violet-400/20"
          : "border-white/5"
      }`}
    >
      {/* Main row */}
      <div className="flex items-start gap-4 p-5">
        <ScoreArc score={fitScore} rank={rank} />

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <div>
              <h3 className="font-semibold text-white text-base">{candidate.name}</h3>
              <p className="text-xs text-white/40 truncate">{candidate.title}</p>
            </div>
            <span className="text-xs font-mono text-white/25 shrink-0">#{rank}</span>
          </div>

          {/* Recruiter insight */}
          <p className="text-sm text-white/55 leading-relaxed mt-2 line-clamp-2">{recruiterInsight}</p>

          {/* Skill chips */}
          {matchedSkills.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {matchedSkills.slice(0, 6).map(s => (
                <span key={s} className="text-xs bg-cyan-400/10 text-cyan-300/70 border border-cyan-400/15 px-2 py-0.5 rounded-full font-mono">
                  {s}
                </span>
              ))}
              {matchedSkills.length > 6 && (
                <span className="text-xs text-white/25 px-2 py-0.5">+{matchedSkills.length - 6} more</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Expand toggle */}
      <button
        onClick={() => setExpanded(x => !x)}
        className="w-full flex items-center justify-between px-5 py-2.5 text-xs text-white/25 hover:text-white/50 border-t border-white/5 transition-colors"
      >
        <span>Score breakdown & details</span>
        {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 space-y-5 border-t border-white/5 pt-4">
              {/* Score bars */}
              <div className="space-y-2.5">
                <ScoreBar label="Semantic Similarity" value={scoreBreakdown.semantic} color="#22d3ee" />
                <ScoreBar label="Keyword Relevance" value={scoreBreakdown.keyword} color="#a78bfa" />
                <ScoreBar label="Experience Match" value={scoreBreakdown.experience} color="#34d399" />
                <ScoreBar label="Behavioral Signals" value={scoreBreakdown.behavioral} color="#fb923c" />
              </div>

              {/* Details grid */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
                  <p className="text-white/30 mb-1">Experience</p>
                  <p className="text-white font-mono">{candidate.yearsOfExperience}y</p>
                </div>
                <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
                  <p className="text-white/30 mb-1">Industries</p>
                  <p className="text-white truncate">{candidate.industries.slice(0, 2).join(", ") || "—"}</p>
                </div>
                {candidate.education && (
                  <div className="col-span-2 bg-white/[0.02] border border-white/5 rounded-lg p-3">
                    <p className="text-white/30 mb-1">Education</p>
                    <p className="text-white">{candidate.education}</p>
                  </div>
                )}
              </div>

              {/* Behavioral signals */}
              <div className="space-y-1.5">
                <p className="text-xs text-white/30 uppercase tracking-widest">Behavioral Signals</p>
                <div className="flex gap-4 text-xs">
                  {[
                    { label: "Leadership", value: candidate.behavioralSignals.leadershipScore },
                    { label: "Collaboration", value: candidate.behavioralSignals.collaborationScore },
                    { label: "Adaptability", value: candidate.behavioralSignals.adaptabilityScore },
                  ].map(({ label, value }: { label: string; value: number }) => (
                    <div key={label} className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-violet-400/60" />
                      <span className="text-white/40">{label}</span>
                      <span className="font-mono text-white/70">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Career history */}
              {candidate.careerHistory.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs text-white/30 uppercase tracking-widest">Career History</p>
                  {candidate.careerHistory.slice(0, 3).map((entry, i) => (
                    <div key={i} className="bg-white/[0.02] border border-white/5 rounded-lg p-3 space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-xs font-medium text-white/80">{entry.title}</p>
                        <span className="text-xs text-white/25 font-mono shrink-0">{entry.duration}</span>
                      </div>
                      <p className="text-xs text-white/40">{entry.company}</p>
                      {entry.highlights.length > 0 && (
                        <ul className="mt-1.5 space-y-0.5">
                          {entry.highlights.slice(0, 2).map((h, j) => (
                            <li key={j} className="text-xs text-white/35 flex gap-1.5">
                              <span className="text-white/20 shrink-0">·</span>{h}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Loading Stages ───────────────────────────────────────────────────────────

const STAGES = [
  { label: "Parsing resume content", duration: 800 },
  { label: "Extracting skills & career signals", duration: 900 },
  { label: "Running semantic similarity matching", duration: 1100 },
  { label: "Scoring behavioral signals", duration: 700 },
  { label: "Generating recruiter insights", duration: 900 },
];

// ─── Results Page ─────────────────────────────────────────────────────────────

export function ResultsPage() {
  const [, navigate] = useLocation();
  const { resumes, jobDescription, setJobDescription, results, setResults } = useSession();
  const mutation = useAnalyzeResumes();
  const isAnalyzing = mutation.isPending;

  const handleAnalyze = () => {
    if (jobDescription.trim().length < 10 || resumes.length === 0) return;
    mutation.mutate(
      {
        data: {
          resumes: resumes.map(r => ({ filename: r.filename, text: r.text })),
          jobDescription,
        },
      },
      { onSuccess: data => setResults(data) }
    );
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      {/* Header */}
      <header className="border-b border-white/5 px-6 py-4 flex items-center justify-between sticky top-0 z-20 bg-neutral-950/80 backdrop-blur">
        <button
          onClick={() => navigate("/upload")}
          className="text-white/40 hover:text-white/80 transition-colors text-sm font-mono flex items-center gap-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Edit Resumes
        </button>
        <div className="flex items-center gap-2">
          <Crosshair className="w-4 h-4 text-cyan-400/60" />
          <span className="text-sm font-semibold text-white/80">TalentLens</span>
          <span className="text-xs text-white/20 font-mono ml-1">{resumes.length} resumes</span>
        </div>
        {results && (
          <button
            onClick={() => { setResults(null); }}
            className="text-white/30 hover:text-white/60 text-xs font-mono flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" /> New Analysis
          </button>
        )}
      </header>

      <div className="max-w-3xl mx-auto px-6 py-10">
        {/* JD Section */}
        {!results && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
            <div>
              <h1 className="text-3xl font-bold mb-1">Define the Target Role</h1>
              <p className="text-white/40 text-sm">
                Paste the job description below. The engine will extract semantic requirements, keywords, and behavioral traits — then rank your {resumes.length} candidate{resumes.length !== 1 ? "s" : ""}.
              </p>
            </div>

            <Textarea
              placeholder="Paste job description here — role, requirements, stack, team context, soft skills…"
              value={jobDescription}
              onChange={e => setJobDescription(e.target.value)}
              className="min-h-[260px] bg-white/[0.03] border-white/10 text-white placeholder:text-white/20 resize-none focus:border-white/25 text-sm leading-relaxed"
            />

            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-white/20">{jobDescription.length} chars</span>
              <Button
                onClick={handleAnalyze}
                disabled={jobDescription.trim().length < 10 || isAnalyzing}
                className="bg-white text-black hover:bg-white/90 font-semibold px-8 py-2.5 rounded-xl disabled:opacity-30"
              >
                <Cpu className="w-4 h-4 mr-2" />
                Run Smart Analysis
              </Button>
            </div>
          </motion.div>
        )}

        {/* Loading */}
        {isAnalyzing && (
          <div className="mt-8">
            <LoadingStages />
          </div>
        )}

        {/* Results */}
        {results && !isAnalyzing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            {/* Stats bar */}
            <div className="flex items-center gap-6 text-sm py-4 border-b border-white/5">
              <div className="flex items-center gap-2 text-white/50">
                <Users className="w-4 h-4 text-cyan-400/50" />
                <span className="font-mono text-white font-semibold">{results.totalAnalyzed}</span> analyzed
              </div>
              <div className="flex items-center gap-2 text-white/50">
                <Star className="w-4 h-4 text-amber-400/50" />
                <span className="font-mono text-white font-semibold">{results.topMatchThreshold}</span> top score
              </div>
              <button
                onClick={() => { setResults(null); }}
                className="ml-auto text-xs text-white/30 hover:text-white/60 font-mono flex items-center gap-1.5 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Try different JD
              </button>
            </div>

            {/* Candidate cards */}
            <div className="space-y-4">
              {results.rankedCandidates.map((ranked: RankedCandidate) => (
                <CandidateCard key={ranked.candidate.id} ranked={ranked} />
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
