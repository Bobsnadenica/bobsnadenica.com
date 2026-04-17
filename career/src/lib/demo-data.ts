import type { ConsultantProfile, UserProfile } from "./types";

function createIsoSlot(daysFromNow: number, hours: number, minutes = 0) {
  const value = new Date();
  value.setSeconds(0, 0);
  value.setDate(value.getDate() + daysFromNow);
  value.setHours(hours, minutes, 0, 0);
  return value.toISOString();
}

function sortConsultants(items: ConsultantProfile[]) {
  return [...items].sort((left, right) => {
    if (left.featured !== right.featured) {
      return left.featured ? -1 : 1;
    }

    if ((right.reviewCount || 0) !== (left.reviewCount || 0)) {
      return (right.reviewCount || 0) - (left.reviewCount || 0);
    }

    if ((right.rating || 0) !== (left.rating || 0)) {
      return (right.rating || 0) - (left.rating || 0);
    }

    return String(left.name || "").localeCompare(String(right.name || ""), "bg");
  });
}

const consultantAvailability = {
  ana: [createIsoSlot(1, 10, 0), createIsoSlot(2, 14, 30), createIsoSlot(4, 11, 0)],
  boris: [createIsoSlot(1, 16, 0), createIsoSlot(3, 18, 30), createIsoSlot(5, 12, 0)],
  elitsa: [createIsoSlot(2, 9, 30), createIsoSlot(4, 15, 0), createIsoSlot(6, 13, 30)],
  nikolay: [createIsoSlot(1, 8, 30), createIsoSlot(3, 10, 30), createIsoSlot(7, 17, 0)]
} as const;

const demoImages = {
  ana: {
    avatar: "https://i.pravatar.cc/640?img=32",
    hero: "https://picsum.photos/id/1011/1600/1000",
    map: "https://picsum.photos/id/1040/1400/900"
  },
  boris: {
    avatar: "https://i.pravatar.cc/640?img=12",
    hero: "https://picsum.photos/id/1005/1600/1000",
    map: "https://picsum.photos/id/1037/1400/900"
  },
  elitsa: {
    avatar: "https://i.pravatar.cc/640?img=47",
    hero: "https://picsum.photos/id/1025/1600/1000",
    map: "https://picsum.photos/id/1060/1400/900"
  },
  nikolay: {
    avatar: "https://i.pravatar.cc/640?img=14",
    hero: "https://picsum.photos/id/1043/1600/1000",
    map: "https://picsum.photos/id/1059/1400/900"
  }
} as const;

export const demoConsultants: ConsultantProfile[] = sortConsultants([
  {
    consultantId: "demo-consultant-ana",
    ownerUserId: "demo-owner-ana",
    profileType: "consultant",
    slug: "ana-petrova",
    name: "Ана Петрова",
    headline: "Leadership, executive CV и кариерно позициониране за mid-to-senior роли",
    bio: "Ана работи с хора, които влизат в management и leadership роли и искат по-силно позициониране, по-ясно послание и увереност в следващата си кандидатура.",
    experienceSummary: "12+ години в talent и leadership advisory с фокус върху позициониране за мениджърски и директорски роли.",
    experienceHighlights: [
      "Подготовка за интервюта и case-и за management позиции",
      "Пренаписване на executive CV и LinkedIn профили",
      "Позициониране при международни кандидатури"
    ],
    educationHighlights: ["ICF coaching training", "HR Business Partner track"],
    city: "София",
    languages: ["Български", "English"],
    specializations: ["Leadership", "Executive CV", "Interview Prep"],
    experienceYears: 12,
    priceBgn: 160,
    sessionModes: ["Онлайн", "На живо"],
    featured: true,
    rating: 4.9,
    reviewCount: 18,
    nextAvailable: consultantAvailability.ana[0],
    avatarUrl: demoImages.ana.avatar,
    heroUrl: demoImages.ana.hero,
    mapImageUrl: demoImages.ana.map,
    tags: ["Мениджърски роли", "Кариерна стратегия", "LinkedIn"],
    availability: [...consultantAvailability.ana],
    idealFor: ["Мениджъри", "Head of / Director роли", "Кариерна промяна на senior ниво"],
    consultationTopics: ["CV и LinkedIn", "Интервю стратегия", "Кариерно позициониране"],
    workApproach: "Работата минава през бърз профилен одит, приоритизиране на посланието и конкретни следващи стъпки за кандидатстване.",
    sessionLengthMinutes: 60,
    isDemo: true
  },
  {
    consultantId: "demo-consultant-boris",
    ownerUserId: "demo-owner-boris",
    profileType: "mentor",
    slug: "boris-ivanov",
    name: "Борис Иванов",
    headline: "Продуктов ментор за startup екипи, PM роли и преход от execution към ownership",
    bio: "Борис работи практично и директно с PM-и, founders и хора в преход към product роли, когато им трябва по-ясна стратегия, ownership и уверен разказ за стойността им.",
    experienceSummary: "Бивш Head of Product с опит в SaaS и B2B продукти, работил с PM-и, founders и early-stage екипи.",
    experienceHighlights: [
      "Product sense и prioritization coaching",
      "Подготовка за PM интервюта и hiring loops",
      "Развитие от IC към people/strategy ownership"
    ],
    educationHighlights: ["Product Leadership cohort", "Lean experimentation program"],
    city: "Онлайн",
    languages: ["Български", "English"],
    specializations: ["Product Management", "Startup Growth", "Mentorship"],
    experienceYears: 10,
    priceBgn: 140,
    sessionModes: ["Онлайн"],
    featured: true,
    rating: 4.8,
    reviewCount: 11,
    nextAvailable: consultantAvailability.boris[0],
    avatarUrl: demoImages.boris.avatar,
    heroUrl: demoImages.boris.hero,
    mapImageUrl: demoImages.boris.map,
    tags: ["PM", "Startup", "Ownership"],
    availability: [...consultantAvailability.boris],
    idealFor: ["Product Managers", "Startup founders", "Senior IC преход"],
    consultationTopics: ["PM интервюта", "Career growth", "Product strategy"],
    workApproach: "Започва се от реален контекст, текущ екип и цел за следващите 90 дни, след което се оформя практичен план за развитие.",
    sessionLengthMinutes: 50,
    isDemo: true
  },
  {
    consultantId: "demo-consultant-elitsa",
    ownerUserId: "demo-owner-elitsa",
    profileType: "consultant",
    slug: "elitsa-stoyanova",
    name: "Елица Стоянова",
    headline: "CV, LinkedIn и първи международни кандидатури за early-to-mid professionals",
    bio: "Елица помага на early-to-mid professionals да подредят по-добре CV-то си, да изградят ясен LinkedIn профил и да влязат по-уверено в международни процеси.",
    experienceSummary: "Кариеран консултант с фокус върху junior и mid-level кандидати, които правят следваща стъпка към по-силен профилен прочит.",
    experienceHighlights: [
      "CV редизайн за международни кандидатури",
      "LinkedIn профили с по-силен headline и summary",
      "Mock interview за стандартни HR и hiring manager разговори"
    ],
    educationHighlights: ["Career coaching certificate"],
    city: "Варна",
    languages: ["Български", "English", "Deutsch"],
    specializations: ["CV Writing", "LinkedIn", "International Applications"],
    experienceYears: 7,
    priceBgn: 95,
    sessionModes: ["Онлайн"],
    featured: false,
    rating: 4.7,
    reviewCount: 9,
    nextAvailable: consultantAvailability.elitsa[0],
    avatarUrl: demoImages.elitsa.avatar,
    heroUrl: demoImages.elitsa.hero,
    mapImageUrl: demoImages.elitsa.map,
    tags: ["Junior to Mid", "CV", "Remote roles"],
    availability: [...consultantAvailability.elitsa],
    idealFor: ["Junior и mid-level кандидати", "Първа международна кандидатура"],
    consultationTopics: ["CV review", "LinkedIn", "Interview basics"],
    workApproach: "Сесиите са подредени около документи, конкретна обява и кратък списък с най-важните корекции за следващото кандидатстване.",
    sessionLengthMinutes: 45,
    isDemo: true
  },
  {
    consultantId: "demo-consultant-nikolay",
    ownerUserId: "demo-owner-nikolay",
    profileType: "mentor",
    slug: "nikolay-georgiev",
    name: "Николай Георгиев",
    headline: "Data и analytics ментор за преход към BI, analytics engineering и stakeholder communication",
    bio: "Николай работи с data и analytics специалисти, които искат по-силен професионален разказ, по-добра stakeholder комуникация и по-ясна следваща стъпка в кариерата си.",
    experienceSummary: "Работи с хора, които минават от reporting към по-стратегически data роли и искат по-ясен narrative за стойността си.",
    experienceHighlights: [
      "Storytelling с данни и stakeholder alignment",
      "Подготовка за BI / analytics интервюта",
      "Изграждане на профил за analytics engineering преход"
    ],
    educationHighlights: ["Modern Data Stack bootcamp"],
    city: "Пловдив",
    languages: ["Български", "English"],
    specializations: ["Data Analytics", "BI", "Career Growth"],
    experienceYears: 8,
    priceBgn: 120,
    sessionModes: ["Онлайн", "На живо"],
    featured: false,
    rating: 4.6,
    reviewCount: 6,
    nextAvailable: consultantAvailability.nikolay[0],
    avatarUrl: demoImages.nikolay.avatar,
    heroUrl: demoImages.nikolay.hero,
    mapImageUrl: demoImages.nikolay.map,
    tags: ["Analytics", "BI", "Stakeholders"],
    availability: [...consultantAvailability.nikolay],
    idealFor: ["Data analysts", "BI specialists", "Career switch to data"],
    consultationTopics: ["Analytics CV", "Interview prep", "Career narrative"],
    workApproach: "Фокусът е върху конкретни проекти, измерим принос и превръщането му в ясен профилен разказ за следваща роля.",
    sessionLengthMinutes: 50,
    isDemo: true
  }
]);

export const demoUsers: UserProfile[] = [
  {
    userId: "demo-user-maria",
    email: "maria.nikolova@example.com",
    name: "Мария Николова",
    role: "client",
    plan: "free",
    city: "София",
    occupation: "Marketing Lead",
    age: 32,
    headline: "Търси leadership позициониране и по-силно присъствие за management роли",
    bio: "Фокусирана е върху leadership позициониране, интервю подготовка и по-силно присъствие за management роли.",
    experienceSummary: "7 години опит в маркетинг и people coordination, подготвя се за преход към по-старша роля.",
    experienceHighlights: ["Управление на кампании", "People coordination", "Cross-functional leadership"],
    educationHighlights: ["BA Marketing"],
    skills: ["Brand strategy", "Team management", "Hiring"],
    interests: ["Leadership", "Interview Prep", "Executive CV"],
    keywords: ["management", "позициониране", "LinkedIn"],
    goals: "Иска по-силен leadership narrative и подготовка за интервюта за head/lead роли.",
    preferredSessionModes: ["Онлайн"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isDemo: true
  },
  {
    userId: "demo-user-georgi",
    email: "georgi.petrov@example.com",
    name: "Георги Петров",
    role: "client",
    plan: "free",
    city: "Пловдив",
    occupation: "Senior Software Engineer",
    age: 29,
    headline: "Иска преход към Product Management и по-добър career story",
    bio: "Планира преход към Product Management и търси по-ясен career story за PM интервюта и следваща продуктова роля.",
    experienceSummary: "8 години в инженерни екипи, вече води discovery и иска да мине към по-product-oriented роля.",
    experienceHighlights: ["API platform work", "Cross-team projects", "Customer-facing discovery"],
    educationHighlights: ["Computer Science"],
    skills: ["Product sense", "Technical strategy", "Stakeholder work"],
    interests: ["Product Management", "Startup Growth", "Mentorship"],
    keywords: ["pm", "ownership", "career switch"],
    goals: "Иска да се позиционира за PM интервюта и да подреди аргументите си за прехода.",
    preferredSessionModes: ["Онлайн"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isDemo: true
  },
  {
    userId: "demo-user-ivana",
    email: "ivana.dimitrova@example.com",
    name: "Ивана Димитрова",
    role: "client",
    plan: "free",
    city: "Варна",
    occupation: "Junior Business Analyst",
    age: 24,
    headline: "Търси по-силно CV и увереност за първи международни кандидатури",
    bio: "Подготвя първи международни кандидатури и иска по-силно CV, LinkedIn и повече увереност за интервюта на английски.",
    experienceSummary: "2 години опит и няколко реални проекта, но има нужда от по-добър профилен прочит и интервю подготовка.",
    experienceHighlights: ["Reporting", "Client support", "Excel and BI basics"],
    educationHighlights: ["Business Administration"],
    skills: ["Research", "Presentation", "Analysis"],
    interests: ["CV Writing", "LinkedIn", "Interview basics"],
    keywords: ["junior", "cv", "international"],
    goals: "Иска подредено CV, по-добър LinkedIn и помощ за първите интервюта на английски.",
    preferredSessionModes: ["Онлайн"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isDemo: true
  }
];

export function getDemoConsultantBySlug(slug: string) {
  return demoConsultants.find((consultant) => consultant.slug === slug) || null;
}

export function getFilteredDemoConsultants(filters: { query?: string; city?: string } = {}) {
  const query = String(filters.query || "").trim().toLowerCase();
  const city = String(filters.city || "").trim().toLowerCase();

  return demoConsultants.filter((consultant) => {
    const haystack = [
      consultant.name,
      consultant.headline,
      consultant.bio,
      consultant.experienceSummary,
      ...(consultant.specializations || []),
      ...(consultant.tags || []),
      ...(consultant.consultationTopics || []),
      ...(consultant.idealFor || [])
    ]
      .join(" ")
      .toLowerCase();

    const matchesQuery = !query || haystack.includes(query);
    const matchesCity = !city || consultant.city.toLowerCase().includes(city);
    return matchesQuery && matchesCity;
  });
}

export function mergeConsultantLists(
  primary: ConsultantProfile[],
  secondary: ConsultantProfile[]
) {
  const merged = new Map<string, ConsultantProfile>();

  primary.forEach((consultant) => {
    merged.set(consultant.slug, consultant);
  });

  secondary.forEach((consultant) => {
    if (!merged.has(consultant.slug)) {
      merged.set(consultant.slug, consultant);
    }
  });

  return sortConsultants(Array.from(merged.values()));
}
