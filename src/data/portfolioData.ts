export interface ProjectItem {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  capabilities?: string[];
  tags: string[];
  liveUrl: string;
  githubUrl?: string;
  image: string;
  ctaText: string;
  featured: boolean;
}

export interface TechItem {
  name: string;
  category: 'Programming' | 'Frontend' | 'Backend' | 'Database' | 'Tools' | 'Special Focus';
  level: string;
  description: string;
  iconName: string;
}

export interface JourneyStage {
  stage: string;
  title: string;
  timeline: string;
  summary: string;
  details: string[];
  status: 'Completed' | 'In Progress' | 'Active Focus';
}

export interface FocusGoal {
  number: string;
  title: string;
  description: string;
  highlight: string;
  iconName: string;
}

export const PERSONAL_INFO = {
  name: "Bhuvan KG",
  role: "Aspiring Software Developer",
  subRole: "Full-Stack Web Developer | Information Science and Engineering Student",
  education: "Bachelor of Engineering in Information Science and Engineering",
  educationSub: "2nd Year Engineering Student under VTU (Visvesvaraya Technological University)",
  location: "Karnataka, India",
  profileImage: "/assets/bhuvan-profile.png",
  github: "https://github.com/bhuvankg",
  linkedin: "https://linkedin.com/in/bhuvankg",
  instagram: "https://instagram.com/bhuvankg",
  email: "bhuvankg.contact@gmail.com",
  
  heroBadge: "INFORMATION SCIENCE & ENGINEERING STUDENT",
  heroHeading: "Building Ideas",
  heroHeadingHighlight: "Into Digital Reality.",
  heroIntro: "I'm Bhuvan KG — a developer who loves creating useful, modern, and interactive digital experiences.",
  heroSubtext: "Currently Learning. Constantly Building. Always Improving.",
  
  aboutHeading: "Beyond The Code.",
  aboutParagraph1: "I'm an Information Science and Engineering student who enjoys exploring technology, developing web applications, and turning creative ideas into working projects.",
  aboutParagraph2: "My learning journey is driven by curiosity, practical experience, and the desire to build software that people can actually use.",
  aboutParagraph3: "I believe consistent learning and building real projects are important steps toward becoming a skilled software developer.",
  
  brandKeywords: [
    "Innovation",
    "Discipline",
    "Creativity",
    "Consistency",
    "Technology",
    "Problem Solving",
    "Growth",
    "Continuous Learning"
  ],
  
  cardDetails: {
    name: "Bhuvan KG",
    field: "Information Science and Engineering",
    currentFocus: "Web Development | Software Development | Real-World Projects",
    location: "Karnataka, India",
    university: "VTU, Karnataka",
    year: "2nd Year B.E."
  }
};

export const PROJECTS: ProjectItem[] = [
  {
    id: "smart-canteen",
    title: "Smart Canteen Website",
    subtitle: "Digital Food-Ordering Experience",
    description: "A web-based canteen project focused on presenting a digital food-ordering experience through a modern interface. Designed to streamline campus dining menu discovery and order coordination.",
    tags: ["HTML", "CSS", "JavaScript", "Web Development", "Node.js"],
    liveUrl: "https://smrat-canteen-web.onrender.com",
    image: "/projects/canteen.png",
    ctaText: "View Live Project",
    featured: true
  },
  {
    id: "scholarship-hub",
    title: "Scholarship Hub",
    subtitle: "Centralized Education Scheme Discovery",
    description: "A scholarship-focused web project designed to help users explore scholarship-related information through a dedicated digital platform, bringing clarity to educational assistance schemes.",
    tags: ["HTML5", "CSS3", "JavaScript", "Netlify", "UI Design"],
    liveUrl: "https://scholarsshiphub.netlify.app/",
    image: "/projects/scholarhub.png",
    ctaText: "Explore Project",
    featured: true
  },
  {
    id: "puthari-restaurant",
    title: "Put Hari Restaurant Website",
    subtitle: "Modern Restaurant Digital Presence",
    description: "A restaurant website created to present restaurant information through a polished and accessible online experience, featuring family restaurant dining ambiance and regional cuisine details.",
    tags: ["HTML", "CSS", "JavaScript", "Responsive Design", "GitHub Pages"],
    liveUrl: "https://bhuvankg.github.io/puthari-restaurant/",
    githubUrl: "https://github.com/Bhuvankg/puthari-restaurant",
    image: "/projects/puthari.png",
    ctaText: "Visit Restaurant Website",
    featured: true
  },
  {
    id: "gradeai-autograder",
    title: "GradeAI Autograder",
    subtitle: "AI-Powered Assignment Evaluation Platform",
    description: "An AI-powered assignment grading project designed around automated assessment, student feedback, and a more efficient grading workflow for academic institutions.",
    capabilities: [
      "MCQ Automated Grading & Instant Scoring",
      "Short-Answer Semantic Evaluation",
      "Constructive Student Feedback Generation",
      "Academic Integrity & Plagiarism Flagging",
      "Role-Based Student & Teacher Dashboards"
    ],
    tags: ["Node.js", "Express", "MySQL / SQLite", "AI Evaluation", "Railway"],
    liveUrl: "https://web-production-4093cd.up.railway.app/",
    githubUrl: "https://github.com/Bhuvankg/gradeai-autograder",
    image: "/projects/gradeai.png",
    ctaText: "Launch GradeAI",
    featured: true
  }
];

export const TECH_CATEGORIES = [
  'All',
  'Programming',
  'Frontend',
  'Backend',
  'Database',
  'Tools',
  'Special Focus'
] as const;

export const TECH_STACK: TechItem[] = [
  // Programming
  {
    name: "C",
    category: "Programming",
    level: "Core Fundamentals",
    description: "Algorithmic thinking, memory concepts, and foundational programming logic.",
    iconName: "Code2"
  },
  {
    name: "Python",
    category: "Programming",
    level: "Scripting & Logic",
    description: "Data handling, algorithm implementation, and backend scripting foundations.",
    iconName: "Terminal"
  },
  {
    name: "JavaScript",
    category: "Programming",
    level: "Modern ES6+",
    description: "Core asynchronous programming, DOM interactions, and web application logic.",
    iconName: "FileCode"
  },
  
  // Frontend
  {
    name: "HTML5",
    category: "Frontend",
    level: "Semantic Markup",
    description: "Structured, accessible document architecture and modern web standards.",
    iconName: "Layout"
  },
  {
    name: "CSS3",
    category: "Frontend",
    level: "Modern Styling",
    description: "Flexbox, Grid systems, responsive design, animations, and glassmorphism styling.",
    iconName: "Palette"
  },
  {
    name: "JavaScript (DOM)",
    category: "Frontend",
    level: "Interactive UI",
    description: "Dynamic client-side interactivity, event listeners, and API integration.",
    iconName: "Sparkles"
  },
  
  // Backend
  {
    name: "Node.js",
    category: "Backend",
    level: "Server Runtime",
    description: "Building RESTful servers, request handling, middleware pipelines, and API routing.",
    iconName: "Server"
  },
  
  // Database
  {
    name: "MySQL",
    category: "Database",
    level: "Relational Modeling",
    description: "Relational schemas, queries, table normalization, and transactional data storage.",
    iconName: "Database"
  },
  
  // Tools
  {
    name: "Git",
    category: "Tools",
    level: "Version Control",
    description: "Branching, committing, staging, merging, and tracking code revisions.",
    iconName: "GitBranch"
  },
  {
    name: "GitHub",
    category: "Tools",
    level: "Collaboration & Hosting",
    description: "Remote repositories, open-source workflow, version tracking, and deployment hooks.",
    iconName: "Github"
  },
  {
    name: "Visual Studio Code",
    category: "Tools",
    level: "Primary IDE",
    description: "Configured developer environment with linting, debugging, and terminal workflows.",
    iconName: "Monitor"
  },
  
  // Additional Interests
  {
    name: "Three.js & 3D Web",
    category: "Special Focus",
    level: "Active Exploration",
    description: "Creating immersive WebGL 3D scenes, particle simulations, and interactive shaders.",
    iconName: "Box"
  },
  {
    name: "Full-Stack Development",
    category: "Special Focus",
    level: "Active Exploration",
    description: "Connecting responsive frontend client interfaces with reliable backend databases.",
    iconName: "Layers"
  },
  {
    name: "AI-Powered Applications",
    category: "Special Focus",
    level: "Active Exploration",
    description: "Integrating intelligent assessment algorithms, automated pipelines, and assistive AI.",
    iconName: "Cpu"
  }
];

export const JOURNEY_STAGES: JourneyStage[] = [
  {
    stage: "Stage 01",
    title: "Learning Programming Fundamentals",
    timeline: "Foundation",
    summary: "Building a solid foundation in core computing, algorithmic logic, and structured problem-solving.",
    details: [
      "Mastered procedural programming paradigms in C",
      "Explored data representation, loops, conditional constructs, and pointers",
      "Built command-line logic scripts and mathematical problem solvers"
    ],
    status: "Completed"
  },
  {
    stage: "Stage 02",
    title: "Exploring Web Development",
    timeline: "Discovery",
    summary: "Discovering how the web works and learning how to construct engaging, accessible user interfaces.",
    details: [
      "Learned semantic HTML5 architecture and web accessibility guidelines",
      "Mastered responsive CSS layouts using Flexbox, CSS Grid, and custom styling",
      "Implemented client-side scripting and interactive DOM manipulation with JavaScript"
    ],
    status: "Completed"
  },
  {
    stage: "Stage 03",
    title: "Building Practical Projects",
    timeline: "Implementation",
    summary: "Turning creative concepts into functional web applications addressing tangible, real-world user needs.",
    details: [
      "Created the Puthari Restaurant digital presence with responsive menus",
      "Developed ScholarHub for streamlined educational scholarship discovery",
      "Engineered the Smart Canteen web portal for campus dining experiences",
      "Deployed live websites on Render, Netlify, and GitHub Pages"
    ],
    status: "Completed"
  },
  {
    stage: "Stage 04",
    title: "Developing Full-Stack Applications",
    timeline: "Architecture",
    summary: "Advancing into backend development, persistent databases, and connected application architectures.",
    details: [
      "Built backend servers using Node.js and Express with RESTful endpoint designs",
      "Integrated relational databases with MySQL, managing data schemas and relations",
      "Architected GradeAI: Intelligent Assignment Autograder with AI evaluation features"
    ],
    status: "Active Focus"
  },
  {
    stage: "Stage 05",
    title: "Continuously Improving Software Development Skills",
    timeline: "Evolution",
    summary: "Broadening technical depth, exploring modern 3D web technologies, and honing software craftsmanship.",
    details: [
      "Mastering modern reactive architectures, component systems, and state management",
      "Exploring Three.js, WebGL shaders, and high-performance interactive 3D web experiences",
      "Deepening Information Science & Engineering coursework under VTU"
    ],
    status: "In Progress"
  }
];

export const FOCUS_GOALS: FocusGoal[] = [
  {
    number: "01",
    title: "Full-Stack Development",
    description: "Learning to connect modern user interfaces, backend services, and databases into complete applications.",
    highlight: "End-to-End Application Architecture",
    iconName: "Layers"
  },
  {
    number: "02",
    title: "Real-World Problem Solving",
    description: "Building useful projects that address practical problems in education, campus life, and everyday digital experiences.",
    highlight: "Software That Actually Helps People",
    iconName: "Target"
  },
  {
    number: "03",
    title: "Continuous Improvement",
    description: "Strengthening programming fundamentals, software engineering knowledge, and project-building skills.",
    highlight: "Discipline, Consistency & Curiosity",
    iconName: "TrendingUp"
  }
];
