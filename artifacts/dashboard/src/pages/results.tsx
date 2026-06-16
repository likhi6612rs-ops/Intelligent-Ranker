import React, { useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, Cpu, Star, Users, RefreshCw, ArrowLeft, Crosshair, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { LoadingStages } from "@/components/loading-stages";
import { useSession } from "@/context/session";
import { useAnalyzeResumes } from "@workspace/api-client-react";
import type { RankedCandidate } from "@workspace/api-client-react";

// ─── Weighted bar — shows weight label + score ────────────────────────────────

function WeightedBar({
  label,
  weight,
  value,
  color,
}: {
  label: string;
  weight: string;
  value: number;
  color: string;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between text-xs">
        <span className="text-white/50 font-medium">{label}</span>
        <div className="flex items-baseline gap-1.5">
          <span className="text-white/25 font-mono text-[10px]">{weight}</span>
          <span className="font-mono font-bold" style={{ color }}>{value}</span>
        </div>
      </div>
      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.9, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

// ─── Score Arc ────────────────────────────────────────────────────────────────

function ScoreArc({ score, rank }: { score: number; rank: number }) {
  const r = 34;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color =
    score >= 80 ? "#22d3ee" : score >= 60 ? "#a78bfa" : score >= 40 ? "#fb923c" : "#ef4444";
  const badge = rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : null;

  return (
    <div className="relative flex items-center justify-center w-[76px] h-[76px] shrink-0">
      <svg className="w-[76px] h-[76px] -rotate-90" viewBox="0 0 84 84">
        <circle cx="42" cy="42" r={r} fill="none" stroke="white" strokeOpacity="0.05" strokeWidth="6" />
        <motion.circle
          cx="42" cy="42" r={r}
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: "easeOut", delay: rank * 0.04 }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-base font-bold text-white leading-none">{score}</span>
        {badge && <span className="text-xs leading-none mt-0.5">{badge}</span>}
      </div>
    </div>
  );
}

// ─── Candidate Card ────────────────────────────────────────────────────────────

function CandidateCard({ ranked }: { ranked: RankedCandidate }) {
  const [expanded, setExpanded] = useState(false);
  const { candidate, fitScore, recruiterInsight, scoreBreakdown, matchedSkills, rank } = ranked;

  const isEntryLevel = candidate.isEntryLevel;
  const expLabel = isEntryLevel
    ? "Entry Level / No Prior Experience"
    : `${candidate.yearsOfExperiencePrecise.toFixed(1)} yrs`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: rank * 0.05 }}
      className={`border rounded-2xl overflow-hidden transition-all duration-200 ${
        rank === 1
          ? "border-cyan-400/30 bg-cyan-400/[0.02]"
          : rank <= 3
          ? "border-violet-400/20 bg-white/[0.02]"
          : "border-white/5 bg-white/[0.015]"
      }`}
    >
      {/* Main row */}
      <div className="flex items-start gap-4 p-5">
        <ScoreArc score={fitScore} rank={rank} />

        <div className="flex-1 min-w-0">
          {/* Name + rank */}
          <div className="flex items-start justify-between gap-2 mb-0.5">
            <div>
              <h3 className="font-semibold text-white text-[15px] leading-tight">
                {candidate.name}
              </h3>
              <p className="text-xs text-white/40 mt-0.5">{candidate.title}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {isEntryLevel && (
                <span className="flex items-center gap-1 text-[10px] font-mono bg-amber-400/10 text-amber-300/80 border border-amber-400/15 rounded-full px-2 py-0.5">
                  <AlertTriangle className="w-2.5 h-2.5" /> No Experience
                </span>
              )}
              <span className="text-xs font-mono text-white/20">#{rank}</span>
            </div>
          </div>

          {/* Mini score pills: Skills | Relevance | Duration */}
          <div className="flex flex-wrap gap-2 mt-2.5 mb-3">
            {[
              { label: "Skills", value: scoreBreakdown.skillsMatch, color: "#22d3ee", weight: "50%" },
              { label: "Relevance", value: scoreBreakdown.experienceRelevance, color: "#a78bfa", weight: "30%" },
              { label: "Duration", value: scoreBreakdown.experienceDuration, color: "#34d399", weight: "20%" },
            ].map(({ label, value, color, weight }) => (
              <div
                key={label}
                className="flex items-center gap-1.5 bg-white/[0.04] border border-white/5 rounded-lg px-2.5 py-1"
              >
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
                <span className="text-[10px] text-white/40 font-mono">{label}</span>
                <span className="text-xs font-bold font-mono text-white/80">{value}</span>
                <span className="text-[9px] text-white/20 font-mono">{weight}</span>
              </div>
            ))}
            <div className="flex items-center gap-1.5 bg-white/[0.06] border border-white/10 rounded-lg px-2.5 py-1">
              <span className="text-[10px] text-white/50 font-mono">Exp</span>
              <span className="text-xs font-mono text-white/70">{expLabel}</span>
            </div>
          </div>

          {/* Recruiter insight */}
          <p className="text-sm text-white/50 leading-relaxed line-clamp-2">{recruiterInsight}</p>

          {/* Matched skill chips */}
          {matchedSkills.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              {matchedSkills.slice(0, 6).map(s => (
                <span
                  key={s}
                  className="text-[10px] bg-cyan-400/10 text-cyan-300/70 border border-cyan-400/15 px-2 py-0.5 rounded-full font-mono"
                >
                  {s}
                </span>
              ))}
              {matchedSkills.length > 6 && (
                <span className="text-[10px] text-white/25 px-2 py-0.5">+{matchedSkills.length - 6} more</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Expand toggle */}
      <button
        onClick={() => setExpanded(x => !x)}
        className="w-full flex items-center justify-between px-5 py-2.5 text-[11px] text-white/25 hover:text-white/50 border-t border-white/5 transition-colors"
      >
        <span>Full breakdown & details</span>
        {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
      </button>

      {/* Expanded section */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 space-y-5 border-t border-white/5 pt-4">

              {/* Score breakdown bars */}
              <div className="space-y-3">
                <p className="text-[10px] font-mono text-white/25 uppercase tracking-widest mb-1">
                  Score Breakdown (50 / 30 / 20 weights)
                </p>
                <WeightedBar label="Skills Match" weight="50%" value={scoreBreakdown.skillsMatch} color="#22d3ee" />
                <WeightedBar label="Experience Relevance" weight="30%" value={scoreBreakdown.experienceRelevance} color="#a78bfa" />
                <WeightedBar label="Experience Duration" weight="20%" value={scoreBreakdown.experienceDuration} color="#34d399" />
                <div className="flex items-center justify-between pt-1 border-t border-white/5">
                  <span className="text-xs text-white/40 font-mono">Weighted Total</span>
                  <span className="text-sm font-bold font-mono text-white">{scoreBreakdown.overall} / 100</span>
                </div>
              </div>

              {/* Details grid */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
                  <p className="text-white/30 mb-1 text-[10px] uppercase tracking-widest">Experience</p>
                  <p className="text-white font-mono font-semibold">
                    {isEntryLevel ? "None" : `${candidate.yearsOfExperiencePrecise.toFixed(1)} years`}
                  </p>
                  {isEntryLevel && (
                    <p className="text-amber-400/60 text-[10px] mt-0.5">Entry Level</p>
                  )}
                </div>
                <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
                  <p className="text-white/30 mb-1 text-[10px] uppercase tracking-widest">Industries</p>
                  <p className="text-white text-[11px]">{candidate.industries.slice(0, 2).join(", ") || "—"}</p>
                </div>
                {candidate.education && (
                  <div className="col-span-2 bg-white/[0.02] border border-white/5 rounded-lg p-3">
                    <p className="text-white/30 mb-1 text-[10px] uppercase tracking-widest">Education</p>
                    <p className="text-white text-[11px]">{candidate.education}</p>
                  </div>
                )}
              </div>

              {/* Full recruiter insight */}
              <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
                <p className="text-[10px] text-white/30 uppercase tracking-widest mb-2">Recruiter Assessment</p>
                <p className="text-sm text-white/65 leading-relaxed">{recruiterInsight}</p>
              </div>

              {/* Career history */}
              {candidate.careerHistory.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[10px] text-white/30 uppercase tracking-widest">Career History</p>
                  {candidate.careerHistory.slice(0, 3).map((entry, i) => (
                    <div key={i} className="bg-white/[0.02] border border-white/5 rounded-lg p-3 space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-xs font-medium text-white/80">{entry.title}</p>
                        <span className="text-[10px] text-white/25 font-mono shrink-0">{entry.duration}</span>
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
            onClick={() => setResults(null)}
            className="text-white/30 hover:text-white/60 text-xs font-mono flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" /> New Analysis
          </button>
        )}
      </header>

      <div className="max-w-3xl mx-auto px-6 py-10">

        {/* JD input */}
        {!results && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
            <div>
              <h1 className="text-3xl font-bold mb-1">Define the Target Role</h1>
              <p className="text-white/40 text-sm leading-relaxed">
                Paste the job description below. The engine will extract required skills, experience thresholds, and role scope — then rank your {resumes.length} candidate{resumes.length !== 1 ? "s" : ""} using a <span className="text-white/60 font-mono">50 / 30 / 20</span> weighted model.
              </p>
            </div>

            {/* Weight legend */}
            <div className="flex flex-wrap gap-3">
              {[
                { label: "Skills Match", weight: "50%", color: "#22d3ee" },
                { label: "Experience Relevance", weight: "30%", color: "#a78bfa" },
                { label: "Experience Duration", weight: "20%", color: "#34d399" },
              ].map(({ label, weight, color }) => (
                <div key={label} className="flex items-center gap-1.5 bg-white/[0.03] border border-white/5 rounded-lg px-3 py-1.5 text-xs">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                  <span className="text-white/50">{label}</span>
                  <span className="font-mono font-bold text-white/70">{weight}</span>
                </div>
              ))}
            </div>

            <Textarea
              placeholder="Paste job description here — role, required skills, years of experience, responsibilities…"
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
            <div className="flex flex-wrap items-center gap-5 text-sm py-4 border-b border-white/5">
              <div className="flex items-center gap-2 text-white/50">
                <Users className="w-4 h-4 text-cyan-400/50" />
                <span className="font-mono text-white font-semibold">{results.totalAnalyzed}</span> analyzed
              </div>
              <div className="flex items-center gap-2 text-white/50">
                <Star className="w-4 h-4 text-amber-400/50" />
                <span className="font-mono text-white font-semibold">{results.topMatchThreshold}</span> top score
              </div>
              {/* Scoring model badge */}
              <div className="ml-auto flex items-center gap-1.5 text-[10px] font-mono text-white/25 border border-white/5 rounded-lg px-3 py-1.5">
                <span className="text-cyan-400/50">50%</span> skills ·
                <span className="text-violet-400/50">30%</span> relevance ·
                <span className="text-emerald-400/50">20%</span> duration
              </div>
            </div>

            {/* Candidate cards */}
            <div className="space-y-4">
              {results.rankedCandidates.map((ranked: RankedCandidate) => (
                <CandidateCard key={ranked.candidate.id} ranked={ranked} />
              ))}
            </div>

            <div className="text-center pt-4">
              <button
                onClick={() => setResults(null)}
                className="text-xs text-white/25 hover:text-white/50 font-mono flex items-center gap-1.5 transition-colors mx-auto"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Run with different job description
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
