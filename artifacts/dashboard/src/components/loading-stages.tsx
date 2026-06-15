import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const STAGES = [
  "Vectorizing candidate profiles...",
  "Running semantic similarity matching...",
  "Scoring behavioral signals...",
  "Generating recruiter insights..."
];

export function LoadingStages() {
  const [stageIndex, setStageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStageIndex((prev) => (prev < STAGES.length - 1 ? prev + 1 : prev));
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full flex flex-col items-center justify-center p-6 space-y-4">
      <div className="w-full max-w-sm h-2 bg-muted rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-primary"
          initial={{ width: "0%" }}
          animate={{ width: `${((stageIndex + 1) / STAGES.length) * 100}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
      <div className="h-6 relative w-full text-center overflow-hidden">
        <AnimatePresence mode="popLayout">
          <motion.p
            key={stageIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-sm font-mono text-primary animate-pulse absolute inset-0"
          >
            {STAGES[stageIndex]}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
}
