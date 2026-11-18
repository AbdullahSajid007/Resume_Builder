export const initialEmptyResume = {
  title: "Untitled Resume",
  template_name: "modern",
  theme_color: "#1e3a8a",
  font_family: "Inter",
  is_draft: false,
  personal_info: {
    full_name: "",
    email: "",
    phone: "",
    location: "",
    professional_title: "",
    summary: "",
    photo_url: "",
    linkedin_url: "",
    github_url: "",
    portfolio_url: "",
    twitter_url: "",
    leetcode_url: ""
  },
  educations: [],
  experiences: [],
  skills: [],
  projects: [],
  certifications: []
};

export const sampleCandidateResume = {
  title: "Senior Full Stack Software Engineer",
  template_name: "modern",
  theme_color: "#1e3a8a",
  font_family: "Inter",
  is_draft: false,
  personal_info: {
    full_name: "Alex Morgan",
    email: "alex.morgan@example.com",
    phone: "+1 (555) 019-2834",
    location: "San Francisco, CA / Remote",
    professional_title: "Senior Full-Stack & Cloud Systems Architect",
    summary: "Dynamic software engineer with 5+ years building scalable web architectures, high-performance microservices, and reactive SPAs. Proven record leading distributed teams and driving 99.99% system availability.",
    photo_url: "",
    linkedin_url: "linkedin.com/in/alexmorgan-dev",
    github_url: "github.com/alexmorgan-code",
    portfolio_url: "alexmorgan.dev",
    twitter_url: "x.com/alexmorgan_dev",
    leetcode_url: "leetcode.com/alexmorgan"
  },
  educations: [
    {
      id: 1,
      degree: "B.Sc. in Computer Science & Engineering",
      institution: "Metropolitan University",
      location: "San Francisco, CA",
      start_year: "2017",
      end_year: "2021",
      cgpa: "3.92 / 4.00",
      achievements: "Dean's List for Academic Excellence, Capstone Award for AI-driven Career Platform."
    }
  ],
  experiences: [
    {
      id: 1,
      job_title: "Lead Backend Engineer",
      company: "Nexus Cloud Innovations",
      location: "San Francisco, CA",
      start_date: "2023",
      end_date: "Present",
      is_current: true,
      responsibilities: "Architected high-throughput RESTful & GraphQL microservices with FastAPI and PostgreSQL, slashing API p99 latency by 35%. Spearheaded CI/CD pipelines on Render and AWS."
    },
    {
      id: 2,
      job_title: "Full-Stack Developer",
      company: "Apex Technologies Inc.",
      location: "Austin, TX",
      start_date: "2021",
      end_date: "2023",
      is_current: false,
      responsibilities: "Engineered responsive client dashboards with React and Redux. Integrated automated PDF export engines and secure payment gateways handling 100k+ transactions."
    }
  ],
  skills: [
    { id: 1, name: "Python & FastAPI", category: "Technical", proficiency_level: "Expert" },
    { id: 2, name: "React & TypeScript", category: "Technical", proficiency_level: "Advanced" },
    { id: 3, name: "PostgreSQL & SQLAlchemy", category: "Technical", proficiency_level: "Expert" },
    { id: 4, name: "Docker & Cloud Hosting", category: "Technical", proficiency_level: "Advanced" },
    { id: 5, name: "System Design & Architecture", category: "Technical", proficiency_level: "Expert" },
    { id: 6, name: "Agile Leadership & Mentorship", category: "Soft", proficiency_level: "Advanced" }
  ],
  projects: [
    {
      id: 1,
      title: "Distributed Real-Time Analytics Engine",
      description: "Built real-time streaming pipeline processing 10,000 events/sec with automated PDF report exports.",
      technologies: "Python, FastAPI, Kafka, Redis, PostgreSQL",
      project_url: "https://github.com/alexmorgan-code/distributed-analytics"
    }
  ],
  certifications: [
    {
      id: 1,
      name: "AWS Certified Solutions Architect – Associate",
      issuing_org: "Amazon Web Services",
      issue_date: "2023",
      cert_url: "https://aws.amazon.com/certification"
    }
  ]
};

export const THEME_PALETTES = [
  { name: "Corporate Navy", hex: "#1e3a8a", bg: "bg-blue-900" },
  { name: "Emerald Green", hex: "#065f46", bg: "bg-emerald-800" },
  { name: "Executive Slate", hex: "#334155", bg: "bg-slate-700" },
  { name: "Royal Purple", hex: "#581c87", bg: "bg-purple-900" },
  { name: "Crimson Wine", hex: "#881337", bg: "bg-rose-900" },
  { name: "Sunset Amber", hex: "#b45309", bg: "bg-amber-700" },
];

export const TEMPLATES = [
  { id: "modern", name: "Modern Minimalist", desc: "Clean header bar, accent dividers, badge styling" },
  { id: "classic", name: "Classic Professional", desc: "Traditional academic/executive serif layout" },
  { id: "executive", name: "Executive Two-Column", desc: "Left sidebar for contact & skills, right column for experience" },
  { id: "creative", name: "Creative Tech", desc: "Hero header, tech pills, prominent project showcases" },
];
