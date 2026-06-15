import React, { useState } from "react";
import { 
  useGetCandidates, 
  useGetRankingStats, 
  useAnalyzeJobDescription 
} from "@workspace/api-client-react";
import { LoadingStages } from "@/components/loading-stages";
import { CandidateCard } from "@/components/candidate-card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Activity, Users, Star, Cpu, Crosshair } from "lucide-react";
import { RankingResult } from "@workspace/api-client-react/src/generated/api.schemas";
import { motion } from "framer-motion";

export function Dashboard() {
  const [jobDescription, setJobDescription] = useState("");
  const [results, setResults] = useState<RankingResult | null>(null);

  const { data: stats, isLoading: statsLoading } = useGetRankingStats();
  const { data: candidates, isLoading: candidatesLoading } = useGetCandidates();

  const analyzeMutation = useAnalyzeJobDescription();

  const handleAnalyze = () => {
    if (jobDescription.trim().length < 10) return;
    
    analyzeMutation.mutate(
      { data: { jobDescription } },
      {
        onSuccess: (data) => {
          setResults(data);
        }
      }
    );
  };

  const isAnalyzing = analyzeMutation.isPending;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/20 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 text-primary">
            <Crosshair className="w-6 h-6" />
            <div>
              <h1 className="text-lg font-bold tracking-tight leading-none">TalentLens</h1>
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">Signal Extraction Engine</span>
            </div>
          </div>

          {!statsLoading && stats && (
            <div className="hidden md:flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="w-4 h-4 text-primary/60" />
                <span className="font-mono text-foreground">{stats.totalCandidates}</span> pool
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Activity className="w-4 h-4 text-accent/60" />
                <span className="font-mono text-foreground">{stats.avgYearsExperience.toFixed(1)}y</span> avg exp
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Star className="w-4 h-4 text-amber-500/60" />
                <span className="font-mono text-foreground">{stats.topSkills.length}</span> top skills
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full p-6 lg:p-8 space-y-12">
        {/* Input Section */}
        <section className="space-y-4 max-w-4xl">
          <div className="space-y-1.5">
            <h2 className="text-2xl font-semibold tracking-tight">Define Target Profile</h2>
            <p className="text-muted-foreground text-sm">Paste the full job description. The engine will extract semantic requirements, desired behavior traits, and technical keywords.</p>
          </div>
          
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-lg blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500 -z-10" />
            <Textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste job description here — role, requirements, stack, team context..."
              className="min-h-[200px] resize-y bg-secondary/50 border-border/50 focus-visible:border-primary focus-visible:ring-primary/20 text-base font-sans p-5 shadow-inner"
            />
            <div className="absolute bottom-4 right-4 text-xs font-mono text-muted-foreground">
              {jobDescription.length} chars
            </div>
          </div>

          <div className="pt-2">
            {isAnalyzing ? (
              <div className="bg-secondary/40 border border-primary/20 rounded-lg overflow-hidden shadow-[0_0_20px_rgba(0,229,255,0.05)]">
                <LoadingStages />
              </div>
            ) : (
              <Button 
                onClick={handleAnalyze} 
                disabled={jobDescription.length < 10 || isAnalyzing}
                className="w-full h-14 text-base font-semibold shadow-[0_0_20px_rgba(0,229,255,0.1)] hover:shadow-[0_0_30px_rgba(0,229,255,0.2)] transition-all bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Cpu className="w-5 h-5 mr-2" />
                Run Smart Analysis
              </Button>
            )}
          </div>
        </section>

        {/* Results Section */}
        {results && !isAnalyzing && (
          <motion.section 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6 pb-20"
          >
            <div className="flex items-end justify-between border-b border-border/50 pb-4">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight">Ranked Results</h2>
                <p className="text-muted-foreground text-sm mt-1">
                  Analyzed {results.totalAnalyzed} candidates. Top match threshold: <span className="font-mono text-primary">{results.topMatchThreshold}%</span>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {results.rankedCandidates.map((ranked, idx) => (
                <CandidateCard 
                  key={ranked.candidate.id} 
                  candidate={ranked} 
                  index={idx} 
                />
              ))}
            </div>
            
            {results.rankedCandidates.length === 0 && (
              <div className="text-center py-20 text-muted-foreground border border-dashed border-border rounded-lg">
                No candidates found matching the criteria.
              </div>
            )}
          </motion.section>
        )}
      </main>
    </div>
  );
}
