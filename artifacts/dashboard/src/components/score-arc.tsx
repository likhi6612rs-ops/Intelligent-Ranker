import React from "react";
import { motion } from "framer-motion";

interface ScoreArcProps {
  score: number;
  size?: number;
  strokeWidth?: number;
}

export function ScoreArc({ score, size = 80, strokeWidth = 6 }: ScoreArcProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const arcLength = (score / 100) * circumference;
  
  let color = "var(--color-destructive)"; // Red < 60
  if (score >= 80) color = "var(--color-chart-4)"; // Green >= 80
  else if (score >= 60) color = "var(--color-chart-3)"; // Yellow 60-79

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90 transform">
        {/* Background Arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted"
        />
        {/* Foreground Arc */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={circumference}
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - arcLength }}
          transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-bold font-mono tracking-tighter" style={{ color }}>{score}</span>
      </div>
    </div>
  );
}
