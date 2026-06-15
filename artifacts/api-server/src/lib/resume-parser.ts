// ─── Skills Dictionary ────────────────────────────────────────────────────────
const SKILLS_DICT = [
  // Languages
  "Python","JavaScript","TypeScript","Java","Go","Rust","C++","C#","Ruby","Swift",
  "Kotlin","Scala","PHP","R","MATLAB","Elixir","Haskell","Clojure","Dart","Lua",
  // Frontend
  "React","Next.js","Vue","Angular","Svelte","HTML","CSS","Tailwind CSS","Sass",
  "Redux","MobX","Zustand","GraphQL","Apollo","Webpack","Vite","Storybook","Cypress",
  // Backend
  "Node.js","Express","FastAPI","Django","Flask","Spring Boot","Rails","Laravel",
  "NestJS","Fastify","gRPC","REST","WebSocket","Microservices","Kafka","RabbitMQ",
  // Cloud & Infra
  "AWS","GCP","Azure","Docker","Kubernetes","Terraform","Ansible","Helm","ArgoCD",
  "CI/CD","GitHub Actions","Jenkins","GitOps","Prometheus","Grafana","Datadog",
  "Nginx","Linux","Bash","Shell","Vagrant","Pulumi","CloudFormation","Serverless",
  // Databases
  "PostgreSQL","MySQL","MongoDB","Redis","Elasticsearch","Cassandra","DynamoDB",
  "Snowflake","BigQuery","Redshift","SQLite","Neo4j","ClickHouse","Supabase",
  "Drizzle","Prisma","SQLAlchemy","Hibernate","dbt","Airflow","Spark","Hadoop",
  // AI / ML
  "PyTorch","TensorFlow","Keras","Scikit-learn","Pandas","NumPy","Jupyter",
  "LangChain","OpenAI","Hugging Face","Transformers","RLHF","RAG","LLM","MLOps",
  "Vector Database","Pinecone","Weaviate","JAX","CUDA","TensorRT","ONNX",
  "Computer Vision","NLP","Deep Learning","Machine Learning","Data Science",
  // Mobile
  "iOS","Android","React Native","Flutter","SwiftUI","Objective-C","Expo",
  "Xcode","Android Studio","Firebase","Push Notifications",
  // Other tools
  "Git","GitHub","GitLab","Bitbucket","Jira","Confluence","Figma","Postman",
  "Stripe","Twilio","Auth0","Clerk","Sentry","Segment","Mixpanel","Amplitude",
  "A/B Testing","Agile","Scrum","SOLID","Design Patterns","System Design",
  "Microservices","Event-Driven","Domain-Driven Design","TDD","BDD",
  // Data
  "SQL","ETL","Data Pipeline","Data Engineering","Data Modeling","Analytics",
  "Tableau","Looker","Power BI","dbt","Airflow","Flink","Kafka Streams",
];

// ─── Date Parsing ──────────────────────────────────────────────────────────────

function parseYear(s: string): number | null {
  const m = s.match(/\b(19|20)\d{2}\b/);
  return m ? parseInt(m[0], 10) : null;
}

function extractYearsOfExperience(text: string): number {
  // Try "X years of experience" patterns first
  const explicitMatch = text.match(/(\d+)\+?\s*years?\s+of\s+(?:professional\s+)?experience/i);
  if (explicitMatch) return Math.min(parseInt(explicitMatch[1], 10), 40);

  // Parse date ranges like "Jan 2018 – Mar 2022" or "2018 - 2022" or "2020 – Present"
  const dateRangePattern = /(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|January|February|March|April|May|June|July|August|September|October|November|December)?\s*(?:')?(20\d{2}|19\d{2})\s*[-–—to]+\s*(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|January|February|March|April|May|June|July|August|September|October|November|December)?\s*(?:')?(20\d{2}|19\d{2})|[Pp]resent|[Cc]urrent|[Nn]ow)/g;

  const currentYear = new Date().getFullYear();
  let totalMonths = 0;
  let match: RegExpExecArray | null;
  const seenRanges = new Set<string>();

  while ((match = dateRangePattern.exec(text)) !== null) {
    const rangeKey = match[0].trim();
    if (seenRanges.has(rangeKey)) continue;
    seenRanges.add(rangeKey);
    const startYear = parseInt(match[1], 10);
    const endStr = match[2];
    const endYear = endStr ? parseInt(endStr, 10) : currentYear;
    if (!isNaN(startYear) && startYear >= 1990 && startYear <= currentYear) {
      totalMonths += Math.max(0, (endYear - startYear)) * 12;
    }
  }

  const years = Math.round(totalMonths / 12);
  if (years > 0 && years <= 50) return years;

  // Fallback: count number of job sections
  const jobCount = (text.match(/\b(20\d{2})\b/g) || []).length;
  return Math.min(Math.max(Math.floor(jobCount / 2), 0), 30);
}

// ─── Name Extraction ──────────────────────────────────────────────────────────

function extractName(text: string, filename: string): string {
  const lines = text.split("\n").map(l => l.trim()).filter(Boolean);

  // Check "Name: ..." pattern
  for (const line of lines.slice(0, 10)) {
    const nameMatch = line.match(/^(?:Name|Full\s+Name)\s*:\s*(.+)/i);
    if (nameMatch) {
      const n = nameMatch[1].trim();
      if (n.split(/\s+/).length >= 2 && n.length < 50) return n;
    }
  }

  // Try first 1–3 lines: short line with 2-4 words (looks like a name)
  for (const line of lines.slice(0, 5)) {
    const words = line.split(/\s+/);
    if (words.length >= 2 && words.length <= 4 && line.length < 50) {
      // Must start with a capital letter and not be a title/section header
      if (/^[A-Z]/.test(line) && !/^(EXPERIENCE|EDUCATION|SKILLS|SUMMARY|CONTACT|PROFILE|OBJECTIVE|RESUME|CV|WORK)/i.test(line)) {
        return line;
      }
    }
  }

  // Derive from filename
  const base = filename.replace(/\.[^.]+$/, "").replace(/[_-]/g, " ").replace(/\s+/g, " ").trim();
  if (base && base.length > 2) return base;

  return "Unknown Candidate";
}

// ─── Email Extraction ─────────────────────────────────────────────────────────

function extractEmail(text: string): string {
  const m = text.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/);
  return m ? m[0] : "";
}

// ─── Location Extraction ──────────────────────────────────────────────────────

function extractLocation(text: string): string {
  // "City, ST" or "City, State" patterns
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
    // Word-boundary check (handle special chars like C++ and C#)
    const escaped = sl.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\+/g, "\\+").replace(/#/g, "#");
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
  "data","ml","ai","cloud","security","qa","product",
];

function extractTitle(text: string): string {
  const lines = text.split("\n").map(l => l.trim()).filter(Boolean);

  // After the name (first 10 lines), look for a line that looks like a title
  for (const line of lines.slice(1, 15)) {
    if (line.length > 3 && line.length < 80) {
      const lower = line.toLowerCase();
      if (TITLE_KEYWORDS.some(kw => lower.includes(kw))) {
        return line;
      }
    }
  }

  // Look for "Title: ..." pattern
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
  // Look for university/college
  const univMatch = text.match(/(?:University|College|Institute|School)\s+of\s+[^\n,]+/i);
  if (univMatch) return univMatch[0].slice(0, 100).trim();
  return "";
}

// ─── Summary Extraction ───────────────────────────────────────────────────────

function extractSummary(text: string): string {
  // Look for summary/objective/profile section
  const sectionMatch = text.match(/(?:Summary|Professional\s+Summary|Objective|Profile|About\s+Me)\s*[\n:]\s*([\s\S]{50,500}?)(?:\n\n|\n[A-Z]{2,})/i);
  if (sectionMatch) return sectionMatch[1].replace(/\n/g, " ").trim().slice(0, 400);

  // Take first substantial paragraph
  const paragraphs = text.split(/\n{2,}/);
  for (const para of paragraphs.slice(0, 5)) {
    const cleaned = para.replace(/\n/g, " ").trim();
    if (cleaned.length > 80 && cleaned.length < 600) return cleaned.slice(0, 400);
  }
  return "";
}

// ─── Career History Extraction ────────────────────────────────────────────────

const COMPANY_INDICATORS = [
  "Inc","LLC","Ltd","Corp","Company","Technologies","Solutions","Systems","Group",
  "Labs","Studio","Agency","Consulting","Partners","Ventures","Capital","Software",
];

function extractCareerHistory(text: string) {
  const results: { title: string; company: string; duration: string; highlights: string[] }[] = [];
  const currentYear = new Date().getFullYear();

  // Split into sections by dates
  const datePattern = /(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|January|February|March|April|May|June|July|August|September|October|November|December)?\s*(?:')?(?:20\d{2}|19\d{2})\s*[-–—to]+\s*(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|January|February|March|April|May|June|July|August|September|October|November|December)?\s*(?:')?(?:20\d{2}|19\d{2})|[Pp]resent|[Cc]urrent|[Nn]ow)/g;

  const textLines = text.split("\n");
  let currentEntry: { title: string; company: string; duration: string; highlights: string[] } | null = null;

  for (let i = 0; i < textLines.length; i++) {
    const line = textLines[i].trim();
    if (!line) continue;

    // Detect date range on this line
    const dateMatch = line.match(datePattern);
    if (dateMatch) {
      if (currentEntry) results.push(currentEntry);
      const duration = dateMatch[0];

      // Title is often the line before the date or on same line
      let title = "";
      let company = "";
      const prevLine = i > 0 ? textLines[i - 1].trim() : "";
      const nextLine = i + 1 < textLines.length ? textLines[i + 1].trim() : "";

      if (TITLE_KEYWORDS.some(kw => prevLine.toLowerCase().includes(kw))) {
        title = prevLine;
        company = line.replace(duration, "").trim();
      } else {
        // Title and company might be on same line: "Software Engineer | Acme Corp"
        const parts = line.split(/[|@–—,]/);
        if (parts.length >= 2) {
          title = parts[0].trim();
          company = parts[1].trim();
        } else {
          title = prevLine || nextLine || "Engineer";
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
      // Collect highlights: lines starting with bullet/dash/•
      if (/^[-•*·▸▪▶]\s+.{10,}/.test(line) || /^\d+\.\s+.{10,}/.test(line)) {
        currentEntry.highlights.push(line.replace(/^[-•*·▸▪▶\d.]\s+/, "").trim().slice(0, 200));
      }
    }
  }

  if (currentEntry) results.push(currentEntry);

  // Deduplicate and cap at 5
  return results.slice(0, 5).map(e => ({
    ...e,
    highlights: e.highlights.slice(0, 4),
  }));
}

// ─── Industry Inference ────────────────────────────────────────────────────────

const INDUSTRY_MAP: { keywords: string[]; industry: string }[] = [
  { keywords: ["fintech","banking","payment","finance","investment","trading","insurance"], industry: "FinTech" },
  { keywords: ["ai","machine learning","deep learning","llm","nlp","neural","model","openai","anthropic"], industry: "AI/ML" },
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

  // Leadership score
  let leadershipScore = 50;
  const leadershipKeywords = ["led","lead","managed","directed","headed","spearheaded","mentored","grew team","team of","founded","built team","oversaw","supervised"];
  leadershipKeywords.forEach(kw => { if (textLower.includes(kw)) leadershipScore += 5; });
  // Title bonuses
  if (/\b(manager|director|vp|head|principal|staff|lead)\b/i.test(text)) leadershipScore += 15;
  leadershipScore = Math.min(leadershipScore, 97);

  // Collaboration score
  let collaborationScore = 55;
  const collabKeywords = ["collaborated","cross-functional","partnered","stakeholder","worked with","team player","coordination","alignment","cross-team"];
  collabKeywords.forEach(kw => { if (textLower.includes(kw)) collaborationScore += 4; });
  collaborationScore = Math.min(collaborationScore, 95);

  // Adaptability score
  let adaptabilityScore = 55;
  const adaptKeywords = ["pivoted","transitioned","migrated","adopted","learned","rapid","fast-paced","ambiguity","startup","scaled","evolved"];
  adaptKeywords.forEach(kw => { if (textLower.includes(kw)) adaptabilityScore += 4; });
  // Multiple companies / industries suggests adaptability
  if (careerHistory.length >= 3) adaptabilityScore += 10;
  adaptabilityScore = Math.min(adaptabilityScore, 95);

  // Growth trajectory from career progression
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
  yearsOfExperience: number;
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
  const yearsOfExperience = extractYearsOfExperience(text);
  const careerHistory = extractCareerHistory(text);
  const education = extractEducation(text);
  const summary = extractSummary(text);
  const industries = inferIndustries(text, skills);
  const behavioralSignals = inferBehavioralSignals(text, careerHistory);

  return {
    id,
    name,
    title,
    location,
    email,
    yearsOfExperience,
    skills,
    careerHistory: careerHistory.length > 0 ? careerHistory : [{
      title,
      company: "Previous Employer",
      duration: `${new Date().getFullYear() - yearsOfExperience}–Present`,
      highlights: [],
    }],
    behavioralSignals,
    summary: summary || `Professional with ${yearsOfExperience} years of experience in ${industries[0] || "Technology"}.`,
    education,
    industries,
  };
}
