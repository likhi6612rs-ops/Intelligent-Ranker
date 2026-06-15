import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RankedCandidate } from "@workspace/api-client-react/src/generated/api.schemas";
import { ScoreArc } from "./score-arc";
import { ChevronDown, MapPin, Briefcase, GraduationCap } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface CandidateCardProps {
  candidate: RankedCandidate;
  index: number;
}

export function CandidateCard({ candidate, index }: CandidateCardProps) {
  const [expanded, setExpanded] = useState(false);
  const { candidate: info, fitScore, recruiterInsight, scoreBreakdown, matchedSkills, rank } = candidate;

  const isTop3 = rank <= 3;
  let rankColor = "text-muted-foreground bg-muted";
  if (rank === 1) rankColor = "text-yellow-900 bg-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]";
  else if (rank === 2) rankColor = "text-gray-900 bg-gray-300 drop-shadow-[0_0_8px_rgba(209,213,219,0.5)]";
  else if (rank === 3) rankColor = "text-amber-900 bg-amber-600 drop-shadow-[0_0_8px_rgba(217,119,6,0.5)]";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
    >
      <Card className="relative overflow-hidden border-border/40 hover:border-primary/50 transition-colors bg-card p-6 flex flex-col gap-6">
        {/* Top Header Row */}
        <div className="flex items-start gap-4 w-full">
          <div className={`flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-lg font-mono text-xl font-bold ${rankColor}`}>
            #{rank}
          </div>
          <div className="flex-grow">
            <h3 className="text-xl font-bold text-foreground">{info.name}</h3>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5 text-primary/90 font-medium">
                <Briefcase className="w-4 h-4" /> {info.title}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" /> {info.location}
              </span>
              <span className="flex items-center gap-1 font-mono text-xs">
                {info.yearsOfExperience}y exp
              </span>
            </div>
          </div>
          <div className="flex-shrink-0 ml-auto pl-4 border-l border-border/50 hidden md:block">
             <ScoreArc score={fitScore} size={64} strokeWidth={5} />
          </div>
        </div>

        {/* Insight Callout */}
        <div className="bg-secondary/50 rounded-md p-4 border border-primary/10 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
          <p className="text-sm italic text-foreground/90 leading-relaxed font-serif">
            "{recruiterInsight}"
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column: Skills */}
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Matched Skills</h4>
            <div className="flex flex-wrap gap-2">
              {info.skills.slice(0, 8).map(skill => {
                const isMatched = matchedSkills.includes(skill);
                return (
                  <Badge 
                    key={skill} 
                    variant={isMatched ? "default" : "secondary"}
                    className={isMatched ? "bg-primary/20 text-primary hover:bg-primary/30 border-primary/30" : "bg-secondary text-muted-foreground font-normal"}
                  >
                    {skill}
                  </Badge>
                );
              })}
              {info.skills.length > 8 && (
                <span className="text-xs text-muted-foreground self-center ml-1">+{info.skills.length - 8} more</span>
              )}
            </div>
          </div>

          {/* Right Column: Breakdown & Signals */}
          <div className="space-y-4">
            <div>
               <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Score Breakdown</h4>
               <div className="flex h-2 w-full rounded-full overflow-hidden bg-muted">
                 <div className="bg-chart-1" style={{ width: `${scoreBreakdown.semantic}%` }} title={`Semantic: ${scoreBreakdown.semantic}`} />
                 <div className="bg-chart-2" style={{ width: `${scoreBreakdown.keyword}%` }} title={`Keyword: ${scoreBreakdown.keyword}`} />
                 <div className="bg-chart-3" style={{ width: `${scoreBreakdown.experience}%` }} title={`Experience: ${scoreBreakdown.experience}`} />
                 <div className="bg-chart-4" style={{ width: `${scoreBreakdown.behavioral}%` }} title={`Behavioral: ${scoreBreakdown.behavioral}`} />
               </div>
               <div className="flex justify-between text-[10px] text-muted-foreground mt-1 font-mono">
                  <span>Sem {Math.round(scoreBreakdown.semantic)}</span>
                  <span>Key {Math.round(scoreBreakdown.keyword)}</span>
                  <span>Exp {Math.round(scoreBreakdown.experience)}</span>
                  <span>Beh {Math.round(scoreBreakdown.behavioral)}</span>
               </div>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Behavioral Signals</h4>
              <div className="grid grid-cols-3 gap-2 text-xs font-mono">
                <div>
                  <div className="text-muted-foreground mb-1">Lead</div>
                  <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden"><div className="h-full bg-accent" style={{width: `${info.behavioralSignals.leadershipScore}%`}}/></div>
                </div>
                <div>
                  <div className="text-muted-foreground mb-1">Collab</div>
                  <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden"><div className="h-full bg-accent" style={{width: `${info.behavioralSignals.collaborationScore}%`}}/></div>
                </div>
                <div>
                  <div className="text-muted-foreground mb-1">Adapt</div>
                  <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden"><div className="h-full bg-accent" style={{width: `${info.behavioralSignals.adaptabilityScore}%`}}/></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Expandable History */}
        <div className="border-t border-border/50 pt-4 mt-2">
          <button 
            onClick={() => setExpanded(!expanded)} 
            className="flex items-center justify-between w-full text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            <span>Career History & Education</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${expanded ? "rotate-180" : ""}`} />
          </button>
          
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="py-4 space-y-6">
                  {/* Summary */}
                  <p className="text-sm text-foreground/80">{info.summary}</p>
                  
                  {/* Career */}
                  <div className="space-y-4">
                    {info.careerHistory.map((role, i) => (
                      <div key={i} className="relative pl-4 border-l-2 border-muted">
                        <div className="absolute w-2 h-2 rounded-full bg-muted-foreground -left-[5px] top-1.5" />
                        <h5 className="font-semibold text-sm">{role.title} <span className="text-muted-foreground font-normal ml-1">@ {role.company}</span></h5>
                        <p className="text-xs font-mono text-muted-foreground mb-2">{role.duration}</p>
                        <ul className="list-disc pl-4 space-y-1">
                          {role.highlights.map((h, j) => (
                            <li key={j} className="text-xs text-foreground/70">{h}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>

                  {/* Education */}
                  <div className="flex items-start gap-2 text-sm text-muted-foreground">
                     <GraduationCap className="w-4 h-4 mt-0.5 flex-shrink-0" />
                     <span>{info.education}</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </Card>
    </motion.div>
  );
}
