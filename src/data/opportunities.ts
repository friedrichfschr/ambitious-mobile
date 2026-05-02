export type Opportunity = {
  id: string;
  title: string;
  category: 'Scholarships' | 'Fellowships' | 'Exchange' | 'Internships';
  region: string;
  level: string;
  deadline: string;
  summary: string;
  url: string;
};

export const opportunities: Opportunity[] = [
  {
    id: 'daad-rise',
    title: 'DAAD RISE Germany',
    category: 'Internships',
    region: 'Germany',
    level: 'Undergraduate',
    deadline: '15 Dec',
    summary: 'Research internships in German labs for students in science and engineering with a clear application process and strong discovery value.',
    url: 'https://www.daad.de/rise/en/',
  },
  {
    id: 'erasmus-mundus',
    title: 'Erasmus Mundus Joint Masters',
    category: 'Scholarships',
    region: 'Europe',
    level: 'Graduate',
    deadline: 'varies',
    summary: 'Flagship European scholarship programs with full-degree mobility, strong brand recognition, and broad international targeting.',
    url: 'https://www.eacea.ec.europa.eu/scholarships/erasmus-mundus-catalogue_en',
  },
  {
    id: 'cbyx',
    title: 'CBYX / PPP Exchange Year',
    category: 'Exchange',
    region: 'Germany ↔ USA',
    level: 'Secondary / Gap Year',
    deadline: 'Autumn',
    summary: 'A highly visible bilateral exchange opportunity that fits the broader ambition of a curated global opportunity platform.',
    url: 'https://www.bundestag.de/ppp',
  },
  {
    id: 'schwarzman',
    title: 'Schwarzman Scholars',
    category: 'Fellowships',
    region: 'China',
    level: 'Graduate',
    deadline: 'Sep',
    summary: 'Leadership-focused, globally known fellowship with a strong brand and very clear content structure for discovery and detail pages.',
    url: 'https://www.schwarzmanscholars.org/',
  },
];

export const feedPreviewPosts = [
  {
    id: 'post-1',
    community: 'Scholarship Essays',
    title: 'How are you structuring your “why this program” answer?',
    preview: 'I am testing a short hook → specific mission fit → concrete future impact structure. Curious what is actually working for others.',
    timestamp: '12m ago',
    tags: ['Essays', 'Advice', 'Applications'],
  },
  {
    id: 'post-2',
    community: 'Germany',
    title: 'DAAD timeline spreadsheet template',
    preview: 'I turned the DAAD deadlines, documents, and recommendation asks into a checklist. Happy to share the format if it helps.',
    timestamp: '1h ago',
    tags: ['DAAD', 'Templates', 'Planning'],
  },
];

export const messagePreviewThreads = [
  {
    id: 'thread-1',
    name: 'Lina M.',
    preview: 'I found two STEM scholarship databases that might fit your shortlist.',
    time: '09:12',
  },
  {
    id: 'thread-2',
    name: 'Mentor Group',
    preview: 'Let’s compare application timelines before the weekend.',
    time: 'Yesterday',
  },
  {
    id: 'thread-3',
    name: 'Alex R.',
    preview: 'Your draft opening paragraph is already much stronger.',
    time: 'Thu',
  },
];
