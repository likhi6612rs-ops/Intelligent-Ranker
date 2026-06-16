import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface LoadingStagesProps {
  resumeCount?: number;
}

export function LoadingStages({ resumeCount = 1 }: LoadingStagesProps) {
  const stages = [
    `Parsing ${resumeCount} resume${resumeCount !== 1 ? "s" : ""}...`,
    "Extracting skills & career signals...",
    "Scoring skills match (50%)...",
    "Scoring experience relevance (30%)...",
    "Scoring experience duration (20%)...",
    "Generating recruiter insights...",
  ];

  const [stageIndex, setStageIndex] = useState(0);
  const [analyzedCount, setAnalyzedCount] = useState(0);

  useEffect(() => {
    const resumeTickInterval = Math.max(600, (1200 * resumeCount) / stages.length);
    let analyzed = 0;

    const interval = setInterval(() => {
      setStageIndex(prev => {
        if (prev < stages.length - 1) return prev + 1;
        return prev;
      });
      // Simulate per-resume progress in the first half of stages
      if (analyzed < resumeCount) {
        analyzed++;
        setAnalyzedCount(analyzed);
      }
    }, resumeTickInterval);

    return () => clearInterval(interval);
  }, [resumeCount]);

  const progress = Math.round(((stageIndex + 1) / stages.length) * 100);

  return (
    <div className="w-full flex flex-col items-center justify-center py-10 space-y-6">
      {/* Resume counter */}
      <div className="flex items-center gap-3">
        {Array.from({ length: resumeCount }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0.6, opacity: 0.2 }}
            animate={{
              scale: i < analyzedCount ? 1 : 0.8,
              opacity: i < analyzedCount ? 1 : 0.3,
            }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
            className="flex flex-col items-center gap-1"
          >
            <div
              className={`w-7 h-8 rounded border flex items-center justify-center text-[10px] font-mono transition-colors duration-300 ${
                i < analyzedCount
                  ? "border-cyan-400/50 bg-cyan-400/10 text-cyan-300"
                  : "border-white/10 bg-white/5 text-white/20"
              }`}
            >
              {i < analyzedCount ? "✓" : i + 1}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Counter label */}
      <p className="text-xs font-mono text-white/30">
        Analyzing{" "}
        <span className="text-white/60 font-bold">{Math.min(analyzedCount + 1, resumeCount)}</span>
        {" "}of{" "}
        <span className="text-white/60 font-bold">{resumeCount}</span> resume{resumeCount !== 1 ? "s" : ""}
      </p>

      {/* Progress bar */}
      <div className="w-full max-w-xs h-1.5 bg-white/5 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-cyan-500 to-violet-500 rounded-full"
          initial={{ width: "0%" }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>

      {/* Stage label */}
      <div className="h-5 relative w-full max-w-xs text-center overflow-hidden">
        <AnimatePresence mode="popLayout">
          <motion.p
            key={stageIndex}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="text-xs font-mono text-white/40 absolute inset-0"
          >
            {stages[stageIndex]}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* Weight reminder */}
      <div className="flex items-center gap-4 text-[10px] font-mono text-white/20 mt-2">
        <span><span className="text-cyan-400/40">50%</span> skills</span>
        <span><span className="text-violet-400/40">30%</span> relevance</span>
        <span><span className="text-emerald-400/40">20%</span> duration</span>
      </div>
    </div>
  );
}
