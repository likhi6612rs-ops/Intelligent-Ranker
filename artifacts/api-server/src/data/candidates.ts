export interface CareerEntry {
  title: string;
  company: string;
  duration: string;
  highlights: string[];
}

export interface BehavioralSignals {
  leadershipScore: number;
  collaborationScore: number;
  adaptabilityScore: number;
  growthTrajectory: string;
}

export interface PlatformActivity {
  applicationsSubmitted: number;
  responseRate: number;
  avgTimeToRespond: string;
  lastActive: string;
}

export interface Candidate {
  id: string;
  name: string;
  title: string;
  location: string;
  yearsOfExperience: number;
  skills: string[];
  careerHistory: CareerEntry[];
  behavioralSignals: BehavioralSignals;
  platformActivity: PlatformActivity;
  summary: string;
  education: string;
  industries: string[];
}

export const candidates: Candidate[] = [
  {
    id: "c001",
    name: "Aria Chen",
    title: "Senior Machine Learning Engineer",
    location: "San Francisco, CA",
    yearsOfExperience: 8,
    skills: ["Python", "PyTorch", "TensorFlow", "MLOps", "Kubernetes", "AWS", "Spark", "Scala", "Vector Databases", "RAG", "LLM Fine-tuning", "FastAPI"],
    careerHistory: [
      {
        title: "Senior ML Engineer",
        company: "OpenAI",
        duration: "2021–Present",
        highlights: [
          "Led training infrastructure for large language model fine-tuning pipelines serving 40M users",
          "Designed distributed training framework reducing GPU hours by 32%",
          "Shipped RAG-based enterprise search product from prototype to production"
        ]
      },
      {
        title: "ML Engineer",
        company: "Stripe",
        duration: "2018–2021",
        highlights: [
          "Built real-time fraud detection model processing 4B transactions/month with 99.2% precision",
          "Reduced false positive rate by 41% through multi-modal feature engineering",
          "Mentored 3 junior engineers; led ML platform adoption across the payments org"
        ]
      },
      {
        title: "Data Scientist",
        company: "Palantir",
        duration: "2016–2018",
        highlights: [
          "Deployed NLP pipeline for intelligence analysis reducing analyst workload by 60%",
          "Authored internal ML tooling used by 200+ data scientists"
        ]
      }
    ],
    behavioralSignals: {
      leadershipScore: 88,
      collaborationScore: 91,
      adaptabilityScore: 85,
      growthTrajectory: "steep"
    },
    platformActivity: {
      applicationsSubmitted: 3,
      responseRate: 100,
      avgTimeToRespond: "2 hours",
      lastActive: "Today"
    },
    summary: "Deep ML infrastructure expertise with a track record of shipping production AI systems at scale. Strong LLM and GenAI background from OpenAI. Excels at bridging research and engineering.",
    education: "M.S. Computer Science (ML), Stanford University",
    industries: ["AI/ML", "FinTech", "Government/Defense"]
  },
  {
    id: "c002",
    name: "Marcus Webb",
    title: "Staff Software Engineer – Platform",
    location: "New York, NY",
    yearsOfExperience: 11,
    skills: ["Go", "Rust", "Kubernetes", "gRPC", "Distributed Systems", "AWS", "GCP", "Kafka", "PostgreSQL", "Redis", "Terraform", "Python"],
    careerHistory: [
      {
        title: "Staff Engineer, Platform",
        company: "Datadog",
        duration: "2019–Present",
        highlights: [
          "Architected next-gen ingestion pipeline handling 10T metrics/day with sub-10ms p99 latency",
          "Led cross-functional team of 12 engineers across 3 time zones",
          "Reduced infrastructure cost by $2.4M/year through data tiering overhaul"
        ]
      },
      {
        title: "Senior SWE, Infrastructure",
        company: "Dropbox",
        duration: "2015–2019",
        highlights: [
          "Rebuilt core storage routing layer, improving global throughput by 3x",
          "Championed company-wide migration from Python 2 to Python 3"
        ]
      },
      {
        title: "Software Engineer",
        company: "Twilio",
        duration: "2013–2015",
        highlights: [
          "Delivered SMS delivery reliability system achieving 99.99% uptime",
          "Published open-source Go client library with 4K+ GitHub stars"
        ]
      }
    ],
    behavioralSignals: {
      leadershipScore: 92,
      collaborationScore: 86,
      adaptabilityScore: 78,
      growthTrajectory: "steady"
    },
    platformActivity: {
      applicationsSubmitted: 5,
      responseRate: 80,
      avgTimeToRespond: "1 day",
      lastActive: "Yesterday"
    },
    summary: "Platform engineering expert with deep distributed systems knowledge. Consistent track record of leading high-impact infrastructure initiatives at top-tier tech companies.",
    education: "B.S. Computer Engineering, Cornell University",
    industries: ["Infrastructure", "SaaS", "Communications"]
  },
  {
    id: "c003",
    name: "Sofia Navarro",
    title: "Product Engineer – Full Stack",
    location: "Austin, TX",
    yearsOfExperience: 5,
    skills: ["TypeScript", "React", "Next.js", "Node.js", "GraphQL", "PostgreSQL", "Prisma", "Tailwind CSS", "Figma", "Cypress", "Storybook"],
    careerHistory: [
      {
        title: "Product Engineer",
        company: "Linear",
        duration: "2022–Present",
        highlights: [
          "Rebuilt core issue-tracking UI, improving perceived performance by 60%",
          "Designed and shipped Linear's GitHub integration used by 200K+ teams",
          "Owned the design system migration to Radix UI + Tailwind, adopted across 3 product squads"
        ]
      },
      {
        title: "Frontend Engineer",
        company: "Vercel",
        duration: "2020–2022",
        highlights: [
          "Shipped Next.js edge middleware dashboard used by 800K developers",
          "Led accessibility audit resulting in WCAG AA compliance across all products"
        ]
      }
    ],
    behavioralSignals: {
      leadershipScore: 73,
      collaborationScore: 95,
      adaptabilityScore: 92,
      growthTrajectory: "steep"
    },
    platformActivity: {
      applicationsSubmitted: 2,
      responseRate: 100,
      avgTimeToRespond: "3 hours",
      lastActive: "Today"
    },
    summary: "Rare product engineer who thinks in systems and ships pixel-perfect UIs. Extremely high cross-functional trust; operates comfortably from design spec to database schema.",
    education: "B.S. Computer Science, UT Austin",
    industries: ["Developer Tools", "SaaS", "Design Tools"]
  },
  {
    id: "c004",
    name: "Devon Park",
    title: "Data Engineer & Analytics Lead",
    location: "Seattle, WA",
    yearsOfExperience: 7,
    skills: ["Python", "Spark", "dbt", "Airflow", "Snowflake", "BigQuery", "Kafka", "SQL", "Looker", "Redshift", "Terraform", "Docker"],
    careerHistory: [
      {
        title: "Senior Data Engineer",
        company: "Airbnb",
        duration: "2020–Present",
        highlights: [
          "Built real-time pricing pipeline processing 8M property signals/hour",
          "Led data platform migration from Hive to Spark on Databricks, reducing ETL runtimes by 70%",
          "Mentored 6 engineers; established data quality framework adopted org-wide"
        ]
      },
      {
        title: "Data Engineer",
        company: "DoorDash",
        duration: "2017–2020",
        highlights: [
          "Designed demand forecasting data model used by 200+ dashboards",
          "Reduced stale data incidents by 85% through automated freshness monitoring"
        ]
      }
    ],
    behavioralSignals: {
      leadershipScore: 79,
      collaborationScore: 88,
      adaptabilityScore: 82,
      growthTrajectory: "steady"
    },
    platformActivity: {
      applicationsSubmitted: 7,
      responseRate: 71,
      avgTimeToRespond: "2 days",
      lastActive: "3 days ago"
    },
    summary: "Expert data engineer with a strong foundation in real-time pipelines and analytics infrastructure. Proven ability to lead complex data migrations with zero downtime.",
    education: "M.S. Statistics, University of Washington",
    industries: ["Travel & Hospitality", "Logistics", "Marketplace"]
  },
  {
    id: "c005",
    name: "James Okafor",
    title: "Engineering Manager – Backend",
    location: "Chicago, IL",
    yearsOfExperience: 12,
    skills: ["Java", "Spring Boot", "Microservices", "AWS", "MySQL", "Redis", "Docker", "Kotlin", "Python", "System Design", "Team Leadership", "Agile"],
    careerHistory: [
      {
        title: "Engineering Manager",
        company: "Braintree / PayPal",
        duration: "2018–Present",
        highlights: [
          "Managed team of 14 backend engineers delivering $1.2B/day payment processing",
          "Drove adoption of event-driven architecture reducing inter-service coupling by 55%",
          "Grew team from 6 to 14 by leading hiring and onboarding process"
        ]
      },
      {
        title: "Senior Backend Engineer",
        company: "Square",
        duration: "2015–2018",
        highlights: [
          "Designed payment reconciliation service processing 200M transactions/month",
          "Reduced API p99 latency from 450ms to 60ms through caching refactor"
        ]
      },
      {
        title: "Software Engineer",
        company: "JPMorgan Chase",
        duration: "2012–2015",
        highlights: [
          "Built core clearing system for FX trading desk",
          "Led migration from legacy COBOL system to modern Java microservices"
        ]
      }
    ],
    behavioralSignals: {
      leadershipScore: 96,
      collaborationScore: 89,
      adaptabilityScore: 74,
      growthTrajectory: "steady"
    },
    platformActivity: {
      applicationsSubmitted: 4,
      responseRate: 75,
      avgTimeToRespond: "1 day",
      lastActive: "2 days ago"
    },
    summary: "Seasoned engineering manager with deep FinTech domain knowledge. Exceptional at growing teams, architectural decision-making, and high-stakes backend systems.",
    education: "B.S. Electrical Engineering, University of Illinois",
    industries: ["FinTech", "Payments", "Banking"]
  },
  {
    id: "c006",
    name: "Priya Mehta",
    title: "Security Engineer – AppSec",
    location: "Remote (US)",
    yearsOfExperience: 6,
    skills: ["Python", "Go", "Penetration Testing", "SAST/DAST", "AWS Security", "Zero Trust", "OAuth", "OWASP", "Burp Suite", "Threat Modeling", "Kubernetes Security"],
    careerHistory: [
      {
        title: "Senior Application Security Engineer",
        company: "Cloudflare",
        duration: "2021–Present",
        highlights: [
          "Led AppSec review for Workers platform serving 20M+ developers",
          "Identified and remediated 47 critical vulnerabilities before release",
          "Built automated SAST pipeline reducing security review cycle from 5 days to 4 hours"
        ]
      },
      {
        title: "Security Engineer",
        company: "HackerOne",
        duration: "2018–2021",
        highlights: [
          "Triaged and validated 1,200+ vulnerability reports for Fortune 500 clients",
          "Developed internal bounty triage automation, increasing throughput by 3x"
        ]
      }
    ],
    behavioralSignals: {
      leadershipScore: 72,
      collaborationScore: 83,
      adaptabilityScore: 88,
      growthTrajectory: "steep"
    },
    platformActivity: {
      applicationsSubmitted: 2,
      responseRate: 100,
      avgTimeToRespond: "4 hours",
      lastActive: "Today"
    },
    summary: "Highly technical AppSec engineer with both offensive and defensive expertise. Built scalable security automation tooling and has a researcher's instinct for finding vulnerabilities.",
    education: "B.S. Computer Science (Security Track), Georgia Tech",
    industries: ["Cybersecurity", "Developer Infrastructure", "SaaS"]
  },
  {
    id: "c007",
    name: "Tyler Huang",
    title: "Founding Engineer – Generalist",
    location: "San Francisco, CA",
    yearsOfExperience: 4,
    skills: ["TypeScript", "Python", "React", "FastAPI", "PostgreSQL", "Redis", "AWS", "Stripe", "OpenAI API", "Docker", "Next.js", "Supabase"],
    careerHistory: [
      {
        title: "Founding Engineer",
        company: "Krea AI",
        duration: "2023–Present",
        highlights: [
          "Built core image generation product from zero to 300K active users in 8 months",
          "Owned full stack: frontend, API, ML inference, billing, and infra",
          "Shipped 12 major product features solo across 18 months"
        ]
      },
      {
        title: "Software Engineer",
        company: "Scale AI",
        duration: "2021–2023",
        highlights: [
          "Led tasker platform migration to TypeScript, improving type safety across 60K LOC",
          "Built real-time annotation pipeline handling 50M images/month"
        ]
      }
    ],
    behavioralSignals: {
      leadershipScore: 81,
      collaborationScore: 77,
      adaptabilityScore: 97,
      growthTrajectory: "steep"
    },
    platformActivity: {
      applicationsSubmitted: 1,
      responseRate: 100,
      avgTimeToRespond: "1 hour",
      lastActive: "Today"
    },
    summary: "Extremely high-velocity engineer who ships entire product surfaces solo. Thrives in ambiguity and startup environments. Generalist with genuine depth in AI product engineering.",
    education: "B.S. Computer Science, UC Berkeley",
    industries: ["AI/ML", "Developer Tools", "Consumer Tech"]
  },
  {
    id: "c008",
    name: "Rachel Torres",
    title: "iOS Engineer – Consumer Apps",
    location: "Los Angeles, CA",
    yearsOfExperience: 7,
    skills: ["Swift", "SwiftUI", "Objective-C", "Xcode", "Core Data", "Combine", "ARKit", "Push Notifications", "Firebase", "A/B Testing", "Instruments"],
    careerHistory: [
      {
        title: "Senior iOS Engineer",
        company: "Snap Inc.",
        duration: "2020–Present",
        highlights: [
          "Led AR lens rendering pipeline adopted by 100M+ daily active users",
          "Reduced app launch time by 40% through async initialization refactor",
          "Shipped 5 major Snapchat features including Dual Camera mode"
        ]
      },
      {
        title: "iOS Engineer",
        company: "Robinhood",
        duration: "2017–2020",
        highlights: [
          "Built core trading UI handling real-time price streaming for 5M users",
          "Designed offline-first architecture enabling trading in poor connectivity"
        ]
      }
    ],
    behavioralSignals: {
      leadershipScore: 74,
      collaborationScore: 87,
      adaptabilityScore: 80,
      growthTrajectory: "steady"
    },
    platformActivity: {
      applicationsSubmitted: 3,
      responseRate: 67,
      avgTimeToRespond: "3 days",
      lastActive: "1 week ago"
    },
    summary: "Expert iOS engineer specializing in high-performance consumer apps. Deep AR and real-time rendering experience. Pragmatic and ships with strong attention to UX quality.",
    education: "B.S. Software Engineering, Cal Poly SLO",
    industries: ["Consumer Tech", "Social Media", "FinTech"]
  },
  {
    id: "c009",
    name: "Nathan Reyes",
    title: "DevOps / Platform Engineer",
    location: "Denver, CO",
    yearsOfExperience: 9,
    skills: ["Kubernetes", "Terraform", "AWS", "GCP", "ArgoCD", "Helm", "Prometheus", "Grafana", "Ansible", "Python", "Bash", "CI/CD", "GitOps"],
    careerHistory: [
      {
        title: "Staff DevOps Engineer",
        company: "HashiCorp",
        duration: "2020–Present",
        highlights: [
          "Maintained Vault and Terraform Cloud infrastructure serving 100K+ enterprise customers",
          "Reduced mean time to recovery by 65% through automated incident response runbooks",
          "Built internal platform enabling 300+ engineers to deploy independently"
        ]
      },
      {
        title: "Senior DevOps Engineer",
        company: "SendGrid",
        duration: "2016–2020",
        highlights: [
          "Orchestrated migration of 400+ services to Kubernetes with zero downtime",
          "Established cost observability practices saving $800K/year on cloud spend"
        ]
      }
    ],
    behavioralSignals: {
      leadershipScore: 82,
      collaborationScore: 85,
      adaptabilityScore: 89,
      growthTrajectory: "steady"
    },
    platformActivity: {
      applicationsSubmitted: 6,
      responseRate: 83,
      avgTimeToRespond: "1 day",
      lastActive: "Yesterday"
    },
    summary: "Deep Kubernetes and cloud infrastructure expertise with a platform-as-a-product mindset. Consistent track record of enabling engineering orgs to move faster with less toil.",
    education: "B.S. Information Technology, University of Denver",
    industries: ["Developer Infrastructure", "SaaS", "Cloud"]
  },
  {
    id: "c010",
    name: "Elena Vasquez",
    title: "AI Research Engineer",
    location: "Boston, MA",
    yearsOfExperience: 5,
    skills: ["Python", "PyTorch", "JAX", "Transformers", "RLHF", "NLP", "Computer Vision", "LLM Evaluation", "Weights & Biases", "CUDA", "Docker", "Research"],
    careerHistory: [
      {
        title: "Research Engineer",
        company: "Anthropic",
        duration: "2022–Present",
        highlights: [
          "Contributed to Constitutional AI alignment methodology for Claude",
          "Developed automated red-teaming system evaluating model safety across 50K+ adversarial prompts",
          "Co-authored 2 peer-reviewed papers on RLHF reward modeling"
        ]
      },
      {
        title: "ML Research Intern",
        company: "Google Brain",
        duration: "2021",
        highlights: [
          "Implemented vision-language grounding experiments on CLIP variants",
          "Contributed to PaLM pre-training evaluation suite"
        ]
      },
      {
        title: "Research Assistant",
        company: "MIT CSAIL",
        duration: "2019–2022",
        highlights: [
          "Researched multi-agent reinforcement learning for robotic planning",
          "Published first-author paper at NeurIPS 2021"
        ]
      }
    ],
    behavioralSignals: {
      leadershipScore: 65,
      collaborationScore: 78,
      adaptabilityScore: 90,
      growthTrajectory: "steep"
    },
    platformActivity: {
      applicationsSubmitted: 2,
      responseRate: 100,
      avgTimeToRespond: "6 hours",
      lastActive: "Today"
    },
    summary: "World-class AI research engineer with deep alignment and LLM expertise from Anthropic. Strong publication record and ability to bridge theoretical ML research with engineering implementation.",
    education: "Ph.D. (ABD) Computer Science, MIT — specialization in AI Safety",
    industries: ["AI Research", "AI Safety", "Robotics"]
  },
  {
    id: "c011",
    name: "Chris Almeida",
    title: "Backend Engineer – Ruby / Rails",
    location: "Portland, OR",
    yearsOfExperience: 6,
    skills: ["Ruby", "Rails", "PostgreSQL", "Redis", "Sidekiq", "REST APIs", "Docker", "Heroku", "AWS", "RSpec", "GraphQL", "Elasticsearch"],
    careerHistory: [
      {
        title: "Senior Backend Engineer",
        company: "Shopify",
        duration: "2020–Present",
        highlights: [
          "Owned storefront GraphQL API serving 1.7M merchants globally",
          "Led performance work reducing p95 API response time from 800ms to 190ms",
          "Mentored 4 engineers; ran weekly architecture review sessions"
        ]
      },
      {
        title: "Backend Engineer",
        company: "GitHub",
        duration: "2018–2020",
        highlights: [
          "Maintained Rails monolith serving 80M developers with 99.95% uptime",
          "Built webhook delivery system processing 2B+ events/day"
        ]
      }
    ],
    behavioralSignals: {
      leadershipScore: 76,
      collaborationScore: 90,
      adaptabilityScore: 72,
      growthTrajectory: "steady"
    },
    platformActivity: {
      applicationsSubmitted: 4,
      responseRate: 75,
      avgTimeToRespond: "2 days",
      lastActive: "4 days ago"
    },
    summary: "Highly experienced Rails engineer who has worked on some of the most scaled Ruby codebases in existence. Strong mentorship track record and API design intuition.",
    education: "B.S. Computer Science, Oregon State University",
    industries: ["E-Commerce", "Developer Tools", "SaaS"]
  },
  {
    id: "c012",
    name: "Zara Osei",
    title: "Growth Engineer & Experimentation Lead",
    location: "New York, NY",
    yearsOfExperience: 5,
    skills: ["Python", "JavaScript", "SQL", "A/B Testing", "Amplitude", "Mixpanel", "React", "Node.js", "BigQuery", "Statsig", "Experimentation Platforms", "Analytics"],
    careerHistory: [
      {
        title: "Growth Engineer",
        company: "Notion",
        duration: "2021–Present",
        highlights: [
          "Built experimentation platform handling 300+ concurrent A/B tests",
          "Shipped onboarding flow improvements driving 28% lift in 30-day retention",
          "Created ML-based lead scoring model improving sales conversion by 15%"
        ]
      },
      {
        title: "Product Analyst → Growth Eng",
        company: "Duolingo",
        duration: "2019–2021",
        highlights: [
          "Designed streak-repair feature experiment that became permanent product",
          "Transitioned from analytics to engineering after building own Python automation tools"
        ]
      }
    ],
    behavioralSignals: {
      leadershipScore: 77,
      collaborationScore: 93,
      adaptabilityScore: 91,
      growthTrajectory: "steep"
    },
    platformActivity: {
      applicationsSubmitted: 3,
      responseRate: 100,
      avgTimeToRespond: "5 hours",
      lastActive: "Today"
    },
    summary: "Unique mix of quantitative rigor and engineering execution. Builds and owns experimentation infrastructure, then runs the experiments on it. Deep product intuition from analytics background.",
    education: "B.S. Statistics & Computer Science, Columbia University",
    industries: ["Consumer Tech", "EdTech", "SaaS / PLG"]
  }
];
