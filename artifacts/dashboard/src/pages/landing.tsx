import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { BackgroundPaths } from "@/components/ui/background-paths";
import { Button } from "@/components/ui/button";

export function Landing() {
  const [, navigate] = useLocation();

  const letters = "TalentLens".split("");

  return (
    <BackgroundPaths>
      <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
        {/* Eyebrow */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="text-[10px] uppercase tracking-[0.4em] text-white/30 font-mono mb-10"
        >
          AI-Powered Candidate Ranking
        </motion.p>

        {/* Title — letter-by-letter spring animation */}
        <h1 className="flex items-center justify-center font-bold leading-none mb-8 overflow-visible">
          {letters.map((letter, i) => (
            <motion.span
              key={i}
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{
                delay: 0.5 + i * 0.045,
                type: "spring",
                stiffness: 180,
                damping: 22,
              }}
              className="inline-block text-[clamp(3.5rem,10vw,7rem)] text-transparent bg-clip-text bg-gradient-to-b from-white via-white/90 to-white/50"
              style={{ letterSpacing: "-0.02em" }}
            >
              {letter}
            </motion.span>
          ))}
        </h1>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.9 }}
          className="text-white/40 text-base sm:text-lg max-w-md mx-auto mb-10 leading-relaxed"
        >
          Upload real resumes. Paste a job description. Get ranked, AI-scored candidates with recruiter-ready insights — instantly.
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3, duration: 0.8 }}
        >
          <div className="inline-block group relative p-px rounded-2xl overflow-hidden"
            style={{ background: "linear-gradient(to bottom, rgba(255,255,255,0.15), rgba(255,255,255,0.03))" }}
          >
            <Button
              variant="ghost"
              onClick={() => navigate("/upload")}
              className="rounded-[1.1rem] px-10 py-6 text-base font-semibold bg-white/[0.06] hover:bg-white/[0.1] text-white border-0 transition-all duration-300 group-hover:-translate-y-0.5 gap-2"
            >
              Get Started
              <motion.span
                animate={{ x: [0, 4, 0] }}
                transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
                className="opacity-60"
              >
                →
              </motion.span>
            </Button>
          </div>
        </motion.div>

        {/* Feature pills */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8, duration: 1 }}
          className="flex flex-wrap items-center justify-center gap-2.5 mt-16"
        >
          {[
            "Upload 1000+ resumes",
            "Hybrid AI scoring",
            "Recruiter insights",
            "No API key needed",
          ].map(f => (
            <span
              key={f}
              className="text-[11px] text-white/25 border border-white/8 rounded-full px-4 py-1.5 font-mono backdrop-blur-sm"
            >
              {f}
            </span>
          ))}
        </motion.div>
      </div>
    </BackgroundPaths>
  );
}
