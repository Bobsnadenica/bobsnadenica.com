import type { Booking, ConsultantProfile, UserProfile } from "./types";

export const demoConsultants: ConsultantProfile[] = [
  {
    consultantId: "consultant-anna-petrova",
    ownerUserId: "anna@careerlane.bg",
    slug: "anna-petrova",
    name: "Анна Петрова",
    headline: "Кариерен стратег за mid-senior професионалисти и leadership преходи",
    bio: "Работя с хора, които искат по-силен професионален разказ, по-ясно позициониране и уверен преход към следваща роля. Фокусът ми е върху executive CV, LinkedIn присъствие и интервю подготовка за международни компании.",
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
    mapImageUrl:
      "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80",
    tags: ["Leadership", "Career change", "Global roles"],
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
    headline: "Консултант по кариерна промяна, преговори и executive позициониране",
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
    mapImageUrl:
      "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=80",
    tags: ["Executives", "Negotiation", "Transitions"],
    availability: [
      "2026-03-22T13:00:00.000Z",
      "2026-03-22T14:30:00.000Z",
      "2026-03-24T08:30:00.000Z",
      "2026-03-26T16:00:00.000Z"
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
    mapImageUrl:
      "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1200&q=80",
    tags: ["First job", "Portfolio", "Confidence"],
    availability: [
      "2026-03-21T10:30:00.000Z",
      "2026-03-21T12:00:00.000Z",
      "2026-03-25T14:00:00.000Z",
      "2026-03-27T09:00:00.000Z"
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
