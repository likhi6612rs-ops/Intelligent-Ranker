import React, { useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown, ChevronUp, Cpu, Star, Users, RefreshCw,
  ArrowLeft, Crosshair, AlertTriangle, RotateCcw, TriangleAlert,
  MessageSquare, Search, ClipboardList, Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { LoadingStages } from "@/components/loading-stages";
import { useSession } from "@/context/session";
import { useAnalyzeResumes } from "@workspace/api-client-react";
import type { RankedCandidate } from "@workspace/api-client-react";
import { AuroraShaderBackground } from "@/components/ui/aurora-shader-background";

// ─── Default weights ──────────────────────────────────────────────────────────

const DEFAULT_WEIGHTS = { skillsMatch: 50, experienceRelevance: 30, experienceDuration: 20 };
type Weights = typeof DEFAULT_WEIGHTS;

// ─── Weight sliders ───────────────────────────────────────────────────────────

const WEIGHT_META = [
  { key: "skillsMatch" as const, label: "Skills Match", color: "#22d3ee", colorCls: "bg-cyan-400" },
  { key: "experienceRelevance" as const, label: "Experience Relevance", color: "#a78bfa", colorCls: "bg-violet-400" },
  { key: "experienceDuration" as const, label: "Experience Duration", color: "#34d399", colorCls: "bg-emerald-400" },
];

function WeightSliders({ weights, onChange }: { weights: Weights; onChange: (w: Weights) => void }) {
  const total = weights.skillsMatch + weights.experienceRelevance + weights.experienceDuration;
  const isBalanced = Math.abs(total - 100) <= 1;

  function handleSlider(key: keyof Weights, newVal: number) {
    const others = WEIGHT_META.filter(m => m.key !== key);
    const remaining = 100 - newVal;
    const currentOtherTotal = others.reduce((s, m) => s + weights[m.key], 0);
    const updated: Weights = { ...weights, [key]: newVal };
    if (currentOtherTotal === 0) {
      const split = Math.floor(remaining / others.length);
      others.forEach((m, i) => { updated[m.key] = i === others.length - 1 ? remaining - split * (others.length - 1) : split; });
    } else {
      others.forEach(m => { updated[m.key] = Math.round((weights[m.key] / currentOtherTotal) * remaining); });
    }
    WEIGHT_META.forEach(m => { updated[m.key] = Math.max(0, Math.min(100, updated[m.key])); });
    onChange(updated);
  }

  return (
    <div className="space-y-3 bg-white/[0.02] border border-white/8 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs font-semibold text-white/60 uppercase tracking-widest">Recruiter Priority Weights</p>
        <div className="flex items-center gap-3">
          {!isBalanced && <span className="text-[10px] text-amber-400/70 font-mono">Total: {total}%</span>}
          <button onClick={() => onChange(DEFAULT_WEIGHTS)} className="text-[10px] text-white/25 hover:text-white/50 font-mono flex items-center gap-1 transition-colors">
            <RotateCcw className="w-2.5 h-2.5" /> Reset
          </button>
        </div>
      </div>
      {WEIGHT_META.map(({ key, label, color, colorCls }) => (
        <div key={key} className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
              <span className="text-white/50">{label}</span>
            </div>
            <span className="font-mono font-bold text-white/80">{weights[key]}%</span>
          </div>
          <div className="relative h-2 bg-white/5 rounded-full">
            <div className={`absolute inset-y-0 left-0 rounded-full transition-all ${colorCls} opacity-60`} style={{ width: `${weights[key]}%` }} />
            <input type="range" min={0} max={100} value={weights[key]} onChange={e => handleSlider(key, parseInt(e.target.value))} className="absolute inset-0 w-full opacity-0 cursor-pointer h-full" />
          </div>
        </div>
      ))}
      <p className="text-[10px] text-white/20 font-mono pt-1">Adjusting one dimension auto-balances the others · Total must equal 100%</p>
    </div>
  );
}

// ─── Weighted bar ─────────────────────────────────────────────────────────────

function WeightedBar({ label, weight, value, color }: { label: string; weight: string; value: number; color: string }) {
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
        <motion.div className="h-full rounded-full" style={{ backgroundColor: color }} initial={{ width: 0 }} animate={{ width: `${value}%` }} transition={{ duration: 0.9, ease: "easeOut" }} />
      </div>
    </div>
  );
}

// ─── Score Arc ────────────────────────────────────────────────────────────────

function ScoreArc({ score, rank }: { score: number; rank: number }) {
  const r = 34;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 80 ? "#22d3ee" : score >= 60 ? "#a78bfa" : score >= 40 ? "#fb923c" : "#ef4444";
  const badge = rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : null;
  return (
    <div className="relative flex items-center justify-center w-[76px] h-[76px] shrink-0">
      <svg className="w-[76px] h-[76px] -rotate-90" viewBox="0 0 84 84">
        <circle cx="42" cy="42" r={r} fill="none" stroke="white" strokeOpacity="0.05" strokeWidth="6" />
        <motion.circle cx="42" cy="42" r={r} fill="none" stroke={color} strokeWidth="6" strokeLinecap="round" strokeDasharray={circ} initial={{ strokeDashoffset: circ }} animate={{ strokeDashoffset: offset }} transition={{ duration: 1.2, ease: "easeOut", delay: rank * 0.04 }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-base font-bold text-white leading-none">{score}</span>
        {badge && <span className="text-xs leading-none mt-0.5">{badge}</span>}
      </div>
    </div>
  );
}

// ─── Recruiter Toolkit Panel ─────────────────────────────────────────────────

type ToolkitTab = "justification" | "gaps" | "questions";

function RecruiterToolkit({ ranked }: { ranked: RankedCandidate }) {
  const [activeTab, setActiveTab] = useState<ToolkitTab>("justification");

  const tabs: { id: ToolkitTab; label: string; icon: React.ReactNode; count?: number }[] = [
    { id: "justification", label: "Ranking Rationale", icon: <Sparkles className="w-3.5 h-3.5" /> },
    { id: "gaps", label: "Gap Analysis", icon: <Search className="w-3.5 h-3.5" />, count: ranked.gapAnalysis.length },
    { id: "questions", label: "Interview Qs", icon: <MessageSquare className="w-3.5 h-3.5" />, count: ranked.interviewQuestions.length },
  ];

  return (
    <div className="bg-white/[0.02] border border-white/8 rounded-xl overflow-hidden">
      {/* Tab header */}
      <div className="flex border-b border-white/5">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-2.5 text-[11px] font-medium transition-colors ${
              activeTab === tab.id ? "text-white bg-white/5 border-b border-cyan-400/40" : "text-white/30 hover:text-white/60"
            }`}
          >
            {tab.icon}
            <span className="hidden sm:inline">{tab.label}</span>
            {tab.count !== undefined && (
              <span className={`text-[9px] font-mono rounded-full px-1.5 py-0.5 ${activeTab === tab.id ? "bg-cyan-400/20 text-cyan-300/80" : "bg-white/5 text-white/25"}`}>{tab.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="p-4">
        <AnimatePresence mode="wait">
          {/* ── Justification ── */}
          {activeTab === "justification" && (
            <motion.div key="justification" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-3">
              <p className="text-[10px] text-white/25 uppercase tracking-widest font-mono">Why this candidate ranks #{ranked.rank}</p>
              <p className="text-sm text-white/70 leading-relaxed">{ranked.justification}</p>
            </motion.div>
          )}

          {/* ── Gap Analysis ── */}
          {activeTab === "gaps" && (
            <motion.div key="gaps" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-3">
              <p className="text-[10px] text-white/25 uppercase tracking-widest font-mono">Top skill gaps + how to probe them</p>
              {ranked.gapAnalysis.length === 0 ? (
                <p className="text-sm text-white/40 italic">No significant skill gaps identified — strong alignment with the JD requirements.</p>
              ) : (
                ranked.gapAnalysis.map((gap, i) => (
                  <div key={i} className="space-y-2 bg-white/[0.03] border border-white/5 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-amber-400/10 border border-amber-400/20 flex items-center justify-center shrink-0">
                        <span className="text-[10px] font-bold text-amber-300/70">{i + 1}</span>
                      </div>
                      <span className="text-xs font-semibold text-amber-200/80">{gap.skill}</span>
                    </div>
                    <div className="ml-7">
                      <p className="text-[10px] text-white/25 uppercase tracking-widest mb-1 font-mono">Probe question</p>
                      <p className="text-xs text-white/55 leading-relaxed italic">"{gap.probeQuestion}"</p>
                    </div>
                  </div>
                ))
              )}
            </motion.div>
          )}

          {/* ── Interview Questions ── */}
          {activeTab === "questions" && (
            <motion.div key="questions" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-3">
              <p className="text-[10px] text-white/25 uppercase tracking-widest font-mono">Tailored situational questions</p>
              {ranked.interviewQuestions.map((q, i) => (
                <div key={i} className="flex gap-3 bg-white/[0.03] border border-white/5 rounded-lg p-3">
                  <div className="w-6 h-6 rounded-full bg-violet-400/10 border border-violet-400/20 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-[10px] font-bold text-violet-300/70">Q{i + 1}</span>
                  </div>
                  <p className="text-sm text-white/65 leading-relaxed">{q}</p>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Candidate Card ───────────────────────────────────────────────────────────

type CardTab = "breakdown" | "toolkit";

function CandidateCard({ ranked, weights }: { ranked: RankedCandidate; weights: Weights }) {
  const [expanded, setExpanded] = useState(false);
  const [cardTab, setCardTab] = useState<CardTab>("breakdown");
  const { candidate, fitScore, recruiterInsight, scoreBreakdown, matchedSkills, rank } = ranked;
  const isEntryLevel = candidate.isEntryLevel;
  const expLabel = isEntryLevel ? "Entry Level" : `${candidate.yearsOfExperiencePrecise.toFixed(1)} yrs`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: rank * 0.05 }}
      className={`border rounded-2xl overflow-hidden transition-all duration-200 ${
        rank === 1 ? "border-cyan-400/30 bg-cyan-400/[0.02]" : rank <= 3 ? "border-violet-400/20 bg-white/[0.02]" : "border-white/5 bg-white/[0.015]"
      }`}
    >
      {/* Summary row */}
      <div className="flex items-start gap-4 p-5">
        <ScoreArc score={fitScore} rank={rank} />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-0.5">
            <div>
              <h3 className="font-semibold text-white text-[15px] leading-tight">{candidate.name}</h3>
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

          {/* Score pills */}
          <div className="flex flex-wrap gap-2 mt-2.5 mb-3">
            {[
              { label: "Skills", value: scoreBreakdown.skillsMatch, color: "#22d3ee", weight: `${weights.skillsMatch}%` },
              { label: "Relevance", value: scoreBreakdown.experienceRelevance, color: "#a78bfa", weight: `${weights.experienceRelevance}%` },
              { label: "Duration", value: scoreBreakdown.experienceDuration, color: "#34d399", weight: `${weights.experienceDuration}%` },
            ].map(({ label, value, color, weight }) => (
              <div key={label} className="flex items-center gap-1.5 bg-white/[0.04] border border-white/5 rounded-lg px-2.5 py-1">
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
                <span className="text-[10px] text-white/40 font-mono">{label}</span>
                <span className="text-xs font-bold font-mono text-white/80">{value}</span>
                <span className="text-[9px] text-white/20 font-mono">{weight}</span>
              </div>
            ))}
            <div className="flex items-center gap-1.5 bg-white/[0.04] border border-white/5 rounded-lg px-2.5 py-1">
              <span className="text-[10px] text-white/40 font-mono">Exp</span>
              <span className="text-xs font-mono text-white/70">{expLabel}</span>
            </div>
          </div>

          <p className="text-sm text-white/50 leading-relaxed line-clamp-2">{recruiterInsight}</p>

          {matchedSkills.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              {matchedSkills.slice(0, 6).map(s => (
                <span key={s} className="text-[10px] bg-cyan-400/10 text-cyan-300/70 border border-cyan-400/15 px-2 py-0.5 rounded-full font-mono">{s}</span>
              ))}
              {matchedSkills.length > 6 && <span className="text-[10px] text-white/25 px-2 py-0.5">+{matchedSkills.length - 6} more</span>}
            </div>
          )}
        </div>
      </div>

      {/* Expand toggle */}
      <button
        onClick={() => setExpanded(x => !x)}
        className="w-full flex items-center justify-between px-5 py-2.5 text-[11px] text-white/25 hover:text-white/50 border-t border-white/5 transition-colors"
      >
        <span className="flex items-center gap-1.5">
          <ClipboardList className="w-3.5 h-3.5" />
          Score breakdown · Gap analysis · Interview questions
        </span>
        {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
      </button>

      {/* Expanded panel */}
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="px-5 pb-5 pt-4 border-t border-white/5 space-y-5">

              {/* Inner tabs: Scores vs Toolkit */}
              <div className="flex gap-2">
                {(["breakdown", "toolkit"] as CardTab[]).map(t => (
                  <button
                    key={t}
                    onClick={() => setCardTab(t)}
                    className={`text-[11px] font-mono px-3.5 py-1.5 rounded-lg border transition-colors ${
                      cardTab === t ? "bg-white/8 border-white/15 text-white/80" : "border-white/5 text-white/30 hover:text-white/55"
                    }`}
                  >
                    {t === "breakdown" ? "Score Breakdown" : "🤖 Recruiter Toolkit"}
                  </button>
                ))}
              </div>

              {/* Score Breakdown tab */}
              {cardTab === "breakdown" && (
                <div className="space-y-3">
                  <WeightedBar label="Skills Match" weight={`${weights.skillsMatch}%`} value={scoreBreakdown.skillsMatch} color="#22d3ee" />
                  <WeightedBar label="Experience Relevance" weight={`${weights.experienceRelevance}%`} value={scoreBreakdown.experienceRelevance} color="#a78bfa" />
                  <WeightedBar label="Experience Duration" weight={`${weights.experienceDuration}%`} value={scoreBreakdown.experienceDuration} color="#34d399" />
                  <div className="flex items-center justify-between pt-1 border-t border-white/5">
                    <span className="text-xs text-white/40 font-mono">Weighted Total</span>
                    <span className="text-sm font-bold font-mono text-white">{scoreBreakdown.overall} / 100</span>
                  </div>

                  {/* Detail grid */}
                  <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                    <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
                      <p className="text-white/30 mb-1 text-[10px] uppercase tracking-widest">Experience</p>
                      <p className="text-white font-mono font-semibold">{isEntryLevel ? "None" : `${candidate.yearsOfExperiencePrecise.toFixed(1)} years`}</p>
                      {isEntryLevel && <p className="text-amber-400/60 text-[10px] mt-0.5">Entry Level</p>}
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

                  {/* Career history */}
                  {candidate.careerHistory.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-[10px] text-white/25 uppercase tracking-widest font-mono">Career History</p>
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
                                <li key={j} className="text-xs text-white/35 flex gap-1.5"><span className="text-white/20 shrink-0">·</span>{h}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Recruiter Toolkit tab */}
              {cardTab === "toolkit" && <RecruiterToolkit ranked={ranked} />}
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
  const [weights, setWeights] = useState<Weights>(DEFAULT_WEIGHTS);
  const [jdError, setJdError] = useState<string | null>(null);
  const mutation = useAnalyzeResumes();
  const isAnalyzing = mutation.isPending;

  const handleAnalyze = () => {
    if (jobDescription.trim().length < 10 || resumes.length === 0) return;
    setJdError(null);
    mutation.mutate(
      { data: { resumes: resumes.map(r => ({ filename: r.filename, text: r.text })), jobDescription, weights } },
      {
        onSuccess: data => setResults(data),
        onError: async (err: unknown) => {
          const resp = err as { response?: Response };
          if (resp?.response) {
            try {
              const body = await resp.response.clone().json() as { error?: string; code?: string };
              if (body.code === "INVALID_JD") { setJdError(body.error ?? "Invalid job description."); return; }
            } catch { /* ignore */ }
          }
          setJdError("Analysis failed. Please try again.");
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      {/* Header */}
      <header className="border-b border-white/5 px-6 py-4 flex items-center justify-between sticky top-0 z-20 bg-neutral-950/80 backdrop-blur">
        <button onClick={() => navigate("/upload")} className="text-white/40 hover:text-white/80 transition-colors text-sm font-mono flex items-center gap-2">
          <ArrowLeft className="w-3.5 h-3.5" /> Edit Resumes
        </button>
        <div className="flex items-center gap-2">
          <Crosshair className="w-4 h-4 text-cyan-400/60" />
          <span className="text-sm font-semibold text-white/80">TalentLens</span>
          <span className="text-xs text-white/20 font-mono ml-1">{resumes.length} resumes</span>
        </div>
        {results
          ? <button onClick={() => { setResults(null); setJdError(null); }} className="text-white/30 hover:text-white/60 text-xs font-mono flex items-center gap-1.5 transition-colors"><RefreshCw className="w-3.5 h-3.5" /> New Analysis</button>
          : <div className="w-24" />
        }
      </header>

      <div className="max-w-3xl mx-auto px-6 py-10">

        {/* JD input + weight config */}
        {!results && !isAnalyzing && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
            <div>
              <h1 className="text-3xl font-bold mb-1">Define the Target Role</h1>
              <p className="text-white/40 text-sm leading-relaxed">
                Paste a complete job description. The engine extracts required skills, experience thresholds, and role scope — then ranks candidates using your configured weights, with explainable rationale and per-candidate interview questions.
              </p>
            </div>

            <WeightSliders weights={weights} onChange={setWeights} />

            <div className="space-y-2">
              <Textarea
                placeholder="Paste the full job description here — role title, responsibilities, required skills, years of experience, qualifications…"
                value={jobDescription}
                onChange={e => { setJobDescription(e.target.value); setJdError(null); }}
                className={`min-h-[240px] bg-white/[0.03] text-white placeholder:text-white/20 resize-none text-sm leading-relaxed transition-colors ${jdError ? "border-red-500/50 focus:border-red-500/70" : "border-white/10 focus:border-white/25"}`}
              />
              <AnimatePresence>
                {jdError && (
                  <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="flex items-start gap-3 bg-red-500/10 border border-red-500/25 rounded-xl px-4 py-3">
                    <TriangleAlert className="w-4 h-4 text-red-400/80 shrink-0 mt-0.5" />
                    <p className="text-sm text-red-300/80 leading-relaxed">{jdError}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-white/20">{jobDescription.length} chars · {resumes.length} resume{resumes.length !== 1 ? "s" : ""} queued</span>
              <Button onClick={handleAnalyze} disabled={jobDescription.trim().length < 10} className="bg-white text-black hover:bg-white/90 font-semibold px-8 py-2.5 rounded-xl disabled:opacity-30">
                <Cpu className="w-4 h-4 mr-2" /> Run Smart Analysis
              </Button>
            </div>
          </motion.div>
        )}

        {/* Loading */}
        {isAnalyzing && <div className="mt-8"><LoadingStages resumeCount={resumes.length} /></div>}

        {/* Results */}
        {results && !isAnalyzing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <AuroraShaderBackground />

            <div className="flex flex-wrap items-center gap-5 text-sm py-4 border-b border-white/5">
              <div className="flex items-center gap-2 text-white/50">
                <Users className="w-4 h-4 text-cyan-400/50" />
                <span className="font-mono text-white font-semibold">{results.totalAnalyzed}</span> analyzed
              </div>
              <div className="flex items-center gap-2 text-white/50">
                <Star className="w-4 h-4 text-amber-400/50" />
                <span className="font-mono text-white font-semibold">{results.topMatchThreshold}</span> top score
              </div>
              <div className="ml-auto flex items-center gap-1.5 text-[10px] font-mono text-white/25 border border-white/5 rounded-lg px-3 py-1.5">
                <span className="text-cyan-400/50">{weights.skillsMatch}%</span> skills ·
                <span className="text-violet-400/50">{weights.experienceRelevance}%</span> rel ·
                <span className="text-emerald-400/50">{weights.experienceDuration}%</span> dur
              </div>
            </div>

            <div className="space-y-4">
              {results.rankedCandidates.map((ranked: RankedCandidate) => (
                <CandidateCard key={ranked.candidate.id} ranked={ranked} weights={weights} />
              ))}
            </div>

            <div className="text-center pt-4">
              <button onClick={() => { setResults(null); setJdError(null); }} className="text-xs text-white/25 hover:text-white/50 font-mono flex items-center gap-1.5 transition-colors mx-auto">
                <RefreshCw className="w-3.5 h-3.5" /> Run with different job description or weights
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
