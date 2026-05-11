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
  nikolay: [createIsoSlot(1, 8, 30), createIsoSlot(3, 10, 30), createIsoSlot(7, 17, 0)],
  twilight: [createIsoSlot(1, 11, 30), createIsoSlot(3, 15, 30), createIsoSlot(6, 10, 0)],
  rainbow: [createIsoSlot(2, 12, 0), createIsoSlot(4, 16, 30), createIsoSlot(6, 18, 0)],
  rarity: [createIsoSlot(1, 13, 0), createIsoSlot(3, 9, 0), createIsoSlot(5, 14, 0)],
  pinkie: [createIsoSlot(2, 10, 30), createIsoSlot(4, 12, 30), createIsoSlot(7, 15, 0)],
  fluttershy: [createIsoSlot(1, 9, 0), createIsoSlot(5, 11, 30), createIsoSlot(7, 16, 0)],
  applejack: [createIsoSlot(3, 8, 30), createIsoSlot(5, 13, 30), createIsoSlot(8, 10, 0)],
  blossom: [createIsoSlot(1, 15, 0), createIsoSlot(2, 17, 0), createIsoSlot(5, 9, 30)],
  bubbles: [createIsoSlot(2, 11, 0), createIsoSlot(4, 14, 0), createIsoSlot(6, 9, 30)],
  buttercup: [createIsoSlot(1, 18, 0), createIsoSlot(3, 12, 0), createIsoSlot(6, 16, 30)],
  professor: [createIsoSlot(2, 8, 0), createIsoSlot(4, 10, 0), createIsoSlot(7, 13, 0)]
} as const;

const demoImages = {
  ana: {
    avatar: "https://i.pravatar.cc/640?img=32",
    hero: "https://picsum.photos/id/1011/1600/1000"
  },
  boris: {
    avatar: "https://i.pravatar.cc/640?img=12",
    hero: "https://picsum.photos/id/1005/1600/1000"
  },
  elitsa: {
    avatar: "https://i.pravatar.cc/640?img=47",
    hero: "https://picsum.photos/id/1025/1600/1000"
  },
  nikolay: {
    avatar: "https://i.pravatar.cc/640?img=14",
    hero: "https://picsum.photos/id/1043/1600/1000"
  },
  twilight: {
    avatar: "https://api.dicebear.com/9.x/adventurer/svg?seed=Twilight%20Demo",
    hero: "https://picsum.photos/id/1060/1600/1000"
  },
  rainbow: {
    avatar: "https://api.dicebear.com/9.x/adventurer/svg?seed=Rainbow%20Demo",
    hero: "https://picsum.photos/id/1056/1600/1000"
  },
  rarity: {
    avatar: "https://api.dicebear.com/9.x/adventurer/svg?seed=Rarity%20Demo",
    hero: "https://picsum.photos/id/1062/1600/1000"
  },
  pinkie: {
    avatar: "https://api.dicebear.com/9.x/adventurer/svg?seed=Pinkie%20Demo",
    hero: ""
  },
  fluttershy: {
    avatar: "https://api.dicebear.com/9.x/adventurer/svg?seed=Fluttershy%20Demo",
    hero: "https://picsum.photos/id/1074/1600/1000"
  },
  applejack: {
    avatar: "https://api.dicebear.com/9.x/adventurer/svg?seed=Applejack%20Demo",
    hero: ""
  },
  blossom: {
    avatar: "https://api.dicebear.com/9.x/adventurer/svg?seed=Blossom%20Demo",
    hero: "https://picsum.photos/id/1067/1600/1000"
  },
  bubbles: {
    avatar: "https://api.dicebear.com/9.x/adventurer/svg?seed=Bubbles%20Demo",
    hero: ""
  },
  buttercup: {
    avatar: "https://api.dicebear.com/9.x/adventurer/svg?seed=Buttercup%20Demo",
    hero: "https://picsum.photos/id/1071/1600/1000"
  },
  professor: {
    avatar: "https://api.dicebear.com/9.x/adventurer/svg?seed=Professor%20Demo",
    hero: "https://picsum.photos/id/1048/1600/1000"
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
    tags: ["Analytics", "BI", "Stakeholders"],
    availability: [...consultantAvailability.nikolay],
    idealFor: ["Data analysts", "BI specialists", "Career switch to data"],
    consultationTopics: ["Analytics CV", "Interview prep", "Career narrative"],
    workApproach: "Фокусът е върху конкретни проекти, измерим принос и превръщането му в ясен профилен разказ за следваща роля.",
    sessionLengthMinutes: 50,
    isDemo: true
  },
  {
    consultantId: "demo-consultant-twilight",
    ownerUserId: "demo-owner-twilight",
    profileType: "mentor",
    theme: "violet",
    slug: "twilight-sparkle-demo",
    name: "Туайлайт Спаркъл (демо)",
    headline: "Структуриран ментор за learning plans, интервю подготовка и ясна кариерна стратегия",
    bio: "Очевидно фалшив профил, вдъхновен от магичен учебен лидер. Помага да видим как изглежда каталогът с повече съдържание, теми и различни специализации.",
    experienceSummary: "10+ години демо опит в подреждане на сложни цели, учебни системи и превръщане на хаоса в изпълним план.",
    experienceHighlights: [
      "90-дневни learning plans за career switch",
      "Подготовка за поведенчески интервюта",
      "Систематизиране на портфолио и доказателства"
    ],
    educationHighlights: ["Demo School of Friendship", "Structured Mentorship track"],
    city: "Онлайн",
    languages: ["Български", "English"],
    specializations: ["Career Planning", "Learning Strategy", "Interview Prep"],
    experienceYears: 10,
    priceBgn: 130,
    sessionModes: ["Онлайн"],
    featured: true,
    rating: 5,
    reviewCount: 22,
    nextAvailable: consultantAvailability.twilight[0],
    avatarUrl: demoImages.twilight.avatar,
    heroUrl: demoImages.twilight.hero,
    tags: ["MLP demo", "Learning plan", "Interview structure"],
    availability: [...consultantAvailability.twilight],
    idealFor: ["Career switch", "Junior-to-mid growth", "Хора с много идеи"],
    consultationTopics: ["Learning plan", "Mock interview", "Career roadmap"],
    workApproach: "Сесията започва с инвентаризация на целите, след което ги превръща в седмичен план с конкретни критерии за напредък.",
    sessionLengthMinutes: 60,
    isDemo: true
  },
  {
    consultantId: "demo-consultant-rainbow",
    ownerUserId: "demo-owner-rainbow",
    profileType: "mentor",
    theme: "sky",
    slug: "rainbow-dash-demo",
    name: "Рейнбоу Даш (демо)",
    headline: "Ментор за увереност, бърза подготовка и high-energy интервю присъствие",
    bio: "Фалшив демо профил за тестване на по-динамични менторски карти. Работи добре за кандидати, които имат нужда от темпо, смелост и ясна практика преди интервю.",
    experienceSummary: "8 години демо опит в performance coaching, презентационно присъствие и подготовка за разговори под напрежение.",
    experienceHighlights: [
      "Mock interview с бърз feedback",
      "Confidence drills за трудни въпроси",
      "Pitch за 60 секунди"
    ],
    educationHighlights: ["Demo Performance Academy"],
    city: "Онлайн",
    languages: ["Български", "English"],
    specializations: ["Interview Confidence", "Pitching", "Presentation"],
    experienceYears: 8,
    priceBgn: 110,
    sessionModes: ["Онлайн"],
    featured: false,
    rating: 4.8,
    reviewCount: 14,
    nextAvailable: consultantAvailability.rainbow[0],
    avatarUrl: demoImages.rainbow.avatar,
    heroUrl: demoImages.rainbow.hero,
    tags: ["MLP demo", "Confidence", "Fast prep"],
    availability: [...consultantAvailability.rainbow],
    idealFor: ["Интервю до 7 дни", "Презентационни роли", "Хора с нужда от увереност"],
    consultationTopics: ["Mock interview", "Elevator pitch", "Confidence prep"],
    workApproach: "Работи се през кратки повторения, конкретен feedback и финален сценарий за интервюто.",
    sessionLengthMinutes: 45,
    isDemo: true
  },
  {
    consultantId: "demo-consultant-rarity",
    ownerUserId: "demo-owner-rarity",
    profileType: "consultant",
    theme: "rose",
    slug: "rarity-belle-demo",
    name: "Рарити Бел (демо)",
    headline: "Консултант за personal brand, CV polish и визуално подреден LinkedIn профил",
    bio: "Фалшив демо профил за по-стилно кариерно позициониране. Подходящ е за тестване на профили с по-силен визуален и комуникационен фокус.",
    experienceSummary: "9 години демо опит в personal branding, профилна редакция и представяне на креативни роли.",
    experienceHighlights: [
      "LinkedIn headline и About секция",
      "Portfolio narrative за creative и marketing роли",
      "CV polish без претоварване"
    ],
    educationHighlights: ["Demo Brand Studio"],
    city: "Варна",
    languages: ["Български", "English", "Français"],
    specializations: ["Personal Brand", "LinkedIn", "Portfolio"],
    experienceYears: 9,
    priceBgn: 125,
    sessionModes: ["Онлайн", "На живо"],
    featured: false,
    rating: 4.9,
    reviewCount: 17,
    nextAvailable: consultantAvailability.rarity[0],
    avatarUrl: demoImages.rarity.avatar,
    heroUrl: demoImages.rarity.hero,
    tags: ["MLP demo", "Brand", "Portfolio"],
    availability: [...consultantAvailability.rarity],
    idealFor: ["Marketing", "Creative roles", "LinkedIn refresh"],
    consultationTopics: ["Personal brand", "CV polish", "Portfolio story"],
    workApproach: "Започва с профилен audit, после се изчистват послание, визуален ред и най-силните доказателства.",
    sessionLengthMinutes: 50,
    isDemo: true
  },
  {
    consultantId: "demo-consultant-pinkie",
    ownerUserId: "demo-owner-pinkie",
    profileType: "mentor",
    slug: "pinkie-pie-demo",
    name: "Пинки Пай (демо)",
    headline: "Ментор за networking, community jobs и по-естествено професионално общуване",
    bio: "Фалшив демо профил без топ банер, за да проверим как изглеждат публичните профили само с основна профилна снимка.",
    experienceSummary: "7 години демо опит в community building, networking и подготовка за разговори с нови екипи.",
    experienceHighlights: [
      "Networking plan без awkward усещане",
      "Съобщения за reach-out и follow-up",
      "Подготовка за informal interviews"
    ],
    educationHighlights: ["Demo Community Lab"],
    city: "Онлайн",
    languages: ["Български", "English"],
    specializations: ["Networking", "Community", "Communication"],
    experienceYears: 7,
    priceBgn: 90,
    sessionModes: ["Онлайн"],
    featured: false,
    rating: 4.7,
    reviewCount: 8,
    nextAvailable: consultantAvailability.pinkie[0],
    avatarUrl: demoImages.pinkie.avatar,
    heroUrl: demoImages.pinkie.hero,
    tags: ["MLP demo", "Networking", "Community"],
    availability: [...consultantAvailability.pinkie],
    idealFor: ["First job seekers", "Community roles", "Intro calls"],
    consultationTopics: ["Networking scripts", "Follow-up", "Community applications"],
    workApproach: "Създава се лек, човешки план за контакти, съобщения и последващи действия след разговори.",
    sessionLengthMinutes: 45,
    isDemo: true
  },
  {
    consultantId: "demo-consultant-fluttershy",
    ownerUserId: "demo-owner-fluttershy",
    profileType: "mentor",
    theme: "mint",
    slug: "fluttershy-demo",
    name: "Флътършай (демо)",
    headline: "Спокоен ментор за интервю тревожност, soft skills и уверено кандидатстване",
    bio: "Фалшив демо профил за кандидати, които искат по-спокойна подготовка, по-малко напрежение и по-мек стил на работа.",
    experienceSummary: "6 години демо опит в soft-skill coaching, подготовка за първи интервюта и confidence work.",
    experienceHighlights: [
      "Подготовка за тревожни кандидати",
      "Soft skills примери за STAR отговори",
      "Плавно изграждане на увереност"
    ],
    educationHighlights: ["Demo Empathy Coaching"],
    city: "Онлайн",
    languages: ["Български", "English"],
    specializations: ["Soft Skills", "Interview Anxiety", "Career Confidence"],
    experienceYears: 6,
    priceBgn: 85,
    sessionModes: ["Онлайн"],
    featured: false,
    rating: 4.8,
    reviewCount: 12,
    nextAvailable: consultantAvailability.fluttershy[0],
    avatarUrl: demoImages.fluttershy.avatar,
    heroUrl: demoImages.fluttershy.hero,
    tags: ["MLP demo", "Soft skills", "Confidence"],
    availability: [...consultantAvailability.fluttershy],
    idealFor: ["Първи интервюта", "Интроверти", "Кандидати с тревожност"],
    consultationTopics: ["STAR answers", "Confidence", "Interview anxiety"],
    workApproach: "Работи се спокойно и постепенно: първо се намалява напрежението, после се упражняват конкретни отговори.",
    sessionLengthMinutes: 50,
    isDemo: true
  },
  {
    consultantId: "demo-consultant-applejack",
    ownerUserId: "demo-owner-applejack",
    profileType: "consultant",
    slug: "applejack-demo",
    name: "Епълджак (демо)",
    headline: "Практичен консултант за реалистичен job search, приоритети и следващи действия",
    bio: "Фалшив демо профил без платена цветна тема. Подходящ е за проверка на стандартните карти до по-цветните paid-theme профили.",
    experienceSummary: "11 години демо опит в hands-on career planning, job search routines и прагматично вземане на решения.",
    experienceHighlights: [
      "Седмична система за кандидатстване",
      "Приоритизация на обяви",
      "Реалистична оценка на профила"
    ],
    educationHighlights: ["Demo Practical Careers"],
    city: "Пловдив",
    languages: ["Български", "English"],
    specializations: ["Job Search", "Career Strategy", "Accountability"],
    experienceYears: 11,
    priceBgn: 115,
    sessionModes: ["Онлайн", "На живо"],
    featured: false,
    rating: 4.6,
    reviewCount: 10,
    nextAvailable: consultantAvailability.applejack[0],
    avatarUrl: demoImages.applejack.avatar,
    heroUrl: demoImages.applejack.hero,
    tags: ["MLP demo", "Job search", "Accountability"],
    availability: [...consultantAvailability.applejack],
    idealFor: ["Активно кандидатстване", "Career reset", "Практични планове"],
    consultationTopics: ["Job search plan", "Prioritization", "Weekly accountability"],
    workApproach: "Сесията завършва с кратък списък от действия за седмицата и критерии кога да се промени стратегията.",
    sessionLengthMinutes: 50,
    isDemo: true
  },
  {
    consultantId: "demo-consultant-blossom",
    ownerUserId: "demo-owner-blossom",
    profileType: "consultant",
    theme: "rose",
    slug: "blossom-utonium-demo",
    name: "Блосъм Утониум (демо)",
    headline: "Стратегически консултант за structured interviews, leadership signals и ясна подготовка",
    bio: "Фалшив Powerpuff демо профил, който показва как изглеждат подбрани профили с paid цветна тема и по-силен leadership фокус.",
    experienceSummary: "12 години демо опит в structured hiring, leadership interview prep и decision-making frameworks.",
    experienceHighlights: [
      "Leadership examples за senior interviews",
      "Structured mock interview",
      "Decision framework за следваща роля"
    ],
    educationHighlights: ["Demo Townsville Leadership Lab"],
    city: "София",
    languages: ["Български", "English"],
    specializations: ["Leadership", "Structured Interview", "Career Strategy"],
    experienceYears: 12,
    priceBgn: 150,
    sessionModes: ["Онлайн", "На живо"],
    featured: true,
    rating: 5,
    reviewCount: 24,
    nextAvailable: consultantAvailability.blossom[0],
    avatarUrl: demoImages.blossom.avatar,
    heroUrl: demoImages.blossom.hero,
    tags: ["Powerpuff demo", "Leadership", "Structured prep"],
    availability: [...consultantAvailability.blossom],
    idealFor: ["Senior candidates", "Team leads", "Structured interviews"],
    consultationTopics: ["Leadership signals", "Mock interview", "Decision framework"],
    workApproach: "Първо се избира целевата роля, после се изграждат доказателства и отговори около най-важните hiring signals.",
    sessionLengthMinutes: 60,
    isDemo: true
  },
  {
    consultantId: "demo-consultant-bubbles",
    ownerUserId: "demo-owner-bubbles",
    profileType: "mentor",
    slug: "bubbles-utonium-demo",
    name: "Бъбълс Утониум (демо)",
    headline: "Ментор за creative portfolios, junior confidence и първи роли в креативни екипи",
    bio: "Фалшив Powerpuff демо профил без топ банер, за да се вижда как optional banner поведението остава чисто в различни карти.",
    experienceSummary: "5 години демо опит в portfolio reviews, junior profile building и подготовка за първи creative interviews.",
    experienceHighlights: [
      "Портфолио разказ за junior кандидати",
      "Преглед на case studies",
      "Подготовка за culture-fit разговори"
    ],
    educationHighlights: ["Demo Creative Starter Program"],
    city: "Онлайн",
    languages: ["Български", "English"],
    specializations: ["Portfolio", "Junior Roles", "Creative Careers"],
    experienceYears: 5,
    priceBgn: 75,
    sessionModes: ["Онлайн"],
    featured: false,
    rating: 4.7,
    reviewCount: 7,
    nextAvailable: consultantAvailability.bubbles[0],
    avatarUrl: demoImages.bubbles.avatar,
    heroUrl: demoImages.bubbles.hero,
    tags: ["Powerpuff demo", "Portfolio", "Junior"],
    availability: [...consultantAvailability.bubbles],
    idealFor: ["Junior designers", "Creative interns", "Portfolio refresh"],
    consultationTopics: ["Portfolio review", "Case study story", "First job prep"],
    workApproach: "Работи се през реални портфолио елементи и кратки подобрения, които правят разказа по-ясен.",
    sessionLengthMinutes: 45,
    isDemo: true
  },
  {
    consultantId: "demo-consultant-buttercup",
    ownerUserId: "demo-owner-buttercup",
    profileType: "mentor",
    theme: "amber",
    slug: "buttercup-utonium-demo",
    name: "Бътъркъп Утониум (демо)",
    headline: "Директен ментор за salary negotiation, boundaries и по-смело професионално присъствие",
    bio: "Фалшив Powerpuff демо профил с paid цветна тема. Добър е за проверка на по-кратки, силни профили с ясно действие.",
    experienceSummary: "9 години демо опит в negotiation prep, boundaries coaching и подготовка за трудни career conversations.",
    experienceHighlights: [
      "Salary negotiation сценарии",
      "Подготовка за трудни разговори",
      "Ясна позиция при оферти и контраоферти"
    ],
    educationHighlights: ["Demo Negotiation Lab"],
    city: "Онлайн",
    languages: ["Български", "English"],
    specializations: ["Negotiation", "Career Confidence", "Offer Review"],
    experienceYears: 9,
    priceBgn: 135,
    sessionModes: ["Онлайн"],
    featured: false,
    rating: 4.9,
    reviewCount: 15,
    nextAvailable: consultantAvailability.buttercup[0],
    avatarUrl: demoImages.buttercup.avatar,
    heroUrl: demoImages.buttercup.hero,
    tags: ["Powerpuff demo", "Negotiation", "Offer review"],
    availability: [...consultantAvailability.buttercup],
    idealFor: ["Оферти", "Повишение", "Трудни разговори"],
    consultationTopics: ["Salary negotiation", "Offer review", "Boundaries"],
    workApproach: "Сесията симулира реалния разговор, подготвя anchors и изяснява минималните условия преди преговори.",
    sessionLengthMinutes: 50,
    isDemo: true
  },
  {
    consultantId: "demo-consultant-professor",
    ownerUserId: "demo-owner-professor",
    profileType: "consultant",
    theme: "violet",
    slug: "professor-utonium-demo",
    name: "Проф. Утониум (демо)",
    headline: "Технически кариерен консултант за research, engineering и evidence-based career moves",
    bio: "Фалшив Powerpuff демо профил за технически и research-oriented кандидати. Помага да проверим по-дълги заглавия и научно звучащи специализации.",
    experienceSummary: "15 години демо опит в research teams, engineering mentorship и системно изграждане на доказателства за кандидатстване.",
    experienceHighlights: [
      "Technical career narrative",
      "Research portfolio и project evidence",
      "Подготовка за инженерни hiring loops"
    ],
    educationHighlights: ["Demo Science Institute", "Engineering Mentorship Program"],
    city: "Онлайн",
    languages: ["Български", "English"],
    specializations: ["Technical Careers", "Research", "Engineering Mentorship"],
    experienceYears: 15,
    priceBgn: 170,
    sessionModes: ["Онлайн"],
    featured: true,
    rating: 4.8,
    reviewCount: 13,
    nextAvailable: consultantAvailability.professor[0],
    avatarUrl: demoImages.professor.avatar,
    heroUrl: demoImages.professor.hero,
    tags: ["Powerpuff demo", "Engineering", "Research"],
    availability: [...consultantAvailability.professor],
    idealFor: ["Engineers", "Research roles", "Technical leadership"],
    consultationTopics: ["Technical CV", "Project evidence", "Hiring loop prep"],
    workApproach: "Работата е evidence-based: изваждат се проекти, решения, trade-offs и резултати, които подкрепят следващата роля.",
    sessionLengthMinutes: 60,
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
  },
  {
    userId: "demo-user-spike",
    email: "spike.demo@example.com",
    name: "Спайк (демо потребител)",
    role: "client",
    plan: "free",
    avatarUrl: "https://api.dicebear.com/9.x/adventurer/svg?seed=Spike%20User%20Demo",
    city: "Онлайн",
    occupation: "Junior Operations Coordinator",
    age: 23,
    headline: "Търси първа по-силна роля и план за кандидатстване без хаос",
    bio: "Фалшив MLP demo потребител, използван за проверка на персонализираното подреждане.",
    experienceSummary: "1 година координация, support и вътрешна комуникация.",
    experienceHighlights: ["Team support", "Scheduling", "Documentation"],
    educationHighlights: ["Demo Business Program"],
    skills: ["Coordination", "Communication", "Documentation"],
    interests: ["Career Planning", "Job Search", "Mentorship"],
    keywords: ["junior", "план", "организация"],
    goals: "Иска седмична система за кандидатстване и по-ясен професионален разказ.",
    preferredSessionModes: ["Онлайн"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isDemo: true
  },
  {
    userId: "demo-user-scootaloo",
    email: "scootaloo.demo@example.com",
    name: "Скууталу (демо потребител)",
    role: "client",
    plan: "free",
    avatarUrl: "https://api.dicebear.com/9.x/adventurer/svg?seed=Scootaloo%20User%20Demo",
    city: "София",
    occupation: "Junior QA Tester",
    age: 22,
    headline: "Иска увереност за интервюта и по-добър pitch за първа tech роля",
    bio: "Фалшив MLP demo потребител с фокус върху първи tech интервюта.",
    experienceSummary: "Курсове по QA, няколко учебни проекта и силна мотивация за първа роля.",
    experienceHighlights: ["Manual testing", "Bug reports", "Demo projects"],
    educationHighlights: ["QA fundamentals course"],
    skills: ["Testing", "Attention to detail", "Learning"],
    interests: ["Interview Confidence", "Technical Careers", "Junior Roles"],
    keywords: ["qa", "junior", "interview"],
    goals: "Иска да упражни интервю отговори и да подреди проектите си.",
    preferredSessionModes: ["Онлайн"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isDemo: true
  },
  {
    userId: "demo-user-sweetie-belle",
    email: "sweetie.belle.demo@example.com",
    name: "Суийти Бел (демо потребител)",
    role: "client",
    plan: "free",
    avatarUrl: "https://api.dicebear.com/9.x/adventurer/svg?seed=Sweetie%20Belle%20User%20Demo",
    city: "Варна",
    occupation: "Junior Content Creator",
    age: 21,
    headline: "Търси portfolio story и по-професионален LinkedIn за creative роли",
    bio: "Фалшив MLP demo потребител за creative и portfolio сценарии.",
    experienceSummary: "Има учебни кампании, кратки видеа и първи freelance проекти.",
    experienceHighlights: ["Content ideas", "Social campaigns", "Portfolio drafts"],
    educationHighlights: ["Digital media course"],
    skills: ["Writing", "Content", "Storytelling"],
    interests: ["Portfolio", "Personal Brand", "LinkedIn"],
    keywords: ["portfolio", "creative", "brand"],
    goals: "Иска да превърне проектите си в по-ясно портфолио.",
    preferredSessionModes: ["Онлайн"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isDemo: true
  },
  {
    userId: "demo-user-apple-bloom",
    email: "apple.bloom.demo@example.com",
    name: "Епъл Блум (демо потребител)",
    role: "client",
    plan: "free",
    avatarUrl: "https://api.dicebear.com/9.x/adventurer/svg?seed=Apple%20Bloom%20User%20Demo",
    city: "Пловдив",
    occupation: "Retail Team Lead",
    age: 27,
    headline: "Иска преход към office operations и по-добро CV за transferable skills",
    bio: "Фалшив MLP demo потребител за career switch от frontline към офисна роля.",
    experienceSummary: "5 години в retail екипи, обучение на нови хора и оперативна организация.",
    experienceHighlights: ["Team shifts", "Customer support", "Training"],
    educationHighlights: ["Demo Operations Workshop"],
    skills: ["Operations", "People coordination", "Customer care"],
    interests: ["Career Strategy", "CV Writing", "Job Search"],
    keywords: ["career switch", "operations", "transferable skills"],
    goals: "Иска CV, което превежда retail опита към office operations.",
    preferredSessionModes: ["Онлайн", "На живо"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isDemo: true
  },
  {
    userId: "demo-user-maud",
    email: "maud.demo@example.com",
    name: "Мод Пай (демо потребител)",
    role: "client",
    plan: "free",
    avatarUrl: "https://api.dicebear.com/9.x/adventurer/svg?seed=Maud%20User%20Demo",
    city: "Онлайн",
    occupation: "Data Analyst",
    age: 30,
    headline: "Търси по-добър data story и начин да обяснява impact пред stakeholders",
    bio: "Фалшив MLP demo потребител за analytics и stakeholder communication сценарии.",
    experienceSummary: "4 години reporting, dashboards и ad-hoc analysis.",
    experienceHighlights: ["Dashboards", "SQL reports", "Business analysis"],
    educationHighlights: ["Statistics fundamentals"],
    skills: ["SQL", "BI", "Data storytelling"],
    interests: ["Data Analytics", "BI", "Career Growth"],
    keywords: ["analytics", "stakeholders", "impact"],
    goals: "Иска да позиционира analytics работата си като бизнес стойност.",
    preferredSessionModes: ["Онлайн"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isDemo: true
  },
  {
    userId: "demo-user-bliss",
    email: "bliss.demo@example.com",
    name: "Блис (демо потребител)",
    role: "client",
    plan: "free",
    avatarUrl: "https://api.dicebear.com/9.x/adventurer/svg?seed=Bliss%20User%20Demo",
    city: "София",
    occupation: "People Operations Specialist",
    age: 28,
    headline: "Иска leadership сигналите в профила и интервютата да звучат по-зряло",
    bio: "Фалшив Powerpuff demo потребител за HR и people operations профили.",
    experienceSummary: "6 години в HR operations, onboarding и координация с мениджъри.",
    experienceHighlights: ["Onboarding", "People processes", "Internal comms"],
    educationHighlights: ["HR operations certificate"],
    skills: ["People ops", "Process design", "Communication"],
    interests: ["Leadership", "Structured Interview", "Career Strategy"],
    keywords: ["leadership", "people ops", "interview"],
    goals: "Иска да се позиционира за people partner или team lead роли.",
    preferredSessionModes: ["Онлайн"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isDemo: true
  },
  {
    userId: "demo-user-mojo",
    email: "mojo.demo@example.com",
    name: "Моджо Джоджо (демо потребител)",
    role: "client",
    plan: "free",
    avatarUrl: "https://api.dicebear.com/9.x/adventurer/svg?seed=Mojo%20User%20Demo",
    city: "Онлайн",
    occupation: "Founder",
    age: 35,
    headline: "Търси product narrative, founder positioning и по-ясен pitch към екипи",
    bio: "Фалшив Powerpuff demo потребител за founder и product стратегия сценарии.",
    experienceSummary: "Работи по early-stage продукт и иска по-добър разказ за стойността си.",
    experienceHighlights: ["Product experiments", "Pitch decks", "Hiring"],
    educationHighlights: ["Startup program"],
    skills: ["Product strategy", "Pitching", "Experimentation"],
    interests: ["Product Management", "Startup Growth", "Pitching"],
    keywords: ["startup", "founder", "product"],
    goals: "Иска по-ясен founder profile и структура за продуктови разговори.",
    preferredSessionModes: ["Онлайн"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isDemo: true
  },
  {
    userId: "demo-user-ms-keane",
    email: "ms.keane.demo@example.com",
    name: "Мис Кийн (демо потребител)",
    role: "client",
    plan: "free",
    avatarUrl: "https://api.dicebear.com/9.x/adventurer/svg?seed=Ms%20Keane%20User%20Demo",
    city: "Бургас",
    occupation: "Teacher",
    age: 34,
    headline: "Обмисля преход от образование към learning and development роли",
    bio: "Фалшив Powerpuff demo потребител за career switch към L&D.",
    experienceSummary: "10 години преподаване, учебен дизайн и работа с различни групи.",
    experienceHighlights: ["Curriculum design", "Facilitation", "Student mentoring"],
    educationHighlights: ["Pedagogy"],
    skills: ["Learning design", "Facilitation", "Mentoring"],
    interests: ["Learning Strategy", "Career Planning", "LinkedIn"],
    keywords: ["education", "l&d", "career switch"],
    goals: "Иска да преведе преподавателския си опит към corporate L&D профил.",
    preferredSessionModes: ["Онлайн"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isDemo: true
  },
  {
    userId: "demo-user-sara-bellum",
    email: "sara.bellum.demo@example.com",
    name: "Сара Белъм (демо потребител)",
    role: "client",
    plan: "free",
    avatarUrl: "https://api.dicebear.com/9.x/adventurer/svg?seed=Sara%20Bellum%20User%20Demo",
    city: "София",
    occupation: "Executive Assistant",
    age: 31,
    headline: "Иска да премине към operations manager и да покаже стратегически принос",
    bio: "Фалшив Powerpuff demo потребител за executive support към operations преход.",
    experienceSummary: "8 години executive support, организация на процеси и работа с leadership екипи.",
    experienceHighlights: ["Executive support", "Process coordination", "Planning"],
    educationHighlights: ["Business administration"],
    skills: ["Operations", "Stakeholder work", "Planning"],
    interests: ["Leadership", "Executive CV", "Career Strategy"],
    keywords: ["operations", "executive", "leadership"],
    goals: "Иска CV и LinkedIn, които показват стратегически, а не само административен принос.",
    preferredSessionModes: ["Онлайн", "На живо"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isDemo: true
  },
  {
    userId: "demo-user-princess",
    email: "princess.demo@example.com",
    name: "Принцеса Морбакс (демо потребител)",
    role: "client",
    plan: "free",
    avatarUrl: "https://api.dicebear.com/9.x/adventurer/svg?seed=Princess%20User%20Demo",
    city: "Онлайн",
    occupation: "Sales Specialist",
    age: 26,
    headline: "Търси salary negotiation подготовка и по-силни аргументи за промоция",
    bio: "Фалшив Powerpuff demo потребител за negotiation и offer review сценарии.",
    experienceSummary: "4 години продажби, target ownership и обучение на нови колеги.",
    experienceHighlights: ["Sales targets", "Client management", "Team onboarding"],
    educationHighlights: ["Sales academy"],
    skills: ["Negotiation", "Client work", "Presentation"],
    interests: ["Negotiation", "Offer Review", "Career Confidence"],
    keywords: ["salary", "promotion", "negotiation"],
    goals: "Иска да подготви аргументи за увеличение и да упражни трудния разговор.",
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
