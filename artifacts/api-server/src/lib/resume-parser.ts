// ─── Skills Dictionary ────────────────────────────────────────────────────────
const SKILLS_DICT = [
  "Python","JavaScript","TypeScript","Java","Go","Rust","C++","C#","Ruby","Swift",
  "Kotlin","Scala","PHP","R","MATLAB","Elixir","Haskell","Clojure","Dart","Lua",
  "React","Next.js","Vue","Angular","Svelte","HTML","CSS","Tailwind CSS","Sass",
  "Redux","MobX","Zustand","GraphQL","Apollo","Webpack","Vite","Storybook","Cypress",
  "Node.js","Express","FastAPI","Django","Flask","Spring Boot","Rails","Laravel",
  "NestJS","Fastify","gRPC","REST","WebSocket","Microservices","Kafka","RabbitMQ",
  "AWS","GCP","Azure","Docker","Kubernetes","Terraform","Ansible","Helm","ArgoCD",
  "CI/CD","GitHub Actions","Jenkins","GitOps","Prometheus","Grafana","Datadog",
  "Nginx","Linux","Bash","Shell","Vagrant","Pulumi","CloudFormation","Serverless",
  "PostgreSQL","MySQL","MongoDB","Redis","Elasticsearch","Cassandra","DynamoDB",
  "Snowflake","BigQuery","Redshift","SQLite","Neo4j","ClickHouse","Supabase",
  "Drizzle","Prisma","SQLAlchemy","Hibernate","dbt","Airflow","Spark","Hadoop",
  "PyTorch","TensorFlow","Keras","Scikit-learn","Pandas","NumPy","Jupyter",
  "LangChain","OpenAI","Hugging Face","Transformers","RLHF","RAG","LLM","MLOps",
  "Vector Database","Pinecone","Weaviate","JAX","CUDA","TensorRT","ONNX",
  "Computer Vision","NLP","Deep Learning","Machine Learning","Data Science",
  "iOS","Android","React Native","Flutter","SwiftUI","Objective-C","Expo",
  "Xcode","Android Studio","Firebase","Push Notifications",
  "Git","GitHub","GitLab","Bitbucket","Jira","Confluence","Figma","Postman",
  "Stripe","Twilio","Auth0","Clerk","Sentry","Segment","Mixpanel","Amplitude",
  "A/B Testing","Agile","Scrum","SOLID","Design Patterns","System Design",
  "Microservices","Event-Driven","Domain-Driven Design","TDD","BDD",
  "SQL","ETL","Data Pipeline","Data Modeling","Analytics",
  "Tableau","Looker","Power BI","dbt","Airflow","Flink","Kafka Streams",
  "communication","presentation","leadership","management","mentoring","coaching",
  "project management","stakeholder management","excel","word","powerpoint","crm","salesforce",
];

// ─── Month name → index ────────────────────────────────────────────────────────
const MONTH_MAP: Record<string, number> = {
  jan:1,january:1,feb:2,february:2,mar:3,march:3,apr:4,april:4,
  may:5,jun:6,june:6,jul:7,july:7,aug:8,august:8,
  sep:9,september:9,oct:10,october:10,nov:11,november:11,dec:12,december:12,
};

// ─── Precise Experience Calculation ──────────────────────────────────────────
// Parse date ranges from text and compute total non-overlapping duration.

interface DateRange { start: number; end: number; } // fractional years

function parseMonthYear(monthStr: string | undefined, yearStr: string): number {
  const year = parseInt(yearStr, 10);
  if (!monthStr) return year; // just a year, use Jan 1
  const month = MONTH_MAP[monthStr.toLowerCase().slice(0, 3)] ?? 1;
  return year + (month - 1) / 12;
}

const CURRENT_YEAR = new Date().getFullYear() + (new Date().getMonth()) / 12;

const DATE_RANGE_RE = /(?:(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|january|february|march|april|june|july|august|september|october|november|december)\s+)?(?:')?((19|20)\d{2})\s*(?:[-–—to]+)\s*(?:(?:(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|january|february|march|april|june|july|august|september|october|november|december)\s+)?(?:')?((19|20)\d{2})|(present|current|now|today))/gi;

function extractDateRanges(text: string): DateRange[] {
  const ranges: DateRange[] = [];
  let match: RegExpExecArray | null;
  DATE_RANGE_RE.lastIndex = 0;

  while ((match = DATE_RANGE_RE.exec(text)) !== null) {
    const startMonth = match[1];
    const startYear = match[2];
    const endMonth = match[4];
    const endYear = match[5];
    const isPresent = !!match[6];

    if (!startYear) continue;

    const start = parseMonthYear(startMonth, startYear);
    const end = isPresent ? CURRENT_YEAR : (endYear ? parseMonthYear(endMonth, endYear) : CURRENT_YEAR);

    if (end >= start && start >= 1950 && start <= CURRENT_YEAR + 1) {
      ranges.push({ start, end });
    }
  }

  return ranges;
}

function computeTotalYears(ranges: DateRange[]): number {
  if (ranges.length === 0) return 0;

  // Sort by start date and merge overlapping intervals
  const sorted = [...ranges].sort((a, b) => a.start - b.start);
  const merged: DateRange[] = [sorted[0]];

  for (let i = 1; i < sorted.length; i++) {
    const last = merged[merged.length - 1];
    if (sorted[i].start <= last.end) {
      last.end = Math.max(last.end, sorted[i].end);
    } else {
      merged.push(sorted[i]);
    }
  }

  return merged.reduce((sum, r) => sum + (r.end - r.start), 0);
}

function extractYearsOfExperience(text: string): { years: number; precise: number; isEntryLevel: boolean } {
  const textLower = text.toLowerCase();

  // Explicit "no experience" signals
  const noExpSignals = [
    /no\s+(?:prior\s+|professional\s+)?(?:work\s+)?experience/i,
    /fresh\s+graduate/i,
    /recent\s+graduate/i,
    /entry[-\s]?level/i,
    /new\s+to\s+(?:the\s+)?(?:field|industry|profession)/i,
    /looking\s+for\s+first\s+(?:job|position|role)/i,
  ];
  if (noExpSignals.some(p => p.test(textLower))) {
    return { years: 0, precise: 0, isEntryLevel: true };
  }

  // Explicit "X years of experience" statement
  const explicitMatch = text.match(/(\d+(?:\.\d+)?)\+?\s*years?\s+of\s+(?:professional\s+|work\s+|relevant\s+)?experience/i);
  if (explicitMatch) {
    const p = parseFloat(explicitMatch[1]);
    return { years: Math.round(p), precise: p, isEntryLevel: p < 0.25 };
  }

  // Parse all date ranges from the text and compute total
  const ranges = extractDateRanges(text);
  const precise = computeTotalYears(ranges);

  if (precise > 0) {
    // Sanity cap: real experience rarely exceeds 45 years
    const capped = Math.min(precise, 45);
    return { years: Math.round(capped), precise: Math.round(capped * 10) / 10, isEntryLevel: false };
  }

  // No date ranges found — check if the resume mentions any jobs at all
  const hasJobIndicators = /\b(worked|employed|position|role|joined|company|inc|llc|corp|ltd)\b/i.test(textLower);
  if (!hasJobIndicators) {
    return { years: 0, precise: 0, isEntryLevel: true };
  }

  // Has some job indicators but no parseable dates — treat as unknown (mild experience)
  return { years: 1, precise: 1, isEntryLevel: false };
}

// ─── Name Extraction ──────────────────────────────────────────────────────────

function extractName(text: string, filename: string): string {
  const lines = text.split("\n").map(l => l.trim()).filter(Boolean);

  for (const line of lines.slice(0, 10)) {
    const nameMatch = line.match(/^(?:Name|Full\s+Name)\s*:\s*(.+)/i);
    if (nameMatch) {
      const n = nameMatch[1].trim();
      if (n.split(/\s+/).length >= 2 && n.length < 50) return n;
    }
  }

  for (const line of lines.slice(0, 5)) {
    const words = line.split(/\s+/);
    if (words.length >= 2 && words.length <= 4 && line.length < 50) {
      if (/^[A-Z]/.test(line) && !/^(EXPERIENCE|EDUCATION|SKILLS|SUMMARY|CONTACT|PROFILE|OBJECTIVE|RESUME|CV|WORK|ABOUT|PROJECT)/i.test(line)) {
        return line;
      }
    }
  }

  const base = filename.replace(/\.[^.]+$/, "").replace(/[_-]/g, " ").replace(/\s+/g, " ").trim();
  if (base && base.length > 2 && base.toLowerCase() !== "resume" && base.toLowerCase() !== "cv") return base;

  return "Name Missing";
}

// ─── Email Extraction ─────────────────────────────────────────────────────────

function extractEmail(text: string): string {
  const m = text.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/);
  return m ? m[0] : "";
}

// ─── Location Extraction ──────────────────────────────────────────────────────

function extractLocation(text: string): string {
  const patterns = [
    /(?:Location|Address|City)\s*:\s*([^\n,]+(?:,\s*[^\n]+)?)/i,
    /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?\s*,\s*(?:[A-Z]{2}|[A-Z][a-z]+))\b/,
  ];
  for (const p of patterns) {
    const m = text.match(p);
    if (m && m[1].length < 60) return m[1].trim();
  }
  return "";
}

// ─── Skills Extraction ────────────────────────────────────────────────────────

function extractSkills(text: string): string[] {
  const textLower = text.toLowerCase();
  const found = new Set<string>();
  for (const skill of SKILLS_DICT) {
    const sl = skill.toLowerCase();
    const escaped = sl.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\+/g, "\\+");
    const re = new RegExp(`(?<![a-z0-9])${escaped}(?![a-z0-9])`, "i");
    if (re.test(textLower)) found.add(skill);
  }
  return [...found];
}

// ─── Current Title Extraction ─────────────────────────────────────────────────

const TITLE_KEYWORDS = [
  "engineer","developer","scientist","analyst","architect","manager","director",
  "designer","researcher","lead","head","principal","staff","senior","junior",
  "vp","vice president","cto","ceo","coo","cfo","intern","consultant","specialist",
  "devops","sre","platform","backend","frontend","fullstack","full-stack","mobile",
  "data","ml","ai","cloud","security","qa","product","associate","coordinator",
  "officer","executive","advisor","administrator","technician","nurse","doctor",
  "teacher","professor","accountant","lawyer","sales","marketing",
];

function extractTitle(text: string): string {
  const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
  for (const line of lines.slice(1, 15)) {
    if (line.length > 3 && line.length < 80) {
      const lower = line.toLowerCase();
      if (TITLE_KEYWORDS.some(kw => lower.includes(kw))) return line;
    }
  }
  const titleMatch = text.match(/(?:Title|Role|Position|Current\s+Role)\s*:\s*([^\n]+)/i);
  if (titleMatch) return titleMatch[1].trim();
  return "Professional";
}

// ─── Education Extraction ─────────────────────────────────────────────────────

function extractEducation(text: string): string {
  const patterns = [
    /(?:Ph\.?D\.?|Doctor(?:ate)?)\s+(?:in\s+)?([^\n,]+)/i,
    /(?:M\.?S\.?|M\.?Sc\.?|Master(?:'s)?)\s+(?:of\s+|in\s+)?([^\n,]+)/i,
    /(?:B\.?S\.?|B\.?Sc\.?|Bachelor(?:'s)?)\s+(?:of\s+|in\s+)?([^\n,]+)/i,
    /(?:B\.?A\.?|M\.?A\.?)\s+(?:in\s+)?([^\n,]+)/i,
    /(?:Associate(?:'s)?)\s+(?:of\s+|in\s+)?([^\n,]+)/i,
  ];
  for (const p of patterns) {
    const m = text.match(p);
    if (m) return m[0].slice(0, 100).trim();
  }
  const univMatch = text.match(/(?:University|College|Institute|School)\s+of\s+[^\n,]+/i);
  if (univMatch) return univMatch[0].slice(0, 100).trim();
  return "";
}

// ─── Summary Extraction ───────────────────────────────────────────────────────

function extractSummary(text: string): string {
  const sectionMatch = text.match(/(?:Summary|Professional\s+Summary|Objective|Profile|About\s+Me)\s*[\n:]\s*([\s\S]{50,500}?)(?:\n\n|\n[A-Z]{2,})/i);
  if (sectionMatch) return sectionMatch[1].replace(/\n/g, " ").trim().slice(0, 400);
  const paragraphs = text.split(/\n{2,}/);
  for (const para of paragraphs.slice(0, 5)) {
    const cleaned = para.replace(/\n/g, " ").trim();
    if (cleaned.length > 80 && cleaned.length < 600) return cleaned.slice(0, 400);
  }
  return "";
}

// ─── Career History Extraction ────────────────────────────────────────────────

function extractCareerHistory(text: string) {
  const results: { title: string; company: string; duration: string; highlights: string[] }[] = [];

  const datePattern = /(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|january|february|march|april|june|july|august|september|october|november|december)?\s*(?:')?(?:20\d{2}|19\d{2})\s*[-–—to]+\s*(?:(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|january|february|march|april|june|july|august|september|october|november|december)?\s*(?:')?(?:20\d{2}|19\d{2})|present|current|now)/gi;

  const textLines = text.split("\n");
  let currentEntry: { title: string; company: string; duration: string; highlights: string[] } | null = null;

  for (let i = 0; i < textLines.length; i++) {
    const line = textLines[i].trim();
    if (!line) continue;

    const dateMatch = line.match(datePattern);
    if (dateMatch) {
      if (currentEntry) results.push(currentEntry);
      const duration = dateMatch[0];
      const prevLine = i > 0 ? textLines[i - 1].trim() : "";
      let title = "";
      let company = "";

      if (TITLE_KEYWORDS.some(kw => prevLine.toLowerCase().includes(kw))) {
        title = prevLine;
        company = line.replace(duration, "").trim();
      } else {
        const parts = line.split(/[|@–—,]/);
        if (parts.length >= 2) {
          title = parts[0].trim();
          company = parts[1].trim();
        } else {
          title = prevLine || "Professional";
          company = line.replace(duration, "").trim();
        }
      }

      currentEntry = {
        title: title.slice(0, 80) || "Professional",
        company: company.slice(0, 80) || "Company",
        duration,
        highlights: [],
      };
    } else if (currentEntry) {
      if (/^[-•*·▸▪▶]\s+.{10,}/.test(line) || /^\d+\.\s+.{10,}/.test(line)) {
        currentEntry.highlights.push(line.replace(/^[-•*·▸▪▶\d.]\s+/, "").trim().slice(0, 200));
      }
    }
  }

  if (currentEntry) results.push(currentEntry);

  return results.slice(0, 5).map(e => ({ ...e, highlights: e.highlights.slice(0, 4) }));
}

// ─── Industry Inference ────────────────────────────────────────────────────────

const INDUSTRY_MAP: { keywords: string[]; industry: string }[] = [
  { keywords: ["fintech","banking","payment","finance","investment","trading","insurance"], industry: "FinTech" },
  { keywords: ["ai","machine learning","deep learning","llm","nlp","neural","model"], industry: "AI/ML" },
  { keywords: ["healthcare","medical","clinical","pharma","health","hospital","biotech"], industry: "Healthcare" },
  { keywords: ["ecommerce","shopify","retail","marketplace","commerce"], industry: "E-Commerce" },
  { keywords: ["devtools","developer platform","developer tools","cli","sdk","api platform"], industry: "Developer Tools" },
  { keywords: ["saas","b2b","enterprise software"], industry: "SaaS" },
  { keywords: ["mobile","ios","android","app store","consumer app"], industry: "Consumer Tech" },
  { keywords: ["cloud","infrastructure","platform","kubernetes","aws","gcp","azure","devops"], industry: "Cloud/Infrastructure" },
  { keywords: ["security","cybersecurity","appsec","infosec","pentest"], industry: "Cybersecurity" },
  { keywords: ["data","analytics","bi","warehouse","etl","pipeline"], industry: "Data Engineering" },
  { keywords: ["gaming","game","unity","unreal","entertainment"], industry: "Gaming" },
  { keywords: ["edtech","education","learning","courses","school"], industry: "EdTech" },
  { keywords: ["logistics","supply chain","delivery","transportation","shipping"], industry: "Logistics" },
];

function inferIndustries(text: string, skills: string[]): string[] {
  const combined = (text + " " + skills.join(" ")).toLowerCase();
  const found: string[] = [];
  for (const { keywords, industry } of INDUSTRY_MAP) {
    if (keywords.some(kw => combined.includes(kw))) found.push(industry);
  }
  return found.slice(0, 3).length > 0 ? found.slice(0, 3) : ["Technology"];
}

// ─── Behavioral Signal Inference ───────────────────────────────────────────────

function inferBehavioralSignals(text: string, careerHistory: ReturnType<typeof extractCareerHistory>) {
  const textLower = text.toLowerCase();
  let leadershipScore = 50;
  const leadershipKeywords = ["led","lead","managed","directed","headed","spearheaded","mentored","grew team","team of","founded","built team","oversaw","supervised"];
  leadershipKeywords.forEach(kw => { if (textLower.includes(kw)) leadershipScore += 5; });
  if (/\b(manager|director|vp|head|principal|staff|lead)\b/i.test(text)) leadershipScore += 15;
  leadershipScore = Math.min(leadershipScore, 97);

  let collaborationScore = 55;
  const collabKeywords = ["collaborated","cross-functional","partnered","stakeholder","worked with","team player","coordination","alignment","cross-team"];
  collabKeywords.forEach(kw => { if (textLower.includes(kw)) collaborationScore += 4; });
  collaborationScore = Math.min(collaborationScore, 95);

  let adaptabilityScore = 55;
  const adaptKeywords = ["pivoted","transitioned","migrated","adopted","learned","rapid","fast-paced","ambiguity","startup","scaled","evolved"];
  adaptKeywords.forEach(kw => { if (textLower.includes(kw)) adaptabilityScore += 4; });
  if (careerHistory.length >= 3) adaptabilityScore += 10;
  adaptabilityScore = Math.min(adaptabilityScore, 95);

  const hasPromotion = /promoted|senior|principal|staff|lead|manager/i.test(text);
  const growthTrajectory = hasPromotion ? "steep" : careerHistory.length >= 2 ? "steady" : "early";

  return { leadershipScore, collaborationScore, adaptabilityScore, growthTrajectory };
}

// ─── Main Parser ──────────────────────────────────────────────────────────────

let candidateCounter = 0;

export interface ParsedCandidate {
  id: string;
  name: string;
  title: string;
  location: string;
  email: string;
  yearsOfExperience: number;        // rounded integer
  yearsOfExperiencePrecise: number; // fractional, e.g. 2.5
  isEntryLevel: boolean;
  skills: string[];
  careerHistory: { title: string; company: string; duration: string; highlights: string[] }[];
  behavioralSignals: { leadershipScore: number; collaborationScore: number; adaptabilityScore: number; growthTrajectory: string };
  summary: string;
  education: string;
  industries: string[];
}

export function parseResume(filename: string, text: string): ParsedCandidate {
  candidateCounter++;
  const id = `resume_${candidateCounter}_${Date.now()}`;

  const name = extractName(text, filename);
  const email = extractEmail(text);
  const location = extractLocation(text);
  const title = extractTitle(text);
  const skills = extractSkills(text);
  const { years, precise, isEntryLevel } = extractYearsOfExperience(text);
  const careerHistory = extractCareerHistory(text);
  const education = extractEducation(text);
  const summary = extractSummary(text);
  const industries = inferIndustries(text, skills);
  const behavioralSignals = inferBehavioralSignals(text, careerHistory);

  const expLabel = isEntryLevel ? "Entry Level — no prior experience" : `${precise.toFixed(1)} years`;

  return {
    id,
    name,
    title,
    location,
    email,
    yearsOfExperience: years,
    yearsOfExperiencePrecise: precise,
    isEntryLevel,
    skills,
    careerHistory: careerHistory.length > 0 ? careerHistory : isEntryLevel ? [] : [{
      title,
      company: "Previous Employer",
      duration: `${new Date().getFullYear() - years}–Present`,
      highlights: [],
    }],
    behavioralSignals,
    summary: summary || (isEntryLevel ? "No professional work experience on record." : `Professional with approximately ${expLabel} in ${industries[0] || "Technology"}.`),
    education,
    industries,
  };
}
