import React, { useRef, useState, useCallback } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, X, FileText, ChevronRight, Plus, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useSession, type ResumeEntry } from "@/context/session";
import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

async function extractTextFromPdf(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
  const pages: string[] = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    pages.push(content.items.map((item) => ("str" in item ? (item as { str: string }).str : "")).join(" "));
  }
  return pages.join("\n");
}

function guessName(text: string, filename: string): string {
  const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
  for (const line of lines.slice(0, 5)) {
    const words = line.split(/\s+/);
    if (words.length >= 2 && words.length <= 4 && line.length < 50 && /^[A-Z]/.test(line)) {
      if (!/^(EXPERIENCE|EDUCATION|SKILLS|SUMMARY|CONTACT|PROFILE|OBJECTIVE|RESUME|CV)/i.test(line)) {
        return line;
      }
    }
  }
  return filename.replace(/\.[^.]+$/, "").replace(/[_-]/g, " ");
}

export function UploadPage() {
  const [, navigate] = useLocation();
  const { resumes, addResumes, removeResume } = useSession();
  const [pasteText, setPasteText] = useState("");
  const [pasteFilename, setPasteFilename] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [processingCount, setProcessingCount] = useState(0);
  const [errors, setErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFiles = useCallback(async (files: FileList | File[]) => {
    const fileArr = Array.from(files);
    setProcessingCount(fileArr.length);
    setErrors([]);
    const newEntries: ResumeEntry[] = [];
    const errs: string[] = [];

    for (const file of fileArr) {
      try {
        let text = "";
        if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
          text = await extractTextFromPdf(file);
        } else {
          text = await file.text();
        }
        if (text.trim().length < 20) {
          errs.push(`${file.name}: Could not extract text (try pasting the content manually)`);
          continue;
        }
        newEntries.push({
          id: `${Date.now()}_${Math.random().toString(36).slice(2)}`,
          filename: file.name,
          text,
          name: guessName(text, file.name),
        });
      } catch {
        errs.push(`${file.name}: Failed to read file`);
      }
    }

    addResumes(newEntries);
    setProcessingCount(0);
    if (errs.length > 0) setErrors(errs);
  }, [addResumes]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
      e.target.value = "";
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length > 0) processFiles(e.dataTransfer.files);
  };

  const handlePasteAdd = () => {
    if (pasteText.trim().length < 20) return;
    const filename = pasteFilename.trim() || `Resume ${resumes.length + 1}`;
    addResumes([{
      id: `${Date.now()}_${Math.random().toString(36).slice(2)}`,
      filename,
      text: pasteText,
      name: guessName(pasteText, filename),
    }]);
    setPasteText("");
    setPasteFilename("");
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      {/* Header */}
      <header className="border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <button
          onClick={() => navigate("/")}
          className="text-white/40 hover:text-white/80 transition-colors text-sm font-mono flex items-center gap-2"
        >
          ← TalentLens
        </button>
        <div className="flex items-center gap-2 text-xs font-mono text-white/30">
          <span className="text-white/60 font-semibold">Step 1</span> of 2 — Upload Resumes
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-10">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <h1 className="text-3xl font-bold mb-2">Add Candidate Resumes</h1>
          <p className="text-white/40 text-sm">Upload PDF or TXT files, or paste resume text directly. Add as many as you need.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Drop zone */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-4"
          >
            <h2 className="text-sm font-semibold text-white/60 uppercase tracking-widest">Upload Files</h2>
            <div
              className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
                isDragging
                  ? "border-blue-400 bg-blue-400/5"
                  : "border-white/10 hover:border-white/25 hover:bg-white/[0.02]"
              }`}
              onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.txt,.text,text/plain,application/pdf"
                className="hidden"
                onChange={handleFileChange}
              />
              {processingCount > 0 ? (
                <div className="space-y-2">
                  <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-sm text-white/60">Processing {processingCount} file{processingCount !== 1 ? "s" : ""}…</p>
                </div>
              ) : (
                <>
                  <Upload className="w-8 h-8 text-white/20 mx-auto mb-3" />
                  <p className="text-sm font-medium text-white/60">
                    {isDragging ? "Drop files here" : "Drag & drop or click to browse"}
                  </p>
                  <p className="text-xs text-white/30 mt-1">PDF and TXT files supported — select hundreds at once</p>
                </>
              )}
            </div>

            {errors.length > 0 && (
              <div className="space-y-1">
                {errors.map((e, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-amber-400/80 bg-amber-400/5 border border-amber-400/10 rounded-lg px-3 py-2">
                    <AlertCircle className="w-3 h-3 mt-0.5 shrink-0" />
                    {e}
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Paste zone */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="space-y-4"
          >
            <h2 className="text-sm font-semibold text-white/60 uppercase tracking-widest">Paste Resume Text</h2>
            <input
              type="text"
              placeholder="Candidate name or filename (optional)"
              value={pasteFilename}
              onChange={e => setPasteFilename(e.target.value)}
              className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/25 outline-none focus:border-white/25 transition-colors"
            />
            <Textarea
              placeholder="Paste full resume text here…"
              value={pasteText}
              onChange={e => setPasteText(e.target.value)}
              className="min-h-[160px] bg-white/[0.03] border-white/10 text-white placeholder:text-white/25 resize-none focus:border-white/25 text-sm"
            />
            <Button
              onClick={handlePasteAdd}
              disabled={pasteText.trim().length < 20}
              className="w-full bg-white/5 hover:bg-white/10 text-white border border-white/10 font-medium"
              variant="ghost"
            >
              <Plus className="w-4 h-4 mr-2" /> Add Resume
            </Button>
          </motion.div>
        </div>

        {/* Resume list */}
        <AnimatePresence>
          {resumes.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-10 space-y-3"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-white/60 uppercase tracking-widest">
                  Added Resumes
                  <span className="ml-2 text-white bg-white/10 rounded-full px-2 py-0.5 text-xs font-mono">
                    {resumes.length}
                  </span>
                </h2>
                <span className="text-xs text-white/25 font-mono">
                  {resumes.length >= 1000 ? "1000+" : resumes.length} candidate{resumes.length !== 1 ? "s" : ""}
                </span>
              </div>

              <div className="max-h-72 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                {resumes.map(r => (
                  <motion.div
                    key={r.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="flex items-center gap-3 bg-white/[0.03] border border-white/5 rounded-lg px-4 py-3"
                  >
                    <FileText className="w-4 h-4 text-white/20 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white/80 truncate">
                        {r.name && r.name !== r.filename.replace(/\.[^.]+$/, "") ? r.name : r.filename}
                      </p>
                      <p className="text-xs text-white/25 truncate">{r.filename} · {Math.round(r.text.length / 100) / 10}k chars</p>
                    </div>
                    <button
                      onClick={() => removeResume(r.id)}
                      className="text-white/20 hover:text-red-400 transition-colors shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-10 flex items-center justify-between border-t border-white/5 pt-8"
        >
          <p className="text-sm text-white/30">
            {resumes.length === 0
              ? "Add at least one resume to continue"
              : `${resumes.length} resume${resumes.length !== 1 ? "s" : ""} ready for analysis`}
          </p>
          <Button
            onClick={() => navigate("/analyze")}
            disabled={resumes.length === 0}
            className="bg-white text-black hover:bg-white/90 font-semibold px-6 py-2 rounded-xl disabled:opacity-30 transition-all"
          >
            Continue to Analysis <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
