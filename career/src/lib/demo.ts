import type { Booking, ConsultantProfile, UserProfile } from "./types";

const officeScene =
  "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1400&q=80";
const meetingScene =
  "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1400&q=80";
const coachingScene =
  "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1400&q=80";
const workshopScene =
  "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1400&q=80";

export const demoConsultants: ConsultantProfile[] = [
  {
    consultantId: "consultant-anna-petrova",
    ownerUserId: "anna@careerlane.bg",
    slug: "anna-petrova",
    name: "Анна Петрова",
    headline: "Кариерен стратег за leadership преходи и международни роли",
    bio: "Работя с mid-senior професионалисти, които искат по-силен професионален разказ, по-ясно позициониране и уверен преход към следваща роля. Фокусът ми е върху executive CV, LinkedIn присъствие и интервю подготовка.",
    city: "София",
    languages: ["Български", "English"],
    specializations: ["Executive CV", "LinkedIn позициониране", "Интервю подготовка"],
    experienceYears: 8,
    priceBgn: 120,
    sessionModes: ["Онлайн", "В офис"],
    featured: true,
    rating: 4.9,
    reviewCount: 214,
    nextAvailable: "2026-03-23T09:30:00.000Z",
    avatarUrl:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=700&q=80",
    heroUrl:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=1200&q=80",
    mapImageUrl: meetingScene,
    tags: ["Leadership", "Global roles", "Career change"],
    availability: [
      "2026-03-23T09:30:00.000Z",
      "2026-03-23T11:00:00.000Z",
      "2026-03-24T15:30:00.000Z",
      "2026-03-25T10:00:00.000Z"
    ]
  },
  {
    consultantId: "consultant-martin-iliev",
    ownerUserId: "martin@careerlane.bg",
    slug: "martin-iliev",
    name: "Мартин Илиев",
    headline: "Консултант по кариерна промяна, преговори и executive positioning",
    bio: "Помагам на хора с дълъг професионален опит да структурират преход към нови роли, нови индустрии или самостоятелна практика. Работя по позициониране, преговори и high-stakes интервюта.",
    city: "Пловдив",
    languages: ["Български", "Deutsch"],
    specializations: ["Executive coaching", "Career transition", "Salary negotiation"],
    experienceYears: 11,
    priceBgn: 150,
    sessionModes: ["Онлайн"],
    featured: true,
    rating: 4.8,
    reviewCount: 137,
    nextAvailable: "2026-03-22T13:00:00.000Z",
    avatarUrl:
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=700&q=80",
    heroUrl:
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=1200&q=80",
    mapImageUrl: officeScene,
    tags: ["Executives", "Negotiation", "Transitions"],
    availability: [
      "2026-03-22T13:00:00.000Z",
      "2026-03-22T14:30:00.000Z",
      "2026-03-24T08:30:00.000Z",
      "2026-03-26T16:00:00.000Z"
    ]
  },
  {
    consultantId: "consultant-elena-georgieva",
    ownerUserId: "elena@careerlane.bg",
    slug: "elena-georgieva",
    name: "Елена Георгиева",
    headline: "Кариера в продуктови екипи, people management и strategic storytelling",
    bio: "Работя с product managers, leads и нови people managers. Подреждам ръководни истории, преговори, вътрешно позициониране и преминаване към по-видими роли.",
    city: "Берлин",
    languages: ["Български", "English"],
    specializations: ["Leadership narrative", "Promotion strategy", "Stakeholder presence"],
    experienceYears: 10,
    priceBgn: 165,
    sessionModes: ["Онлайн"],
    featured: true,
    rating: 4.9,
    reviewCount: 173,
    nextAvailable: "2026-03-24T08:00:00.000Z",
    avatarUrl:
      "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=700&q=80",
    heroUrl:
      "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=1200&q=80",
    mapImageUrl: workshopScene,
    tags: ["Product", "Leadership", "Promotion"],
    availability: [
      "2026-03-24T08:00:00.000Z",
      "2026-03-24T10:30:00.000Z",
      "2026-03-26T15:00:00.000Z",
      "2026-03-28T09:30:00.000Z"
    ]
  },
  {
    consultantId: "consultant-stefan-rusev",
    ownerUserId: "stefan@careerlane.bg",
    slug: "stefan-rusev",
    name: "Стефан Русев",
    headline: "Interview coach за enterprise продажби, partnerships и go-to-market роли",
    bio: "Подготвям търговски и go-to-market професионалисти за интервюта, панелни срещи и по-силно лично представяне. Работим върху pitch, self-positioning и final rounds.",
    city: "София",
    languages: ["Български", "English"],
    specializations: ["Interview loops", "Sales leadership", "Personal pitch"],
    experienceYears: 9,
    priceBgn: 135,
    sessionModes: ["Онлайн", "В офис"],
    featured: false,
    rating: 4.8,
    reviewCount: 94,
    nextAvailable: "2026-03-22T16:00:00.000Z",
    avatarUrl:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=700&q=80",
    heroUrl:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=1200&q=80",
    mapImageUrl: coachingScene,
    tags: ["Sales", "Partnerships", "Final rounds"],
    availability: [
      "2026-03-22T16:00:00.000Z",
      "2026-03-23T12:30:00.000Z",
      "2026-03-27T09:00:00.000Z",
      "2026-03-29T11:30:00.000Z"
    ]
  },
  {
    consultantId: "consultant-nikol-slavova",
    ownerUserId: "nikol@careerlane.bg",
    slug: "nikol-slavova",
    name: "Никол Славова",
    headline: "Консултант за early-career кандидати и силно първо позициониране",
    bio: "Работя с млади професионалисти и хора в ранна кариера. Подреждам CV, профил, кандидатстване и интервюта така, че да звучат ясно, уверено и професионално.",
    city: "Варна",
    languages: ["Български", "English"],
    specializations: ["Entry-level CV", "Portfolio review", "Interview confidence"],
    experienceYears: 5,
    priceBgn: 85,
    sessionModes: ["Онлайн", "В офис"],
    featured: false,
    rating: 4.7,
    reviewCount: 88,
    nextAvailable: "2026-03-21T10:30:00.000Z",
    avatarUrl:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=700&q=80",
    heroUrl:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=1200&q=80",
    mapImageUrl: coachingScene,
    tags: ["First job", "Portfolio", "Confidence"],
    availability: [
      "2026-03-21T10:30:00.000Z",
      "2026-03-21T12:00:00.000Z",
      "2026-03-25T14:00:00.000Z",
      "2026-03-27T09:00:00.000Z"
    ]
  },
  {
    consultantId: "consultant-maria-koleva",
    ownerUserId: "maria@careerlane.bg",
    slug: "maria-koleva",
    name: "Мария Колева",
    headline: "CV, LinkedIn и career reset за marketing и brand professionals",
    bio: "Помагам на маркетинг и бранд професионалисти да структурират силно позициониране, ясно портфолио и уверен разговор за резултати, растеж и посока.",
    city: "Амстердам",
    languages: ["Български", "English"],
    specializations: ["Brand roles", "CV refresh", "Portfolio story"],
    experienceYears: 7,
    priceBgn: 110,
    sessionModes: ["Онлайн"],
    featured: false,
    rating: 4.8,
    reviewCount: 66,
    nextAvailable: "2026-03-23T15:00:00.000Z",
    avatarUrl:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=700&q=80",
    heroUrl:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=1200&q=80",
    mapImageUrl: meetingScene,
    tags: ["Marketing", "Brand", "Portfolio"],
    availability: [
      "2026-03-23T15:00:00.000Z",
      "2026-03-24T09:00:00.000Z",
      "2026-03-26T13:30:00.000Z",
      "2026-03-28T16:30:00.000Z"
    ]
  },
  {
    consultantId: "consultant-dimitar-vasilev",
    ownerUserId: "dimitar@careerlane.bg",
    slug: "dimitar-vasilev",
    name: "Димитър Василев",
    headline: "Career architect за data, analytics и AI product roles",
    bio: "Работя с data specialists, analysts и AI product professionals, които искат по-ясна история, по-силно позициониране и по-уверен преход към международни екипи.",
    city: "Лондон",
    languages: ["Български", "English"],
    specializations: ["Data careers", "Analytics leadership", "International applications"],
    experienceYears: 12,
    priceBgn: 175,
    sessionModes: ["Онлайн"],
    featured: false,
    rating: 4.9,
    reviewCount: 121,
    nextAvailable: "2026-03-25T08:30:00.000Z",
    avatarUrl:
      "https://images.unsplash.com/photo-1556157382-97eda2d62296?auto=format&fit=crop&w=700&q=80",
    heroUrl:
      "https://images.unsplash.com/photo-1556157382-97eda2d62296?auto=format&fit=crop&w=1200&q=80",
    mapImageUrl: officeScene,
    tags: ["Data", "AI", "International"],
    availability: [
      "2026-03-25T08:30:00.000Z",
      "2026-03-25T11:00:00.000Z",
      "2026-03-27T14:30:00.000Z",
      "2026-03-30T10:00:00.000Z"
    ]
  },
  {
    consultantId: "consultant-yoana-dimitrova",
    ownerUserId: "yoana@careerlane.bg",
    slug: "yoana-dimitrova",
    name: "Йоана Димитрова",
    headline: "People manager coaching за women in leadership и visible career moves",
    bio: "Работя с жени в leadership преход, които искат по-уверено представяне, по-силен voice in the room и по-добра рамка за растеж, преговори и visible next step.",
    city: "София",
    languages: ["Български", "English"],
    specializations: ["Women in leadership", "Promotion readiness", "Executive presence"],
    experienceYears: 9,
    priceBgn: 145,
    sessionModes: ["Онлайн", "В офис"],
    featured: false,
    rating: 4.9,
    reviewCount: 103,
    nextAvailable: "2026-03-24T17:00:00.000Z",
    avatarUrl:
      "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=700&q=80",
    heroUrl:
      "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=1200&q=80",
    mapImageUrl: workshopScene,
    tags: ["Leadership", "Women in tech", "Promotion"],
    availability: [
      "2026-03-24T17:00:00.000Z",
      "2026-03-26T09:00:00.000Z",
      "2026-03-27T17:00:00.000Z",
      "2026-03-31T10:30:00.000Z"
    ]
  },
  {
    consultantId: "consultant-petar-hristov",
    ownerUserId: "petar@careerlane.bg",
    slug: "petar-hristov",
    name: "Петър Христов",
    headline: "Coach за founders, operators и senior hires в scale-up екипи",
    bio: "Подготвям founders, chief of staff профили и senior operators за точен personal story, strong decision narrative и уверено представяне пред board, investors и hiring panels.",
    city: "Барселона",
    languages: ["Български", "English", "Español"],
    specializations: ["Founder transitions", "Operator roles", "Board-level interviews"],
    experienceYears: 13,
    priceBgn: 190,
    sessionModes: ["Онлайн"],
    featured: true,
    rating: 5,
    reviewCount: 79,
    nextAvailable: "2026-03-26T08:00:00.000Z",
    avatarUrl:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=700&q=80",
    heroUrl:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=1200&q=80",
    mapImageUrl: meetingScene,
    tags: ["Founders", "Scale-up", "Operators"],
    availability: [
      "2026-03-26T08:00:00.000Z",
      "2026-03-26T12:00:00.000Z",
      "2026-03-28T10:00:00.000Z",
      "2026-03-30T16:00:00.000Z"
    ]
  },
  {
    consultantId: "consultant-ivana-stoyanova",
    ownerUserId: "ivana@careerlane.bg",
    slug: "ivana-stoyanova",
    name: "Ивана Стоянова",
    headline: "Career partner за finance, consulting и client-facing strategy roles",
    bio: "Подреждам силен професионален профил за finance и consulting специалисти, които искат по-ясен business story, по-силно CV и увереност за competitive interview cycles.",
    city: "Виена",
    languages: ["Български", "English", "Deutsch"],
    specializations: ["Consulting applications", "Finance careers", "Case preparation"],
    experienceYears: 8,
    priceBgn: 155,
    sessionModes: ["Онлайн"],
    featured: false,
    rating: 4.8,
    reviewCount: 57,
    nextAvailable: "2026-03-22T09:30:00.000Z",
    avatarUrl:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=700&q=80",
    heroUrl:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=1200&q=80",
    mapImageUrl: officeScene,
    tags: ["Finance", "Consulting", "Case prep"],
    availability: [
      "2026-03-22T09:30:00.000Z",
      "2026-03-23T14:00:00.000Z",
      "2026-03-24T16:00:00.000Z",
      "2026-03-29T09:00:00.000Z"
    ]
  },
  {
    consultantId: "consultant-kalina-mileva",
    ownerUserId: "kalina@careerlane.bg",
    slug: "kalina-mileva",
    name: "Калина Милева",
    headline: "LinkedIn и personal branding консултант за senior experts и visible specialists",
    bio: "Работя с професионалисти, които вече имат добър опит, но искат по-ясно дигитално присъствие, по-силен LinkedIn профил и по-добър разказ за своите резултати и стойност.",
    city: "София",
    languages: ["Български", "English"],
    specializations: ["LinkedIn strategy", "Personal branding", "Executive summary"],
    experienceYears: 9,
    priceBgn: 130,
    sessionModes: ["Онлайн", "В офис"],
    featured: false,
    rating: 4.9,
    reviewCount: 112,
    nextAvailable: "2026-03-24T11:00:00.000Z",
    avatarUrl:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=700&q=80",
    heroUrl:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1200&q=80",
    mapImageUrl: officeScene,
    tags: ["Branding", "LinkedIn", "Visibility"],
    availability: [
      "2026-03-24T11:00:00.000Z",
      "2026-03-25T15:30:00.000Z",
      "2026-03-27T10:30:00.000Z",
      "2026-03-31T14:00:00.000Z"
    ]
  },
  {
    consultantId: "consultant-boris-georgiev",
    ownerUserId: "boris@careerlane.bg",
    slug: "boris-georgiev",
    name: "Борис Георгиев",
    headline: "Career coach за operations, program management и cross-functional leadership",
    bio: "Помагам на operations и program лидери да структурират по-силен профил, да преведат комплексния си опит на ясен език и да се подготвят за ръководни и international роли.",
    city: "Прага",
    languages: ["Български", "English"],
    specializations: ["Operations leadership", "Program management", "Interview strategy"],
    experienceYears: 12,
    priceBgn: 170,
    sessionModes: ["Онлайн"],
    featured: false,
    rating: 4.8,
    reviewCount: 91,
    nextAvailable: "2026-03-25T12:00:00.000Z",
    avatarUrl:
      "https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&w=700&q=80",
    heroUrl:
      "https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&w=1200&q=80",
    mapImageUrl: meetingScene,
    tags: ["Operations", "Leadership", "Program"],
    availability: [
      "2026-03-25T12:00:00.000Z",
      "2026-03-26T09:30:00.000Z",
      "2026-03-28T13:00:00.000Z",
      "2026-04-01T10:00:00.000Z"
    ]
  },
  {
    consultantId: "consultant-desi-atanasova",
    ownerUserId: "desi@careerlane.bg",
    slug: "desi-atanasova",
    name: "Деси Атанасова",
    headline: "Career advisor за HR, talent и people experience professionals",
    bio: "Работя с HR и talent специалисти, които искат да покажат по-добре влиянието си върху бизнеса, да подредят успехите си и да се позиционират за по-видими people роли.",
    city: "Брюксел",
    languages: ["Български", "English", "Français"],
    specializations: ["People careers", "HR positioning", "Promotion strategy"],
    experienceYears: 8,
    priceBgn: 140,
    sessionModes: ["Онлайн"],
    featured: false,
    rating: 4.9,
    reviewCount: 74,
    nextAvailable: "2026-03-23T08:30:00.000Z",
    avatarUrl:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=700&q=80",
    heroUrl:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=1200&q=80",
    mapImageUrl: workshopScene,
    tags: ["HR", "Talent", "People"],
    availability: [
      "2026-03-23T08:30:00.000Z",
      "2026-03-24T12:00:00.000Z",
      "2026-03-27T16:30:00.000Z",
      "2026-03-30T09:00:00.000Z"
    ]
  },
  {
    consultantId: "consultant-radoslav-tanev",
    ownerUserId: "radoslav@careerlane.bg",
    slug: "radoslav-tanev",
    name: "Радослав Танев",
    headline: "Interview и CV strategist за engineering leadership и technical management",
    bio: "Подготвям engineering managers и senior IC профили за leadership преходи, систематизиране на технически постижения и уверено представяне пред hiring panels и executive stakeholders.",
    city: "Мюнхен",
    languages: ["Български", "English", "Deutsch"],
    specializations: ["Engineering leadership", "Technical CV", "Hiring panels"],
    experienceYears: 14,
    priceBgn: 185,
    sessionModes: ["Онлайн"],
    featured: true,
    rating: 5,
    reviewCount: 134,
    nextAvailable: "2026-03-26T10:30:00.000Z",
    avatarUrl:
      "https://images.unsplash.com/photo-1504257432389-52343af06ae3?auto=format&fit=crop&w=700&q=80",
    heroUrl:
      "https://images.unsplash.com/photo-1504257432389-52343af06ae3?auto=format&fit=crop&w=1200&q=80",
    mapImageUrl: coachingScene,
    tags: ["Engineering", "Leadership", "Interviews"],
    availability: [
      "2026-03-26T10:30:00.000Z",
      "2026-03-27T12:30:00.000Z",
      "2026-03-31T15:00:00.000Z",
      "2026-04-02T09:30:00.000Z"
    ]
  }
];

export const demoBookings: Booking[] = [
  {
    bookingId: "demo-booking-1",
    consultantId: "consultant-anna-petrova",
    consultantName: "Анна Петрова",
    clientId: "demo-client",
    scheduledAt: "2026-03-23T09:30:00.000Z",
    status: "confirmed",
    note: "Искам преглед на CV и позициониране за product роли.",
    createdAt: "2026-03-18T11:00:00.000Z"
  },
  {
    bookingId: "demo-booking-2",
    consultantId: "consultant-maria-koleva",
    consultantName: "Мария Колева",
    clientId: "demo-client",
    scheduledAt: "2026-03-24T09:00:00.000Z",
    status: "requested",
    note: "Търся преглед на портфолио и маркетинг позициониране.",
    createdAt: "2026-03-19T09:40:00.000Z"
  }
];

export const demoProfile: UserProfile = {
  userId: "demo-client",
  email: "demo@careerlane.bg",
  name: "Елица Маринова",
  role: "client",
  plan: "free",
  city: "София",
  headline: "Product manager в преход към международна leadership роля",
  bio: "Търся по-силно позициониране, ясен професионален разказ и по-добра подготовка за интервюта и преговори.",
  cvDocument: null,
  createdAt: "2026-03-18T11:00:00.000Z",
  updatedAt: "2026-03-18T11:00:00.000Z"
};
