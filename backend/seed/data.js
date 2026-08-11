// Realistic-shaped sample data for the skill-graph job matching app.
// Small enough to stay well inside the CognoDB free tier, big enough
// to make the multi-hop queries return interesting results.

const companies = [
  { id: "co1", name: "Nimbus Cloud", industry: "Cloud Infrastructure" },
  { id: "co2", name: "Ferrous Labs", industry: "Fintech" },
  { id: "co3", name: "Orbital Health", industry: "Healthtech" },
  { id: "co4", name: "Greenfield Retail", industry: "E-commerce" },
  { id: "co5", name: "Northbeam Analytics", industry: "Data & AI" },
];

const skills = [
  "JavaScript", "TypeScript", "React", "Node.js", "Express.js", "MongoDB",
  "PostgreSQL", "Redis", "Docker", "Kubernetes", "AWS", "GraphQL",
  "Python", "Django", "Machine Learning", "REST APIs", "System Design",
  "Java", "Spring Boot", "CI/CD", "Git", "Cypher", "Neo4j",
];

const candidates = [
  {
    id: "c1", name: "Ananya Sharma", location: "Bengaluru", experienceYears: 2, bio: "Full-stack developer focused on React and Node.",
    skills: [["JavaScript", "advanced"], ["React", "advanced"], ["Node.js", "intermediate"], ["MongoDB", "intermediate"], ["Git", "advanced"]],
    workedAt: [["co1", "SDE Intern", 1]],
  },
  {
    id: "c2", name: "Rohan Verma", location: "Delhi NCR", experienceYears: 1, bio: "MERN stack fresher, strong on data structures.",
    skills: [["JavaScript", "advanced"], ["React", "intermediate"], ["Express.js", "intermediate"], ["MongoDB", "advanced"], ["Git", "intermediate"]],
    workedAt: [["co1", "Frontend Intern", 1]],
  },
  {
    id: "c3", name: "Priya Nair", location: "Hyderabad", experienceYears: 3, bio: "Backend engineer, comfortable with distributed systems.",
    skills: [["Node.js", "advanced"], ["PostgreSQL", "advanced"], ["Redis", "intermediate"], ["Docker", "advanced"], ["System Design", "intermediate"]],
    workedAt: [["co2", "Backend Engineer", 2]],
  },
  {
    id: "c4", name: "Karan Mehta", location: "Pune", experienceYears: 4, bio: "Platform engineer, Kubernetes and AWS heavy.",
    skills: [["AWS", "advanced"], ["Kubernetes", "advanced"], ["Docker", "advanced"], ["CI/CD", "advanced"], ["System Design", "advanced"]],
    workedAt: [["co1", "DevOps Engineer", 3], ["co2", "Platform Engineer", 1]],
  },
  {
    id: "c5", name: "Sneha Iyer", location: "Chennai", experienceYears: 2, bio: "Python developer moving into ML.",
    skills: [["Python", "advanced"], ["Django", "intermediate"], ["Machine Learning", "intermediate"], ["PostgreSQL", "intermediate"]],
    workedAt: [["co5", "Data Engineer", 2]],
  },
  {
    id: "c6", name: "Aditya Rao", location: "Bengaluru", experienceYears: 1, bio: "Java backend fresher with Spring Boot projects.",
    skills: [["Java", "advanced"], ["Spring Boot", "advanced"], ["PostgreSQL", "intermediate"], ["Git", "intermediate"], ["REST APIs", "advanced"]],
    workedAt: [["co3", "Backend Intern", 1]],
  },
  {
    id: "c7", name: "Ishita Kapoor", location: "Delhi NCR", experienceYears: 5, bio: "Full-stack lead, mentors junior engineers.",
    skills: [["TypeScript", "advanced"], ["React", "advanced"], ["Node.js", "advanced"], ["GraphQL", "advanced"], ["AWS", "intermediate"], ["System Design", "advanced"]],
    workedAt: [["co1", "Tech Lead", 3], ["co4", "Senior Engineer", 2]],
  },
  {
    id: "c8", name: "Vikram Singh", location: "Gurugram", experienceYears: 2, bio: "Frontend engineer, design-system minded.",
    skills: [["JavaScript", "advanced"], ["React", "advanced"], ["TypeScript", "intermediate"], ["Git", "advanced"]],
    workedAt: [["co4", "Frontend Engineer", 2]],
  },
  {
    id: "c9", name: "Meera Joshi", location: "Mumbai", experienceYears: 3, bio: "Data engineer with graph database experience.",
    skills: [["Python", "advanced"], ["Neo4j", "advanced"], ["Cypher", "advanced"], ["PostgreSQL", "intermediate"], ["Machine Learning", "intermediate"]],
    workedAt: [["co5", "Data Engineer", 3]],
  },
  {
    id: "c10", name: "Arjun Reddy", location: "Hyderabad", experienceYears: 1, bio: "MERN fresher, active open-source contributor.",
    skills: [["JavaScript", "intermediate"], ["React", "intermediate"], ["Node.js", "intermediate"], ["Express.js", "intermediate"], ["MongoDB", "intermediate"], ["Git", "advanced"]],
    workedAt: [["co2", "SDE Intern", 1]],
  },
  {
    id: "c11", name: "Divya Menon", location: "Bengaluru", experienceYears: 6, bio: "Staff engineer, ex-founder, deep systems background.",
    skills: [["System Design", "advanced"], ["AWS", "advanced"], ["Kubernetes", "advanced"], ["Node.js", "advanced"], ["PostgreSQL", "advanced"]],
    workedAt: [["co1", "Staff Engineer", 4], ["co3", "Principal Engineer", 2]],
  },
  {
    id: "c12", name: "Farhan Ali", location: "Pune", experienceYears: 2, bio: "Backend developer with Java and Spring Boot.",
    skills: [["Java", "advanced"], ["Spring Boot", "advanced"], ["Docker", "intermediate"], ["REST APIs", "advanced"], ["Git", "intermediate"]],
    workedAt: [["co3", "Backend Engineer", 2]],
  },
  {
    id: "c13", name: "Neha Gupta", location: "Delhi NCR", experienceYears: 1, bio: "Fresher, strong DSA fundamentals, learning system design.",
    skills: [["JavaScript", "intermediate"], ["React", "intermediate"], ["MongoDB", "beginner"], ["Git", "intermediate"]],
    workedAt: [["co4", "SDE Intern", 1]],
  },
  {
    id: "c14", name: "Siddharth Bose", location: "Kolkata", experienceYears: 3, bio: "ML engineer working on recommendation systems.",
    skills: [["Python", "advanced"], ["Machine Learning", "advanced"], ["PostgreSQL", "intermediate"], ["AWS", "intermediate"], ["System Design", "intermediate"]],
    workedAt: [["co5", "ML Engineer", 3]],
  },
  {
    id: "c15", name: "Pooja Desai", location: "Ahmedabad", experienceYears: 4, bio: "Full-stack engineer who moved into platform work.",
    skills: [["React", "advanced"], ["Node.js", "advanced"], ["Docker", "intermediate"], ["Kubernetes", "intermediate"], ["CI/CD", "advanced"]],
    workedAt: [["co2", "Full-stack Engineer", 2], ["co1", "Platform Engineer", 1]],
  },
];

const jobs = [
  {
    id: "j1", companyId: "co1", title: "Frontend Engineer (React)", location: "Bengaluru", seniority: "Junior",
    description: "Build and maintain customer-facing dashboards in React and TypeScript.",
    skills: [["React", 3], ["JavaScript", 3], ["TypeScript", 2], ["Git", 1]],
  },
  {
    id: "j2", companyId: "co1", title: "Backend Engineer (Node.js)", location: "Bengaluru", seniority: "Mid",
    description: "Own core API services powering the Nimbus platform.",
    skills: [["Node.js", 3], ["Express.js", 2], ["PostgreSQL", 2], ["System Design", 2]],
  },
  {
    id: "j3", companyId: "co2", title: "Platform Engineer", location: "Hyderabad", seniority: "Mid",
    description: "Manage container orchestration and CI/CD pipelines for the trading platform.",
    skills: [["Kubernetes", 3], ["Docker", 3], ["AWS", 2], ["CI/CD", 3]],
  },
  {
    id: "j4", companyId: "co2", title: "Full-stack Developer (MERN)", location: "Hyderabad", seniority: "Junior",
    description: "Ship features end to end across a MongoDB, Express, React, Node stack.",
    skills: [["MongoDB", 2], ["Express.js", 2], ["React", 2], ["Node.js", 2], ["Git", 1]],
  },
  {
    id: "j5", companyId: "co3", title: "Backend Engineer (Java)", location: "Pune", seniority: "Junior",
    description: "Build clinical workflow APIs used by hospital partners.",
    skills: [["Java", 3], ["Spring Boot", 3], ["PostgreSQL", 2], ["REST APIs", 2]],
  },
  {
    id: "j6", companyId: "co3", title: "Principal Engineer", location: "Pune", seniority: "Senior",
    description: "Set technical direction across the Orbital Health platform.",
    skills: [["System Design", 3], ["AWS", 2], ["Kubernetes", 2], ["Node.js", 2]],
  },
  {
    id: "j7", companyId: "co4", title: "Frontend Engineer (Design Systems)", location: "Gurugram", seniority: "Mid",
    description: "Own the component library used across all Greenfield storefronts.",
    skills: [["React", 3], ["TypeScript", 2], ["JavaScript", 2], ["Git", 1]],
  },
  {
    id: "j8", companyId: "co4", title: "Full-stack Engineer", location: "Gurugram", seniority: "Junior",
    description: "Work across checkout, catalog and search features.",
    skills: [["React", 2], ["Node.js", 2], ["MongoDB", 2], ["GraphQL", 1]],
  },
  {
    id: "j9", companyId: "co5", title: "Data Engineer", location: "Chennai", seniority: "Mid",
    description: "Build data pipelines feeding the recommendation models.",
    skills: [["Python", 3], ["PostgreSQL", 2], ["Machine Learning", 1], ["AWS", 1]],
  },
  {
    id: "j10", companyId: "co5", title: "ML Engineer", location: "Chennai", seniority: "Mid",
    description: "Train and deploy models for demand forecasting.",
    skills: [["Python", 3], ["Machine Learning", 3], ["System Design", 1], ["AWS", 2]],
  },
  {
    id: "j11", companyId: "co5", title: "Graph Data Engineer", location: "Remote", seniority: "Mid",
    description: "Model and query the entity graph behind Northbeam's analytics product.",
    skills: [["Neo4j", 3], ["Cypher", 3], ["Python", 2], ["PostgreSQL", 1]],
  },
  {
    id: "j12", companyId: "co1", title: "DevOps Engineer", location: "Bengaluru", seniority: "Mid",
    description: "Automate infrastructure provisioning and release pipelines.",
    skills: [["AWS", 3], ["Docker", 2], ["Kubernetes", 2], ["CI/CD", 3]],
  },
];

module.exports = { companies, skills, candidates, jobs };
