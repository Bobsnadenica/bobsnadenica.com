import type { Booking, ConsultantProfile, UserProfile } from "./types";

export const demoConsultants: ConsultantProfile[] = [
  {
    consultantId: "consultant-anna-petrova",
    ownerUserId: "anna@careerdoc.bg",
    slug: "anna-petrova",
    name: "Анна Петрова",
    headline: "Кариерен стратег за mid-senior професионалисти",
    bio: "Работя с хора, които искат по-силен професионален разказ, по-добро позициониране и по-ясна следваща стъпка. Фокусът ми е върху CV, LinkedIn и интервю подготовка за международни компании.",
    city: "София",
    languages: ["Български", "English"],
    specializations: ["CV стратегия", "LinkedIn оптимизация", "Интервю подготовка"],
    experienceYears: 8,
    priceBgn: 110,
    sessionModes: ["Онлайн", "В офис"],
    featured: true,
    rating: 4.9,
    reviewCount: 214,
    nextAvailable: "2026-03-23T09:30:00.000Z",
    avatarUrl: "/assets/consultant-1.jpg",
    heroUrl: "/assets/consultant-1.jpg",
    mapImageUrl: "/assets/map-static.jpg",
    tags: ["Tech careers", "Leadership", "Career change"],
    availability: [
      "2026-03-23T09:30:00.000Z",
      "2026-03-23T11:00:00.000Z",
      "2026-03-24T15:30:00.000Z",
      "2026-03-25T10:00:00.000Z"
    ]
  },
  {
    consultantId: "consultant-martin-iliev",
    ownerUserId: "martin@careerdoc.bg",
    slug: "martin-iliev",
    name: "Мартин Илиев",
    headline: "Консултант по кариерна промяна и executive позициониране",
    bio: "Помагам на хора с дълъг професионален опит да структурират преход към нови роли, нови индустрии или консултантска практика. Работата ми включва personal branding и high-stakes interview preparation.",
    city: "Пловдив",
    languages: ["Български", "Deutsch"],
    specializations: ["Executive coaching", "Career transition", "Salary negotiation"],
    experienceYears: 11,
    priceBgn: 140,
    sessionModes: ["Онлайн"],
    featured: true,
    rating: 4.8,
    reviewCount: 137,
    nextAvailable: "2026-03-22T13:00:00.000Z",
    avatarUrl: "/assets/consultant-2.jpg",
    heroUrl: "/assets/consultant-2.jpg",
    mapImageUrl: "/assets/map-static.jpg",
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
    ownerUserId: "nikol@careerdoc.bg",
    slug: "nikol-slavova",
    name: "Никол Славова",
    headline: "Junior-to-mid career coach за първи силен ход на пазара",
    bio: "Работя с млади професионалисти и хора в ранна кариера. Подреждам CV, портфолио, кандидатстване и интервюта така, че да звучат ясно, уверено и убедително.",
    city: "Варна",
    languages: ["Български", "English"],
    specializations: ["Entry-level CV", "Portfolio review", "Interview confidence"],
    experienceYears: 5,
    priceBgn: 75,
    sessionModes: ["Онлайн", "В офис"],
    featured: false,
    rating: 4.7,
    reviewCount: 88,
    nextAvailable: "2026-03-21T10:30:00.000Z",
    avatarUrl: "/assets/consultant-1.jpg",
    heroUrl: "/assets/consultant-1.jpg",
    mapImageUrl: "/assets/map-static.jpg",
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
  email: "demo@careerdoc.bg",
  name: "Демо Потребител",
  role: "client",
  plan: "free",
  city: "София",
  headline: "Product manager в преход към international roles",
  bio: "Търся по-силно позициониране, по-добър CV narrative и помощ с интервюта.",
  cvDocument: null,
  createdAt: "2026-03-18T11:00:00.000Z",
  updatedAt: "2026-03-18T11:00:00.000Z"
};
