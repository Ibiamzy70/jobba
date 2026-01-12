
export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: 'Full-time' | 'Part-time' | 'Contract' | 'Remote' | 'Internship';
  salary?: string;
  description: string;
  requirements: string[];
  postedAt: string;
  logoUrl: string;
  featured: boolean;
}

export const jobs: Job[] = [
  {
    id: '1',
    title: 'Senior Frontend Developer',
    company: 'TechCorp Inc.',
    location: 'San Francisco, CA (Remote)',
    type: 'Full-time',
    salary: '$120,000 - $150,000',
    description: 'TechCorp is seeking a Senior Frontend Developer to join our growing team. You will be responsible for building user interfaces for our enterprise SaaS platform using React, TypeScript, and modern web technologies.',
    requirements: [
      '5+ years of experience with React and modern JavaScript',
      'Strong understanding of TypeScript',
      'Experience with state management solutions',
      'Excellent problem-solving skills'
    ],
    postedAt: '2023-05-01',
    logoUrl: '/placeholder.svg',
    featured: true
  },
  {
    id: '2',
    title: 'Backend Engineer',
    company: 'DataFlow Systems',
    location: 'New York, NY',
    type: 'Full-time',
    salary: '$115,000 - $140,000',
    description: 'Join our backend team to develop scalable APIs and services for our data processing platform. You will work with Node.js, PostgreSQL, and cloud infrastructure.',
    requirements: [
      '3+ years experience with Node.js or similar backend technologies',
      'Knowledge of SQL and database design',
      'Experience with RESTful APIs and microservices',
      'Understanding of cloud platforms (AWS, GCP)'
    ],
    postedAt: '2023-04-28',
    logoUrl: '/placeholder.svg',
    featured: false
  },
  {
    id: '3',
    title: 'Product Designer',
    company: 'CreativeMinds',
    location: 'Remote',
    type: 'Full-time',
    salary: '$90,000 - $120,000',
    description: 'CreativeMinds is looking for a talented Product Designer to join our design team. You will be responsible for creating user-centered designs and contributing to our design system.',
    requirements: [
      'Portfolio demonstrating UI/UX design skills',
      'Proficiency in Figma or similar design tools',
      'Understanding of design systems and component libraries',
      'Experience collaborating with developers'
    ],
    postedAt: '2023-05-02',
    logoUrl: '/placeholder.svg',
    featured: true
  },
  {
    id: '4',
    title: 'DevOps Engineer',
    company: 'CloudScale',
    location: 'Boston, MA (Hybrid)',
    type: 'Full-time',
    salary: '$130,000 - $160,000',
    description: 'CloudScale is seeking a DevOps Engineer to help automate our infrastructure and deployment processes. You will work with containerization, CI/CD pipelines, and cloud services.',
    requirements: [
      'Experience with Docker, Kubernetes, and container orchestration',
      'Knowledge of CI/CD pipelines (GitHub Actions, Jenkins)',
      'Familiarity with cloud platforms (AWS, Azure, GCP)',
      'Understanding of infrastructure as code (Terraform)'
    ],
    postedAt: '2023-04-25',
    logoUrl: '/placeholder.svg',
    featured: false
  },
  {
    id: '5',
    title: 'Data Scientist',
    company: 'Analytix',
    location: 'Remote',
    type: 'Full-time',
    salary: '$110,000 - $140,000',
    description: 'Analytix is looking for a Data Scientist to join our research team. You will analyze complex datasets, build predictive models, and extract actionable insights for our clients.',
    requirements: [
      'Strong background in statistics and machine learning',
      'Experience with Python and data analysis libraries',
      'Knowledge of SQL and data visualization tools',
      'Ability to communicate complex findings to non-technical stakeholders'
    ],
    postedAt: '2023-04-30',
    logoUrl: '/placeholder.svg',
    featured: true
  },
  {
    id: '6',
    title: 'Marketing Specialist',
    company: 'GrowthHackers',
    location: 'Chicago, IL',
    type: 'Full-time',
    salary: '$70,000 - $90,000',
    description: 'Join our marketing team to develop and implement digital marketing strategies. You will manage campaigns, analyze performance metrics, and optimize for growth.',
    requirements: [
      'Experience with digital marketing channels (SEO, SEM, social media)',
      'Knowledge of marketing analytics tools',
      'Understanding of conversion optimization',
      'Excellent communication skills'
    ],
    postedAt: '2023-04-27',
    logoUrl: '/placeholder.svg',
    featured: false
  },
  {
    id: '7',
    title: 'Mobile Developer (iOS)',
    company: 'AppWorks',
    location: 'Austin, TX (Hybrid)',
    type: 'Full-time',
    salary: '$100,000 - $130,000',
    description: 'AppWorks is seeking an iOS Developer to join our mobile team. You will be responsible for developing and maintaining native iOS applications using Swift.',
    requirements: [
      '3+ years of experience with iOS development using Swift',
      'Understanding of iOS design patterns and best practices',
      'Experience with RESTful APIs and data persistence',
      'Knowledge of the App Store submission process'
    ],
    postedAt: '2023-05-03',
    logoUrl: '/placeholder.svg',
    featured: true
  },
  {
    id: '8',
    title: 'Customer Success Manager',
    company: 'ServiceFirst',
    location: 'Remote',
    type: 'Full-time',
    salary: '$75,000 - $95,000',
    description: 'ServiceFirst is looking for a Customer Success Manager to ensure client satisfaction and retention. You will be the main point of contact for key accounts.',
    requirements: [
      'Experience in customer success or account management',
      'Strong communication and relationship-building skills',
      'Ability to understand and articulate technical concepts',
      'Problem-solving mindset'
    ],
    postedAt: '2023-04-29',
    logoUrl: '/placeholder.svg',
    featured: false
  },
  {
    id: '9',
    title: 'QA Engineer',
    company: 'QualityTech',
    location: 'Seattle, WA',
    type: 'Full-time',
    salary: '$90,000 - $110,000',
    description: 'Join our QA team to ensure the quality of our software products. You will design and implement test plans, automate testing processes, and report issues.',
    requirements: [
      'Experience with manual and automated testing',
      'Knowledge of testing frameworks and tools',
      'Understanding of software development lifecycle',
      'Attention to detail and analytical thinking'
    ],
    postedAt: '2023-05-04',
    logoUrl: '/placeholder.svg',
    featured: false
  },
  {
    id: '10',
    title: 'Technical Project Manager',
    company: 'ProjectPro',
    location: 'Denver, CO (Hybrid)',
    type: 'Full-time',
    salary: '$100,000 - $130,000',
    description: 'ProjectPro is seeking a Technical Project Manager to oversee software development projects. You will coordinate cross-functional teams and ensure timely delivery.',
    requirements: [
      'Experience managing software development projects',
      'Knowledge of Agile methodologies',
      'Strong communication and leadership skills',
      'Technical background or understanding of software development'
    ],
    postedAt: '2023-05-05',
    logoUrl: '/placeholder.svg',
    featured: true
  },
];

export const featuredJobs = jobs.filter(job => job.featured);
export const recentJobs = [...jobs].sort((a, b) => 
  new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime()
);
