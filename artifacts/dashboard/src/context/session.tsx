import React, { createContext, useContext, useState } from "react";
import type { RankingResult } from "@workspace/api-client-react";

export interface ResumeEntry {
  id: string;
  filename: string;
  text: string;
  name?: string;
}

interface SessionContextValue {
  resumes: ResumeEntry[];
  addResumes: (entries: ResumeEntry[]) => void;
  removeResume: (id: string) => void;
  clearResumes: () => void;
  jobDescription: string;
  setJobDescription: (jd: string) => void;
  results: RankingResult | null;
  setResults: (r: RankingResult | null) => void;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [resumes, setResumes] = useState<ResumeEntry[]>([]);
  const [jobDescription, setJobDescription] = useState("");
  const [results, setResults] = useState<RankingResult | null>(null);

  const addResumes = (entries: ResumeEntry[]) => {
    setResumes(prev => [...prev, ...entries]);
  };

  const removeResume = (id: string) => {
    setResumes(prev => prev.filter(r => r.id !== id));
  };

  const clearResumes = () => setResumes([]);

  return (
    <SessionContext.Provider value={{ resumes, addResumes, removeResume, clearResumes, jobDescription, setJobDescription, results, setResults }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used within SessionProvider");
  return ctx;
}
