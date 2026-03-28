import { FormEvent, ReactNode, useEffect, useMemo, useState } from "react";
import {
  HashRouter,
  Link,
  Navigate,
  NavLink,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
  useSearchParams
} from "react-router-dom";
import { api } from "../lib/api";
import { AuthProvider, useAuth } from "../lib/auth";
import { config } from "../lib/config";
import { demoConsultants, demoProfessionalProfiles } from "../lib/demo";
import {
  buildPreviewConsultantProfile,
  buildPreviewUserProfile,
  clearMockPreviewAccount,
  isPublicConsultantPreview,
  readMockPreviewAccount,
  subscribeMockPreviewAccount,
  writeMockPreviewAccount,
  type MockBillingCycle,
  type MockPreviewAccount,
  type MockSubscriptionStatus
} from "../lib/mock-preview";
import { resolvePublicUrl } from "../lib/url";
import type {
  Booking,
  ConsultantProfile,
  ConsultantProfileType,
  PlanTier,
  UploadedDocument,
  UserProfile,
  UserRole
} from "../lib/types";
const PENDING_BOOTSTRAP_KEY = "careerdoc.pending-bootstrap";

type PendingBootstrap = {
  name: string;
  email: string;
  role: UserRole;
  plan: PlanTier;
  consultantProfileType?: ConsultantProfileType;
};

function readPendingBootstrap() {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(PENDING_BOOTSTRAP_KEY);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as PendingBootstrap;
  } catch {
    return null;
  }
}

function writePendingBootstrap(value: PendingBootstrap) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(PENDING_BOOTSTRAP_KEY, JSON.stringify(value));
  }
}

function clearPendingBootstrap() {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(PENDING_BOOTSTRAP_KEY);
  }
}

const MATCH_STOP_WORDS = new Set([
  "and",
  "for",
  "the",
  "with",
  "или",
  "как",
  "при",
  "за",
  "на",
  "по",
  "в",
  "с",
  "от",
  "до",
  "към"
]);

type AuthScreen =
  | "login"
  | "register"
  | "confirm"
  | "forgot-request"
  | "forgot-confirm";

type MarketingPlan = {
  name: string;
  price?: string;
  badge: string;
  featured?: boolean;
  note: string;
  points: string[];
  ctaLabel: string;
  ctaTo: string;
};

type MatchInsight = {
  score: number;
  label: string;
  note: string;
};

type SuggestedFillMode = "replace" | "append-list" | "append-lines" | "append-text";
type QuestionSuggestionOption = string | { label: string; value: string };

const userPlans: MarketingPlan[] = [
  {
    name: "Free user",
    price: "0 €",
    badge: "Отворен достъп",
    note: "Потребителите използват CareerLane без платено членство и могат да разглеждат всички активни консултанти и ментори.",
    points: [
      "Пълен достъп до активните консултанти и ментори",
      "1 основен CV файл в профила",
      "Заявки за консултации и история на сесиите"
    ],
    ctaLabel: "Създай безплатен профил",
    ctaTo: "/auth?tab=register&plan=free&role=client"
  },
  {
    name: "Paid user",
    badge: "Очаквай скоро",
    note: "Разширеният потребителски tier остава в продуктовата посока, но няма да се активира в текущия production launch.",
    points: [
      "Подготвен модел за повече пространство и разширени инструменти",
      "Възможност за бъдещи премиум функционалности",
      "Няма плащане или активация в текущата версия"
    ],
    ctaLabel: "Научи повече",
    ctaTo: "/faq"
  }
];

const consultantPlans: MarketingPlan[] = [
  {
    name: "Free consultant",
    price: "0 €",
    badge: "Публичен профил",
    note: "Консултантите и менторите могат да създадат безплатен публичен профил, да добавят снимка, CV, теми и свободни слотове и да бъдат намирани в търсенето.",
    points: [
      "Публичен профил, достъпен в списъка с консултанти и ментори",
      "Редакция на специализации, теми, снимка и свободни слотове",
      "Възможност потребителите да разглеждат и резервират консултации"
    ],
    ctaLabel: "Създай профил",
    ctaTo: "/auth?tab=register&plan=free&role=consultant"
  },
  {
    name: "Paid consultant",
    badge: "Очаквай скоро",
    featured: true,
    note: "Разширеният consultant tier ще даде по-силно представяне и допълнителни възможности, но не се активира в текущия launch.",
    points: [
      "Подготвен модел за разширено представяне",
      "Бъдещи опции за по-видимо присъствие",
      "Без плащане и без активиране на платени услуги в текущата версия"
    ],
    ctaLabel: "Очаквай скоро",
    ctaTo: "/faq"
  },
  {
    name: "Consultant gold",
    badge: "Премиум tier",
    note: "Gold tier остава част от roadmap-а за бъдещо разширение на продукта и не е включен в текущата production активация.",
    points: [
      "Подготвена посока за premium видимост и разширен профил",
      "Подходящо за по-късен етап на продукта",
      "Не се активира в текущия launch"
    ],
    ctaLabel: "Очаквай скоро",
    ctaTo: "/faq"
  }
];

const homeJourney = [
  {
    step: "01",
    title: "За професионалисти",
    text: "Откриваш консултант според целите си, професионалния си профил и темата, по която търсиш подкрепа.",
    ctaLabel: "Разгледай потребителската страница",
    ctaTo: "/users"
  },
  {
    step: "02",
    title: "За консултанти и ментори",
    text: "Изграждаш професионално присъствие, подреждаш профила си и стартираш с безплатен публичен профил, който хората могат да намират и разглеждат.",
    ctaLabel: "Разгледай страницата за консултанти и ментори",
    ctaTo: "/consultants"
  },
  {
    step: "03",
    title: "За партньори",
    text: "Има място за рекламни позиции към работодатели, академии и кариерни програми.",
    ctaLabel: "Заяви рекламна позиция",
    ctaTo: "/auth?tab=register"
  }
] as const;

const userJourney = [
  {
    step: "01",
    title: "Определи фокус",
    text: "Търси по тема, град и тип подкрепа, за да стигнеш по-бързо до правилния профил."
  },
  {
    step: "02",
    title: "Сравни профили",
    text: "Виж специализации, опит, езици и следващи свободни слотове в един ясен изглед."
  },
  {
    step: "03",
    title: "Подготви профила си",
    text: "Качи CV, довърши заглавието си и използвай таблото като работно място за следващите стъпки."
  }
] as const;

const popularSearchTopics = [
  {
    label: "CV и LinkedIn",
    value: "LinkedIn профил"
  },
  {
    label: "Интервю подготовка",
    value: "интервю подготовка"
  },
  {
    label: "Кариерна промяна",
    value: "кариерна промяна"
  },
  {
    label: "Leadership",
    value: "leadership"
  },
  {
    label: "Executive CV",
    value: "executive CV"
  }
] as const;

const socialProviders = [
  { key: "google", label: "Google" },
  { key: "apple", label: "Apple" },
  { key: "linkedin", label: "LinkedIn" }
] as const;

const aboutHighlights = [
  {
    value: `${demoConsultants.length}+`,
    label: "примерни консултантски профили в CareerLane"
  },
  {
    value: "Free / Разширен",
    label: "ясно разграничени членства за потребители и консултанти"
  },
  {
    value: "1 workspace",
    label: "централно място за профил, документи и предстоящи сесии"
  }
] as const;

const aboutPrinciples = [
  {
    title: "Ясна структура",
    text: "Потребителите трябва да разбират къде се намират, какво могат да направят и каква е следващата полезна стъпка."
  },
  {
    title: "Професионално доверие",
    text: "Профилите, страниците и публичните секции са оформени така, че да изглеждат уверено и сериозно още на първо отваряне."
  },
  {
    title: "Лек процес на работа",
    text: "Регистрацията, входът, профилът и достъпът до кариерни консултанти са подредени с минимално триене и без излишни технически детайли."
  }
] as const;

const faqItems = [
  {
    question: "Какво получават потребителите безплатно?",
    answer:
      "Потребителите използват CareerLane без платено членство на този етап. Те могат да създадат профил, да добавят основна информация и CV, да разглеждат активните консултанти и ментори и да заявяват консултации."
  },
  {
    question: "Могат ли консултантите да използват платформата безплатно?",
    answer:
      "Да. Консултантите и менторите могат да създадат безплатен публичен профил, който да бъде откриваем, отваряем и споделяем. Разширените tiers остават за следващ етап на продукта."
  },
  {
    question: "Показват ли се публично консултантските тарифи?",
    answer:
      "Не. В текущата публична версия акцентът е върху профила, експертизата и свободните слотове, а не върху видими тарифи."
  },
  {
    question: "Как работи регистрацията и потвърждението?",
    answer:
      "Регистрацията е организирана като един ясен поток с директен достъп до профила след създаването му. Потвърждението е част от този процес и не изисква отделен бутон на входната страница."
  },
  {
    question: "Има ли forgot password процес?",
    answer:
      "Да. На страницата за вход има отделен поток за забравена парола с изпращане на код и въвеждане на нова парола."
  },
  {
    question: "Какви документи могат да се пазят в профила?",
    answer:
      "Профилът започва с основен CV документ и ключова информация за професионалния контекст. Структурата е подготвена да се разширява с дипломи, портфолио и допълнителни материали с развитието на услугата."
  },
  {
    question: "Как се заявява рекламна позиция?",
    answer:
      "Партньорите могат да използват рекламната зона и страницата Contact, където са описани каналите за партньорски и рекламни заявки."
  },
  {
    question: "Гарантира ли платформата наемане или кариерен резултат?",
    answer:
      "Не. CareerLane предоставя среда за професионално позициониране и консултации, но не гарантира конкретен резултат при кандидатстване, интервю или наемане."
  }
] as const;

const legalSections = [
  {
    title: "Условия за използване",
    points: [
      "Платформата е предназначена за професионалисти, консултанти и партньори, които използват услугата законосъобразно и добросъвестно.",
      "Акаунтът е личен и потребителят носи отговорност за точността на предоставените данни и сигурността на достъпа си.",
      "CareerLane може да актуализира интерфейса, членствата и публичните секции при развитие на услугата."
    ]
  },
  {
    title: "Поверителност и данни",
    points: [
      "Профилните данни и документите се използват за предоставяне на услугата, за достъп до таблото и за улесняване на консултантския процес.",
      "Публично се показва само информацията, която е предназначена за публичен профил на консултант или маркетингова страница.",
      "Потребителите могат да поискат корекция или заличаване на данни чрез канала за контакт, описан на Contact страницата."
    ]
  },
  {
    title: "Членства и платени услуги",
    points: [
      "Free и Разширеното членство имат различен обхват и видимост, описани в публичните страници на платформата.",
      "При бъдещи платени активации условията, периодът и цената следва да бъдат показани ясно преди потвърждение на покупката.",
      "Публичната версия на сайта не представлява обещание за конкретна цена извън видимото описание на членството."
    ]
  },
  {
    title: "Роля на платформата",
    points: [
      "CareerLane е среда за свързване, позициониране и организация на консултации между потребители и консултанти.",
      "Платформата не дава гаранция за интервю, оферта, наемане, повишение или конкретен кариерен резултат.",
      "Консултантите носят отговорност за съдържанието и професионалното представяне в собствените си профили."
    ]
  },
  {
    title: "Cookies и комуникация",
    points: [
      "Сайтът може да използва функционални и аналитични механизми за нормална работа, сигурност и подобряване на потребителското изживяване.",
      "Системните съобщения, потвържденията и възстановяването на парола са част от нормалното предоставяне на услугата.",
      "Маркетингови и партньорски комуникации следва да бъдат отделени ясно от системните съобщения."
    ]
  }
] as const;

const contactChannels = [
  {
    title: "Общи въпроси и поддръжка",
    description: "За въпроси по профила, достъпа, регистрацията и използването на платформата.",
    email: "support@careerlane.eu"
  },
  {
    title: "Партньорства и реклама",
    description: "За рекламни позиции, работодателски брандове, академии и други партньорски формати.",
    email: "partners@careerlane.eu"
  },
  {
    title: "Правни и данни",
    description: "За правни запитвания, privacy заявки и административни въпроси, свързани с данни.",
    email: "legal@careerlane.eu"
  }
] as const;

function formatDate(date: string) {
  return new Intl.DateTimeFormat("bg-BG", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(date));
}

function formatEuro(value: number) {
  return new Intl.NumberFormat("bg-BG", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0
  }).format(value);
}

function formatRoleLabel(role: UserRole) {
  return role === "consultant" ? "Консултант / ментор" : "Потребител";
}

function formatPlanLabel(plan: PlanTier) {
  return plan === "pro" ? "Plus" : "Free";
}

function formatMembershipLabel(role: UserRole, plan: PlanTier) {
  if (role === "consultant") {
    return plan === "pro" ? "Разширен профил" : "Публичен профил";
  }

  return plan === "pro" ? "Разширен достъп" : "Free";
}

function formatConsultantTypeLabel(profileType?: ConsultantProfileType) {
  return profileType === "mentor" ? "Ментор" : "Консултант";
}

function getConsultantProfileType(consultant: ConsultantProfile) {
  return consultant.profileType || "consultant";
}

function isPaidConsultantPlan(role: UserRole, plan: PlanTier) {
  return role === "consultant" && plan === "pro";
}

function formatBookingStatusLabel(status: Booking["status"]) {
  if (status === "confirmed") return "Потвърдена";
  if (status === "cancelled") return "Отказана";
  return "Заявена";
}

function getMockProPrice(role: UserRole, billingCycle: MockBillingCycle) {
  if (role !== "consultant") {
    return 0;
  }

  const prices = {
    consultant: {
      monthly: 39,
      yearly: 390
    }
  } as const;

  return prices.consultant[billingCycle];
}

function getMockPlanFeatures(role: UserRole, plan: PlanTier) {
  if (role === "consultant") {
    return plan === "pro"
      ? [
          "Публичен профил с разширено представяне",
          "По-богато описание на услугите и материалите",
          "Подготвена основа за бъдещи премиум възможности",
          "Споделяем профил и активни запитвания"
        ]
      : [
          "Публичен консултантски или менторски профил",
          "Основни специализации, езици и свободни слотове",
          "CV и професионално присъствие, достъпни за потребителите",
          "Възможност да бъдеш намиран и резервиран"
        ];
  }

  return [
    "Безплатен достъп до всички активни консултанти и ментори",
    "Личен профил с основна информация и CV документ",
    "История на заявки и сесии",
    "Лесен старт без плащане"
  ];
}

function getMockStorageLabel(plan: PlanTier) {
  return plan === "pro" ? "6 файла и активен архив" : "1 основен CV файл";
}

function buildMockNextBillingDate(billingCycle: MockBillingCycle) {
  const nextDate = new Date();

  if (billingCycle === "yearly") {
    nextDate.setFullYear(nextDate.getFullYear() + 1);
  } else {
    nextDate.setMonth(nextDate.getMonth() + 1);
  }

  return nextDate.toISOString();
}

function getNextBooking(bookings: Booking[]) {
  const now = Date.now();
  const sortedBookings = [...bookings].sort(
    (left, right) =>
      new Date(left.scheduledAt).getTime() - new Date(right.scheduledAt).getTime()
  );

  return (
    sortedBookings.find((booking) => new Date(booking.scheduledAt).getTime() >= now) ||
    sortedBookings[0] ||
    null
  );
}

function getProfileCompletion(
  profile: UserProfile,
  consultantProfile: ConsultantProfile | null
) {
  const baseChecks = [
    Boolean(profile.name.trim()),
    Boolean((profile.city || "").trim()),
    Boolean((profile.occupation || "").trim()),
    Boolean(profile.age),
    Boolean((profile.headline || "").trim()),
    Boolean((profile.bio || "").trim()),
    Boolean((profile.interests || []).length),
    Boolean((profile.keywords || []).length),
    Boolean((profile.goals || "").trim()),
    Boolean(profile.cvDocument)
  ];

  const consultantChecks =
    profile.role === "consultant"
      ? [
          Boolean(consultantProfile?.headline.trim()),
          Boolean(consultantProfile?.bio.trim()),
          Boolean(consultantProfile?.specializations.length),
          Boolean(consultantProfile?.languages.length),
          Boolean((consultantProfile?.idealFor || []).length),
          Boolean((consultantProfile?.consultationTopics || []).length),
          Boolean((consultantProfile?.workApproach || "").trim()),
          Boolean(consultantProfile?.availability.length)
        ]
      : [];

  const checks = [...baseChecks, ...consultantChecks];
  const completed = checks.filter(Boolean).length;

  return Math.round((completed / checks.length) * 100);
}

function getDocumentCapacityNote(plan: PlanTier) {
  return plan === "pro"
    ? "Разширено място за CV, дипломи и допълнителни материали."
    : "Основно място за един активен CV документ.";
}

function getRolePlanSummary(role: UserRole, plan: PlanTier) {
  if (role === "consultant") {
    return plan === "pro"
      ? "Публичен консултантски или менторски профил с по-богато представяне и подготвена основа за бъдещи premium възможности."
      : "Публичен консултантски или менторски профил, който хората могат да намират, отварят и резервират.";
  }

  return plan === "pro"
    ? "Разширен потребителски профил, подготвен за бъдещи premium възможности."
    : "Безплатен потребителски профил с достъп до активните консултанти и ментори.";
}

function slugifyValue(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9а-я]+/gi, "-")
    .replace(/^-|-$/g, "");
}

function parseListValue(value: FormDataEntryValue | null) {
  return String(value || "")
    .split(/\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function mergeUniqueValues(current: string, next: string, separator: ", " | "\n") {
  const items = [current, next]
    .flatMap((value) =>
      value
        .split(/\n|,/)
        .map((item) => item.trim())
        .filter(Boolean)
    )
    .filter((item, index, values) => values.indexOf(item) === index);

  return items.join(separator);
}

function applySuggestedFieldValue(
  form: HTMLFormElement | null,
  fieldName: string,
  value: string,
  mode: SuggestedFillMode = "replace"
) {
  if (!form) {
    return;
  }

  const control = form.elements.namedItem(fieldName);

  if (!(control instanceof HTMLInputElement || control instanceof HTMLTextAreaElement)) {
    return;
  }

  const currentValue = control.value.trim();
  const nextValue =
    mode === "append-list"
      ? mergeUniqueValues(currentValue, value, ", ")
      : mode === "append-lines"
        ? mergeUniqueValues(currentValue, value, "\n")
        : mode === "append-text"
          ? currentValue.includes(value)
            ? currentValue
            : [currentValue, value].filter(Boolean).join(" ")
          : value;

  control.value = nextValue;
  control.dispatchEvent(new Event("input", { bubbles: true }));
  control.dispatchEvent(new Event("change", { bubbles: true }));
  control.focus();
}

function buildAvailabilityPreset(daysAhead: number, hour: number): {
  label: string;
  value: string;
} {
  const slot = new Date();
  slot.setDate(slot.getDate() + daysAhead);
  slot.setHours(hour, 0, 0, 0);

  return {
    label: `${daysAhead === 1 ? "Утре" : `След ${daysAhead} дни`} · ${slot.toLocaleTimeString(
      "bg-BG",
      {
        hour: "2-digit",
        minute: "2-digit"
      }
    )}`,
    value: slot.toISOString()
  };
}

function tokenizeText(value: string) {
  return value
    .toLowerCase()
    .split(/[^a-z0-9а-я]+/gi)
    .map((token) => token.trim())
    .filter((token) => token.length > 2 && !MATCH_STOP_WORDS.has(token));
}

function formatSignalLabel(value: string) {
  if (/^[a-z0-9 -]+$/i.test(value)) {
    return value;
  }

  return value.charAt(0).toUpperCase() + value.slice(1);
}

function getConsultantIdealFor(consultant: ConsultantProfile) {
  return consultant.idealFor?.length ? consultant.idealFor : consultant.tags;
}

function getConsultationTopics(consultant: ConsultantProfile) {
  return consultant.consultationTopics?.length
    ? consultant.consultationTopics
    : consultant.specializations;
}

function getConsultantWorkApproach(consultant: ConsultantProfile) {
  return (
    consultant.workApproach ||
    "Работата е подредена около профила, целта на консултацията и конкретните следващи стъпки."
  );
}

function getSessionLengthLabel(consultant: ConsultantProfile) {
  return `${consultant.sessionLengthMinutes || 60} минути`;
}

function getProfileSignalTokens(profile: UserProfile) {
  return Array.from(
    new Set(
      tokenizeText(
        [
          profile.occupation,
          profile.headline,
          profile.bio,
          profile.goals,
          ...(profile.interests || []),
          ...(profile.keywords || [])
        ]
          .filter(Boolean)
          .join(" ")
      )
    )
  );
}

function getConsultantSignalTokens(consultant: ConsultantProfile) {
  return new Set(
    tokenizeText(
      [
        consultant.headline,
        consultant.bio,
        ...consultant.specializations,
        ...consultant.tags,
        ...getConsultantIdealFor(consultant),
        ...getConsultationTopics(consultant)
      ].join(" ")
    )
  );
}

function getConsultantMatch(profile: UserProfile | null, consultant: ConsultantProfile) {
  if (!profile || profile.role !== "client") {
    return null;
  }

  const profileTokens = getProfileSignalTokens(profile);

  if (!profileTokens.length) {
    return null;
  }

  const consultantTokens = getConsultantSignalTokens(consultant);
  const overlaps = profileTokens.filter((token) => consultantTokens.has(token));
  const preferredModes = profile.preferredSessionModes || [];
  const modeMatch = preferredModes.some((mode) => consultant.sessionModes.includes(mode));
  const cityMatch =
    Boolean(profile.city) && consultant.city.toLowerCase() === String(profile.city).toLowerCase();

  const rawScore = overlaps.length * 18 + (modeMatch ? 10 : 0) + (cityMatch ? 6 : 0);
  const score = Math.min(98, Math.max(32, rawScore));

  if (!overlaps.length && !modeMatch && !cityMatch) {
    return null;
  }

  const reasons = overlaps.slice(0, 2).map(formatSignalLabel);

  if (modeMatch) {
    reasons.push("предпочитан формат");
  }

  const label = score >= 72 ? "Силно съвпадение" : "Добро съвпадение";
  const note = reasons.length
    ? `Подходящ по ${reasons.join(", ")}.`
    : "Подходящ спрямо профила и предпочитанията ти.";

  return {
    score,
    label,
    note
  } satisfies MatchInsight;
}

function getProfessionalMatch(
  consultant: ConsultantProfile | null,
  profile: UserProfile | null
) {
  if (!consultant || !profile || profile.role !== "client") {
    return null;
  }

  const consultantTokens = getConsultantSignalTokens(consultant);
  const profileTokens = getProfileSignalTokens(profile);

  if (!profileTokens.length) {
    return null;
  }

  const overlaps = profileTokens.filter((token) => consultantTokens.has(token));
  const modeMatch = (profile.preferredSessionModes || []).some((mode) =>
    consultant.sessionModes.includes(mode)
  );
  const cityMatch =
    Boolean(profile.city) &&
    consultant.city.toLowerCase() === String(profile.city).toLowerCase() &&
    consultant.sessionModes.includes("В офис");

  if (!overlaps.length && !modeMatch && !cityMatch) {
    return null;
  }

  const rawScore = overlaps.length * 18 + (modeMatch ? 10 : 0) + (cityMatch ? 6 : 0);
  const score = Math.min(98, Math.max(32, rawScore));
  const reasons = overlaps.slice(0, 2).map(formatSignalLabel);

  if (modeMatch) {
    reasons.push("предпочитан формат");
  }

  if (cityMatch) {
    reasons.push("среща на място");
  }

  return {
    score,
    label: score >= 72 ? "Силен профилен интерес" : "Подходящ профил",
    note: reasons.length
      ? `Профилът търси подкрепа по ${reasons.join(", ")}.`
      : "Профилът е близък до темите и начина ти на работа."
  } satisfies MatchInsight;
}

function brandMark() {
  return (
    <span className="brand-mark" aria-hidden="true">
      <span className="brand-mark__vertical" />
      <span className="brand-mark__horizontal" />
    </span>
  );
}

function RouteExperience() {
  const location = useLocation();

  useEffect(() => {
    const pathname = location.pathname;
    const title =
      pathname === "/"
        ? "Начало"
        : pathname === "/users"
          ? "За потребители"
          : pathname === "/consultants"
            ? "За консултанти"
            : pathname.startsWith("/consultants/")
              ? "Профил на консултант"
              : pathname === "/auth"
                ? "Вход и регистрация"
                : pathname === "/account"
                  ? "Профил и членство"
                  : pathname === "/dashboard"
                    ? "Моето табло"
                    : pathname === "/about"
                      ? "За нас"
                      : pathname === "/contact"
                        ? "Контакти"
                        : pathname === "/faq"
                          ? "Често задавани въпроси"
                          : pathname === "/legal"
                            ? "Правна информация"
                            : "CareerLane";

    document.title =
      title === config.appName ? config.appName : `${title} | ${config.appName}`;
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [location.pathname]);

  return null;
}

function useViewerProfile() {
  const { user, token, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!user || !token) {
      const previewAccount = readMockPreviewAccount();
      setProfile(previewAccount ? buildPreviewUserProfile(previewAccount) : null);
      setLoading(false);
      return;
    }

    let mounted = true;
    setLoading(true);

    api
      .getMyProfile(token)
      .then((value) => {
        if (mounted) {
          setProfile(value);
        }
      })
      .catch(() => {
        if (mounted) {
          setProfile(null);
        }
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [authLoading, token, user]);

  useEffect(() => {
    return subscribeMockPreviewAccount(() => {
      if (!user || !token) {
        const previewAccount = readMockPreviewAccount();
        setProfile(previewAccount ? buildPreviewUserProfile(previewAccount) : null);
        setLoading(false);
      }
    });
  }, [token, user]);

  return {
    loading,
    profile,
    plan: profile?.plan || ("free" as PlanTier),
    role: profile?.role || ("client" as UserRole)
  };
}

function useMockPreviewSnapshot() {
  const location = useLocation();
  const [previewAccount, setPreviewAccount] = useState<MockPreviewAccount | null>(null);

  useEffect(() => {
    setPreviewAccount(readMockPreviewAccount());
  }, [location.pathname]);

  useEffect(() => {
    return subscribeMockPreviewAccount(() => {
      setPreviewAccount(readMockPreviewAccount());
    });
  }, []);

  return previewAccount;
}

function AppShell() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const currentYear = new Date().getFullYear();
  const previewAccount = useMockPreviewSnapshot();

  function handlePreviewLogout() {
    clearMockPreviewAccount();
    navigate("/", { replace: true });
  }

  return (
    <div className="site-shell">
      <RouteExperience />
      <header className="site-header">
        <div className="container site-header__inner">
          <Link className="brand-link" to="/">
            {brandMark()}
            <div>
              <strong>{config.appName}</strong>
              <span>Професионална мрежа за кариерно позициониране</span>
            </div>
          </Link>

          <nav className="site-nav">
            <NavLink to="/">Начало</NavLink>
            <NavLink to="/users">За потребители</NavLink>
            <NavLink to="/consultants">За консултанти</NavLink>
          </nav>

          <div className="site-header__actions">
            {user ? (
              <>
                <span className="user-chip">{user.name}</span>
                <Link className="ghost-button" to="/dashboard">
                  Профил
                </Link>
                <button className="ghost-button" onClick={() => logout()}>
                  Изход
                </button>
              </>
            ) : previewAccount ? (
              <>
                <span className="user-chip">{previewAccount.name}</span>
                <Link className="ghost-button" to="/account">
                  Профил
                </Link>
                <button
                  className="ghost-button"
                  type="button"
                  onClick={handlePreviewLogout}
                >
                  Изход
                </button>
              </>
            ) : (
              <Link className="ghost-button" to="/auth">
                Вход / Регистрация
              </Link>
            )}
          </div>
        </div>
      </header>

      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/consultants" element={<ConsultantsPage />} />
          <Route path="/consultants/:slug" element={<ConsultantPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/faq" element={<FaqPage />} />
          <Route path="/legal" element={<LegalPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="/preview-account" element={<Navigate to="/auth?tab=register" replace />} />
          <Route path="/preview-dashboard" element={<Navigate to="/account" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/pricing" element={<Navigate to="/users" replace />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>

      <footer className="site-footer">
        <div className="container footer-grid">
          <div className="footer-brand">
            <h3>{config.appName}</h3>
            <p>
              Професионална платформа за консултации, позициониране и по-ясна следваща
              стъпка в кариерата.
            </p>
            <p className="footer-note">
              Създадена за по-ясен избор на консултант, по-добро професионално
              присъствие и по-подреден работен процес.
            </p>
          </div>
          <div className="footer-column">
            <h4>Платформа</h4>
            <ul className="footer-links">
              <li>
                <Link to="/users">За потребители</Link>
              </li>
              <li>
                <Link to="/consultants">За консултанти</Link>
              </li>
              <li>
                <Link to="/auth">Вход и регистрация</Link>
              </li>
              <li>
                <Link to="/dashboard">Моето табло</Link>
              </li>
            </ul>
          </div>
          <div className="footer-column">
            <h4>Компания</h4>
            <ul className="footer-links">
              <li>
                <Link to="/about">За нас</Link>
              </li>
              <li>
                <Link to="/faq">FAQ</Link>
              </li>
              <li>
                <Link to="/contact">Contact us</Link>
              </li>
            </ul>
          </div>
          <div className="footer-column">
            <h4>Правна информация</h4>
            <ul className="footer-links">
              <li>
                <Link to="/legal">Условия и поверителност</Link>
              </li>
              <li>
                <Link to="/legal">Cookies и комуникации</Link>
              </li>
              <li>
                <Link to="/contact">Правни запитвания</Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="container footer-bottom">
          <span>{currentYear} {config.appName}. Всички права запазени.</span>
          <div className="footer-bottom__links">
            <Link to="/about">За нас</Link>
            <Link to="/faq">FAQ</Link>
            <Link to="/legal">Legal</Link>
            <Link to="/contact">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function QuestionBlock({
  step,
  title,
  hint,
  wide = false,
  children
}: {
  step: string;
  title: string;
  hint: string;
  wide?: boolean;
  children: ReactNode;
}) {
  return (
    <article className={`question-card ${wide ? "question-card--wide" : ""}`}>
      <div className="question-card__header">
        <span className="question-card__step">{step}</span>
        <div>
          <h3>{title}</h3>
          <p>{hint}</p>
        </div>
      </div>
      <div className="question-card__body">{children}</div>
    </article>
  );
}

function QuestionFlowIntro({
  eyebrow,
  title,
  description,
  completion
}: {
  eyebrow: string;
  title: string;
  description: string;
  completion: number;
}) {
  return (
    <div className="question-flow__intro">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2>{title}</h2>
        <p className="section-caption">{description}</p>
      </div>
      <div className="question-flow__meter">
        <span>Завършеност</span>
        <strong>{completion}%</strong>
      </div>
    </div>
  );
}

function SuggestionPills({
  label,
  fieldName,
  options,
  mode = "append-list"
}: {
  label: string;
  fieldName: string;
  options: QuestionSuggestionOption[];
  mode?: SuggestedFillMode;
}) {
  return (
    <div className="answer-suggestions">
      <span className="answer-suggestions__label">{label}</span>
      <div className="answer-suggestions__grid">
        {options.map((option) => {
          const item = typeof option === "string" ? { label: option, value: option } : option;

          return (
            <button
              className="suggestion-pill"
              key={`${fieldName}-${item.label}`}
              type="button"
              onClick={(event) =>
                applySuggestedFieldValue(event.currentTarget.form, fieldName, item.value, mode)
              }
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function HomePage() {
  const [query, setQuery] = useState("");
  const [topDirectoryType, setTopDirectoryType] = useState<"all" | ConsultantProfileType>("all");
  const navigate = useNavigate();
  const featured = useMemo(
    () =>
      demoConsultants
        .filter((item) => item.featured)
        .filter(
          (item) =>
            topDirectoryType === "all" ||
            getConsultantProfileType(item) === topDirectoryType
        )
        .slice(0, 4),
    [topDirectoryType]
  );
  const spotlight =
    featured[0] ||
    demoConsultants.find((item) => item.featured) ||
    demoConsultants[0];

  return (
    <>
      <section className="hero">
        <div className="container hero__grid">
          <div className="hero__copy">
            <p className="eyebrow">Професионална кариерна мрежа</p>
            <h1>По-представителна кариера, по-ясен избор на консултант и по-силен следващ ход.</h1>
            <p className="hero__lede">
              CareerLane свързва професионалисти с проверени консултанти в среда,
              създадена за доверие, добра презентация и ясно разграничение между роли,
              профили и работен достъп.
            </p>

            <form
              className="search-card"
              onSubmit={(event) => {
                event.preventDefault();
                navigate(`/users?q=${encodeURIComponent(query)}`);
              }}
            >
              <label>
                Какво търсиш?
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="LinkedIn профил, интервю, кариерна промяна, executive CV..."
                />
              </label>
              <button className="primary-button" type="submit">
                Намери консултант
              </button>
            </form>

            <div className="search-shortcuts">
              <span className="search-shortcuts__label">Популярни теми</span>
              <div className="search-shortcuts__list">
                {popularSearchTopics.map((topic) => (
                  <button
                    className="shortcut-chip"
                    key={topic.label}
                    type="button"
                    onClick={() => {
                      setQuery(topic.value);
                      navigate(`/users?q=${encodeURIComponent(topic.value)}`);
                    }}
                  >
                    {topic.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="hero-actions">
              <Link className="primary-button" to="/users">
                За потребители
              </Link>
              <Link className="ghost-button" to="/consultants">
                За консултанти
              </Link>
            </div>

            <div className="hero-stats">
              <div>
                <strong>{demoConsultants.length} активни профила</strong>
                <span>консултанти и ментори с публично присъствие</span>
              </div>
              <div>
                <strong>Потребителите са free</strong>
                <span>консултантите и менторите могат да стартират с безплатен публичен профил</span>
              </div>
              <div>
                <strong>Рекламна зона</strong>
                <span>за работодатели, академии и кариерни програми</span>
              </div>
            </div>
          </div>

          <aside className="hero__card">
            <div className="hero__visual">
              <img src={resolvePublicUrl(spotlight.heroUrl)} alt={spotlight.name} />
            </div>
            <div className="hero__card-top">
              <span className="status-badge status-badge--success">
                Подбран {formatConsultantTypeLabel(getConsultantProfileType(spotlight)).toLowerCase()}
              </span>
              <strong>{spotlight.name}</strong>
              <p>{spotlight.headline}</p>
            </div>
            <div className="hero__consultant">
              <img src={resolvePublicUrl(spotlight.avatarUrl)} alt={spotlight.name} />
              <div>
                <strong>{spotlight.city}</strong>
                <p>{spotlight.specializations.slice(0, 2).join(" · ")}</p>
                <span>
                  {spotlight.rating} рейтинг · {spotlight.reviewCount} мнения
                </span>
              </div>
            </div>
            <div className="hero__points">
              <div>
                <span>Следващ свободен слот</span>
                <strong>{formatDate(spotlight.nextAvailable)}</strong>
              </div>
              <div>
                <span>Работен формат</span>
                <strong>{spotlight.sessionModes.join(" · ")}</strong>
              </div>
            </div>
            <Link className="primary-button" to={`/consultants/${spotlight.slug}`}>
              Прегледай профила
            </Link>
          </aside>
        </div>
      </section>

      <section className="section section--alt">
        <div className="container journey-grid audience-grid">
          {homeJourney.map((item) => (
            <article className="journey-card" key={item.step}>
              <span className="journey-card__step">{item.step}</span>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
              <Link className="ghost-button" to={item.ctaTo}>
                {item.ctaLabel}
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="section section--tight" id="advertise">
        <div className="container">
          <aside className="ad-banner">
            <div>
              <span className="ad-banner__label">Реклама</span>
              <h2>Позиция за работодатели, академии и силни кариерни програми.</h2>
              <p>
                Рекламната зона е разположена в контекст с високо намерение за действие:
                хора, които активно търсят кариерно решение или консултант.
              </p>
            </div>
            <div className="ad-banner__actions">
              <span>Спонсорирана рекламна позиция</span>
              <Link className="ghost-button" to="/auth?tab=register">
                Заяви рекламно място
              </Link>
            </div>
          </aside>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Топ профили</p>
              <h2>Топ консултанти и ментори, които могат да се отличават на началната страница.</h2>
              <p className="section-heading__copy">
                Това е зоната за водещите активни профили. Можеш да превключваш между
                консултанти и ментори и да показваш най-силното публично присъствие.
              </p>
            </div>
            <div className="search-shortcuts__list">
              <button
                className={`shortcut-chip ${topDirectoryType === "all" ? "shortcut-chip--active" : ""}`}
                type="button"
                onClick={() => setTopDirectoryType("all")}
              >
                Всички
              </button>
              <button
                className={`shortcut-chip ${topDirectoryType === "consultant" ? "shortcut-chip--active" : ""}`}
                type="button"
                onClick={() => setTopDirectoryType("consultant")}
              >
                Консултанти
              </button>
              <button
                className={`shortcut-chip ${topDirectoryType === "mentor" ? "shortcut-chip--active" : ""}`}
                type="button"
                onClick={() => setTopDirectoryType("mentor")}
              >
                Ментори
              </button>
              <Link className="ghost-button" to="/users">
                Виж профилите
              </Link>
            </div>
          </div>

          <div className="consultant-grid">
            {featured.map((consultant) => (
              <ConsultantCard key={consultant.consultantId} consultant={consultant} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

function UsersPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const city = searchParams.get("city") || "";
  const kind = searchParams.get("kind") || "all";
  const topOnly = searchParams.get("top") === "1";
  const { user } = useAuth();
  const { profile, loading: viewerLoading } = useViewerProfile();
  const [consultants, setConsultants] = useState<ConsultantProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    api
      .listConsultants({ query, city })
      .then((items) => {
        if (mounted) {
          setConsultants(items);
          setError("");
        }
      })
      .catch((value) => {
        if (mounted) {
          setError(value instanceof Error ? value.message : "Неуспешно зареждане.");
        }
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [city, query]);

  const rankedConsultants = useMemo(() => {
    return consultants
      .filter((consultant) => {
        const matchesType =
          kind === "all" ||
          getConsultantProfileType(consultant) === kind;
        const matchesTop = !topOnly || consultant.featured;
        return matchesType && matchesTop;
      })
      .map((consultant) => ({
        consultant,
        match: getConsultantMatch(profile, consultant)
      }))
      .sort((left, right) => {
        const leftScore = left.match?.score || 0;
        const rightScore = right.match?.score || 0;

        if (rightScore !== leftScore) {
          return rightScore - leftScore;
        }

        if (left.consultant.featured !== right.consultant.featured) {
          return left.consultant.featured ? -1 : 1;
        }

        return right.consultant.rating - left.consultant.rating;
      });
  }, [consultants, kind, profile, topOnly]);
  const visibleConsultants = rankedConsultants;
  const hiddenCount = Math.max(rankedConsultants.length - visibleConsultants.length, 0);
  const hasActiveFilters = Boolean(query || city || kind !== "all" || topOnly);
  const topMatch = rankedConsultants.find((item) => item.match)?.consultant || null;
  const topMatchDetails = topMatch ? getConsultantMatch(profile, topMatch) : null;
  const profileCtaTo = user ? "/dashboard" : profile ? "/account" : "/auth?tab=register";
  const isConsultantViewer = profile?.role === "consultant";
  const profileSignals = [
    profile?.occupation,
    ...(profile?.interests || []).slice(0, 2),
    ...(profile?.keywords || []).slice(0, 2)
  ].filter(Boolean) as string[];

  function applyPresetQuery(nextQuery: string) {
    setSearchParams(
      nextQuery || city || kind !== "all" || topOnly
        ? {
            q: nextQuery,
            city,
            ...(kind !== "all" ? { kind } : {}),
            ...(topOnly ? { top: "1" } : {})
          }
        : {}
    );
  }

  function applyDirectoryFilters(nextFilters: {
    query?: string;
    city?: string;
    kind?: string;
    topOnly?: boolean;
  }) {
    const nextQuery = nextFilters.query ?? query;
    const nextCity = nextFilters.city ?? city;
    const nextKind = nextFilters.kind ?? kind;
    const nextTopOnly = nextFilters.topOnly ?? topOnly;

    setSearchParams(
      nextQuery || nextCity || nextKind !== "all" || nextTopOnly
        ? {
            ...(nextQuery ? { q: nextQuery } : {}),
            ...(nextCity ? { city: nextCity } : {}),
            ...(nextKind !== "all" ? { kind: nextKind } : {}),
            ...(nextTopOnly ? { top: "1" } : {})
          }
        : {}
    );
  }

  return (
    <>
      <section className="hero">
        <div className="container hero__grid">
          <div className="hero__copy">
            <p className="eyebrow">За потребители</p>
            <h1>Намираш правилния кариерен консултант с повече контекст и по-ясно съвпадение.</h1>
            <p className="hero__lede">
              {isConsultantViewer
                ? "Това е потребителският изглед на CareerLane. Тук хората търсят консултант, а твоите съвпадения с професионалисти се подреждат в профила и таблото ти."
                : "Тази страница е за хората, които търсят консултант. Попълненият профил помага на CareerLane да подреди по-подходящите експерти според опита, целите и предпочитанията ти."}
            </p>

            <div className="hero-stats">
              <div>
                <strong>
                  {isConsultantViewer ? "Потребителски изглед" : "Отворен каталог"}
                </strong>
                <span>
                  {isConsultantViewer
                    ? "така виждат списъка хората, които търсят консултант"
                    : "до активните консултанти и ментори"}
                </span>
              </div>
              <div>
                <strong>{isConsultantViewer ? "Твоите съвпадения" : "Профил на потребителя"}</strong>
                <span>
                  {isConsultantViewer
                    ? "се подреждат в профила и таблото ти"
                    : "име, имейл, occupation и още разширяеми данни"}
                </span>
              </div>
              <div>
                <strong>{profile ? formatRoleLabel(profile.role) : "Гост достъп"}</strong>
                <span>{profile ? `Роля: ${formatRoleLabel(profile.role)}` : "влез за персонален достъп"}</span>
              </div>
            </div>
          </div>

          <aside className="hero__card">
            <div className="hero__card-top">
              <span className={topMatchDetails ? "status-badge status-badge--success" : "plan-pill"}>
                {topMatchDetails
                  ? topMatchDetails.label
                  : isConsultantViewer
                    ? "Потребителски изглед"
                    : "Активни профили"}
              </span>
              <strong>
                {topMatch && !isConsultantViewer
                  ? `${topMatch.name} е сред най-подходящите избори за профила ти`
                  : isConsultantViewer
                    ? "Тук виждаш как CareerLane представя консултантите пред търсещите потребители"
                    : "Виждаш всички активни консултанти и ментори"}
              </strong>
              <p>
                {topMatch && topMatchDetails && !isConsultantViewer
                  ? `${topMatchDetails.note} Профилът ти помага на CareerLane да подреди по-подходящите експерти по-напред.`
                  : isConsultantViewer
                    ? "Като консултант няма да бъдеш съпоставян с други консултанти. Подходящите професионалисти се показват в твоето табло и профил."
                    : "Попълненият профил помага на CareerLane да подрежда по-точно консултантите и менторите според целите ти."}
              </p>
            </div>
            <div className="hero__points">
              <div>
                <span>Показани профили</span>
                <strong>{visibleConsultants.length}</strong>
              </div>
              <div>
                <span>
                  {topMatchDetails
                    ? "Съвпадение"
                    : isConsultantViewer
                      ? "Твоите съвпадения"
                      : "Допълнителни профили"}
                </span>
                <strong>
                  {topMatchDetails
                    ? `${topMatchDetails.score}%`
                    : isConsultantViewer
                      ? "В таблото"
                      : hiddenCount > 0
                      ? `+${hiddenCount}`
                      : "Пълен списък"}
                </strong>
              </div>
            </div>
            {profileSignals.length ? (
              <div className="chip-row">
                {profileSignals.map((item) => (
                  <span className="chip chip--soft" key={item}>
                    {item}
                  </span>
                ))}
              </div>
            ) : null}
            <Link className="primary-button" to={profileCtaTo}>
              {isConsultantViewer
                ? user
                  ? "Отвори таблото си"
                  : "Отвори профила си"
                : profile
                  ? "Допълни профила си"
                  : "Създай профил"}
            </Link>
          </aside>
        </div>
      </section>

      <PlanSection
        eyebrow="Планове за потребители"
        title="Потребителският достъп е свободен, а фокусът е върху профила и точния избор на консултант или ментор."
        description="Потребителите не плащат членство на този етап. Профилът служи за по-добро подреждане, заявки и по-ясно съвпадение."
        plans={userPlans}
      />

      <section className="section section--alt">
        <div className="container journey-grid">
          {userJourney.map((item) => (
            <article className="journey-card" key={item.step}>
              <span className="journey-card__step">{item.step}</span>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Достъп до консултанти и ментори</p>
              <h2>Филтрирай, сравнявай и намирай най-подходящите активни профили.</h2>
              <p className="section-heading__copy">
                Списъкът е подреден така, че да се ориентираш бързо. Ако имаш попълнен
                профил, CareerLane подрежда по-напред консултантите с най-близко съвпадение.
              </p>
            </div>
          </div>

          <div className="filter-bar">
            <label>
              Ключова дума
              <input
                value={query}
                onChange={(event) =>
                  applyPresetQuery(event.target.value)
                }
                placeholder="Executive CV, интервю, leadership, кариерна промяна..."
              />
            </label>
            <label>
              Град
              <input
                value={city}
                onChange={(event) =>
                  applyDirectoryFilters({ city: event.target.value })
                }
                placeholder="София, Берлин, Лондон, Виена"
              />
            </label>
          </div>

          <div className="search-shortcuts directory-switches">
            <span className="search-shortcuts__label">Тип профил</span>
            <div className="search-shortcuts__list">
              {(
                [
                  { value: "all", label: "Всички" },
                  { value: "consultant", label: "Консултанти" },
                  { value: "mentor", label: "Ментори" }
                ] as const
              ).map((option) => (
                <button
                  className={`shortcut-chip ${kind === option.value ? "shortcut-chip--active" : ""}`}
                  key={option.value}
                  type="button"
                  onClick={() => applyDirectoryFilters({ kind: option.value })}
                >
                  {option.label}
                </button>
              ))}
              <button
                className={`shortcut-chip ${topOnly ? "shortcut-chip--active" : ""}`}
                type="button"
                onClick={() => applyDirectoryFilters({ topOnly: !topOnly })}
              >
                Само top профили
              </button>
            </div>
          </div>

          <div className="directory-presets">
            <span className="search-shortcuts__label">Бързи филтри</span>
            <div className="search-shortcuts__list">
              {popularSearchTopics.map((topic) => (
                <button
                  className={`shortcut-chip ${query === topic.value ? "shortcut-chip--active" : ""}`}
                  key={topic.label}
                  type="button"
                  onClick={() => applyPresetQuery(topic.value)}
                >
                  {topic.label}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-actions">
            <button
              className="ghost-button"
              type="button"
              onClick={() => applyDirectoryFilters({ query: "", city: "", kind: "all", topOnly: false })}
              disabled={!hasActiveFilters}
            >
              Изчисти филтрите
            </button>
            <Link className="ghost-button" to={profileCtaTo}>
              {isConsultantViewer
                ? user
                  ? "Към таблото"
                  : "Отвори профила си"
                : profile
                  ? "Отвори профила си"
                  : "Влез за персонален достъп"}
            </Link>
          </div>

          {isConsultantViewer ? (
            <div className="panel panel--subtle role-guard-panel">
              <strong>Това е страница за потребители.</strong>
              <p>
                CareerLane съпоставя потребителите с консултанти, а консултантите с
                професионалисти. Твоите подходящи профили са в профила и таблото ти.
              </p>
              <Link className="ghost-button" to={profileCtaTo}>
                {user ? "Отвори таблото си" : "Към профила"}
              </Link>
            </div>
          ) : null}

          {viewerLoading ? <div className="panel">Проверяваме достъпа на акаунта...</div> : null}
          {loading ? <div className="panel">Зареждаме консултантите...</div> : null}
          {error ? <div className="panel panel--error">{error}</div> : null}

          {!loading && !error && visibleConsultants.length === 0 ? (
            <div className="panel">Няма съвпадения за избраните филтри.</div>
          ) : null}

          <div className="consultant-grid">
            {visibleConsultants.map(({ consultant, match }) => (
              <ConsultantCard
                key={consultant.consultantId}
                consultant={consultant}
                match={match}
              />
            ))}
          </div>

        </div>
      </section>
    </>
  );
}

function ConsultantsPage() {
  const showcase = demoConsultants.slice(0, 6);
  const spotlightProfiles = demoConsultants.slice(0, 2);

  return (
    <>
      <section className="hero consultants-hero">
        <div className="container hero__grid consultants-hero__grid">
          <div className="hero__copy">
            <p className="eyebrow">За консултанти и ментори</p>
            <h1>Профил, който изглежда сериозно, стартира безплатно и може да се споделя уверено.</h1>
            <p className="hero__lede">
              Страницата за консултанти и ментори е отделена ясно от потребителската
              част. Тук акцентът е върху публичния профил, свободните часове,
              споделянето и начина, по който хората вземат решение да резервират среща.
            </p>

            <div className="hero-actions">
              <Link className="primary-button" to="/auth?tab=register">
                Създай профил
              </Link>
              <Link className="ghost-button" to="/users">
                Виж потребителската перспектива
              </Link>
            </div>

            <div className="hero-stats">
              <div>
                <strong>Публичен профил</strong>
                <span>ясен фокус, град, езици и специализации</span>
              </div>
              <div>
                <strong>Безплатен старт</strong>
                <span>профилът може да бъде създаден и публикуван още от началото</span>
              </div>
              <div>
                <strong>Професионална визия</strong>
                <span>по-ясен профил, по-силно доверие и по-лесно споделяне</span>
              </div>
            </div>
          </div>

          <aside className="hero__card consultant-intro-card">
            <div className="hero__card-top">
              <span className="status-badge status-badge--success">Активен профил</span>
              <strong>Какво получаваш още от старт</strong>
              <p>
                Отделна страница за консултанти и ментори, ясна структура за профила и
                възможност за споделяне, свободни слотове и по-добро професионално присъствие.
              </p>
            </div>
            <div className="consultant-intro-card__list">
              <article>
                <strong>Профил</strong>
                <span>Кратък фокус, град, езици, формати и експертиза в ясен ред.</span>
              </article>
              <article>
                <strong>Видимост</strong>
                <span>Публичен профил, който изглежда професионално и на телефон, и на десктоп.</span>
              </article>
              <article>
                <strong>Резервации</strong>
                <span>Свободните часове, темите и share линкът са събрани на едно ясно място.</span>
              </article>
            </div>
            <div className="hero__points">
              <div>
                <span>Публичен профил</span>
                <strong>Да</strong>
              </div>
              <div>
                <span>Споделяне</span>
                <strong>Готово</strong>
              </div>
            </div>
            <div className="chip-row">
              <span className="chip">Лидерски роли</span>
              <span className="chip">Интервю подготовка</span>
              <span className="chip">Кариерни преходи</span>
            </div>
          </aside>
        </div>
      </section>

      <section className="section section--tight">
        <div className="container consultant-proof-grid">
          {spotlightProfiles.map((consultant) => (
            <article className="consultant-proof-card" key={consultant.consultantId}>
              <img src={resolvePublicUrl(consultant.heroUrl)} alt={consultant.name} />
              <div className="consultant-proof-card__body">
                <span className={consultant.featured ? "status-badge" : "plan-pill"}>
                  {consultant.featured ? "Подбран профил" : "Активен профил"}
                </span>
                <h3>{consultant.name}</h3>
                <p>{consultant.headline}</p>
                <div className="consultant-card__meta">
                  <span>{consultant.city}</span>
                  <span>{consultant.experienceYears} години опит</span>
                  <span>{consultant.sessionModes.join(" · ")}</span>
                </div>
              </div>
            </article>
          ))}
          <aside className="panel consultant-proof-panel">
            <p className="eyebrow">Как изглежда добрият списък</p>
            <h2>Подредени профили, видими детайли и ясен публичен модел.</h2>
            <p>
              Консултантската секция трябва да е лесна за преглеждане във всеки браузър:
              подредена решетка, ясни акценти и без визуален шум.
            </p>
            <ul className="page-list">
              <li>Разпознаваем headline още в първия екран</li>
              <li>Специализации и град без пренатрупване</li>
              <li>Ясни теми, формати, публичен статус и share възможност</li>
            </ul>
          </aside>
        </div>
      </section>

      <PlanSection
        eyebrow="Планове за консултанти и ментори"
        title="Безплатен публичен старт с подготвени tiers за бъдещо разширение."
        description="Текущият production launch позволява безплатен публичен профил за консултанти и ментори. Допълнителните tiers остават част от продуктовата посока и не са обвързани с платени активации в момента."
        plans={consultantPlans}
      />

      <section className="section section--alt">
        <div className="container journey-grid consultant-journey-grid">
          <article className="journey-card">
            <span className="journey-card__step">01</span>
            <h3>Създаваш профил</h3>
            <p>Подреждаш специализация, град, езици, формати и ключова професионална история.</p>
          </article>
          <article className="journey-card">
            <span className="journey-card__step">02</span>
            <h3>Получаваш видимост</h3>
            <p>Потребителите разглеждат профила ти в отделния списък за търсещи кариерен консултант.</p>
          </article>
          <article className="journey-card">
            <span className="journey-card__step">03</span>
            <h3>Подреждаш практиката си</h3>
            <p>Добавяш теми, работен подход и наличност така, че хората да разбират лесно как протича работата с теб.</p>
          </article>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Мокъп на мрежата</p>
              <h2>Повече активни консултанти за реалистична CareerLane среда.</h2>
            </div>
          </div>

          <div className="consultant-grid">
            {showcase.map((consultant) => (
              <ConsultantCard key={consultant.consultantId} consultant={consultant} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

function AboutPage() {
  return (
    <>
      <section className="hero">
        <div className="container page-hero__grid">
          <div className="page-intro">
            <p className="eyebrow">За нас</p>
            <h1>CareerLane е създадена като професионална среда за по-ясни кариерни решения.</h1>
            <p className="hero__lede">
              Платформата свързва професионалисти, консултанти и партньори в по-подреден
              и представителен онлайн формат. Целта ни е хората да намират правилната
              подкрепа по-лесно и да работят от едно ясно място.
            </p>

            <div className="hero-stats">
              {aboutHighlights.map((item) => (
                <div key={item.label}>
                  <strong>{item.value}</strong>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          <aside className="panel page-side-card">
            <p className="eyebrow">Какво стои зад продукта</p>
            <h2>Професионална структура, а не шумен списък.</h2>
            <p>
              В основата на CareerLane са ясно разграничени роли, добра навигация и
              подредено представяне на профили, документи и следващи действия.
            </p>
            <div className="chip-row">
              <span className="chip">Trust-first UX</span>
              <span className="chip">Free / Разширен модел</span>
              <span className="chip">Професионално присъствие</span>
            </div>
          </aside>
        </div>
      </section>

      <section className="section">
        <div className="container info-grid">
          {aboutPrinciples.map((item) => (
            <article className="info-card" key={item.title}>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section section--alt">
        <div className="container public-layout">
          <div className="panel-stack">
            <article className="panel">
              <p className="eyebrow">Кого обслужваме</p>
              <h2>Една платформа, няколко ясно разграничени аудитории.</h2>
              <div className="info-grid">
                <article className="info-card">
                  <h3>Професионалисти</h3>
                  <p>За хора, които търсят по-силен профил, по-ясен разказ и правилен консултант.</p>
                </article>
                <article className="info-card">
                  <h3>Консултанти</h3>
                  <p>За специалисти, които искат по-представителен публичен профил и по-добра видимост.</p>
                </article>
                <article className="info-card">
                  <h3>Партньори</h3>
                  <p>За работодателски брандове, академии и програми, които искат релевантно рекламно присъствие.</p>
                </article>
              </div>
            </article>
          </div>

          <aside className="panel page-side-card">
            <p className="eyebrow">Оперативен стандарт</p>
            <h2>Сайтът е подготвен като пълна публична витрина.</h2>
            <p>
              Заедно с основните продуктови страници вече има отделни страници за компания,
              контакт, FAQ и правна информация, така че публичното присъствие да изглежда
              завършено и надеждно.
            </p>
            <Link className="ghost-button" to="/legal">
              Виж правната информация
            </Link>
          </aside>
        </div>
      </section>
    </>
  );
}

function ContactPage() {
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    topic: "support",
    details: ""
  });

  function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const recipient =
      form.topic === "partnerships"
        ? "partners@careerlane.eu"
        : form.topic === "legal"
          ? "legal@careerlane.eu"
          : "support@careerlane.eu";
    const subject = `[CareerLane] ${
      form.topic === "partnerships"
        ? "Партньорско запитване"
        : form.topic === "legal"
          ? "Правно запитване"
          : "Обща поддръжка"
    }`;
    const body = `Име: ${form.name}\nИмейл: ${form.email}\nТема: ${form.topic}\n\nСъобщение:\n${form.details}`;

    setMessage("Отваряме имейл клиента ти с подготвено съобщение.");

    if (typeof window !== "undefined") {
      window.location.href = `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    }
  }

  return (
    <>
      <section className="hero">
        <div className="container page-hero__grid">
          <div className="page-intro">
            <p className="eyebrow">Contact us</p>
            <h1>Ясни канали за поддръжка, партньорства и правни въпроси.</h1>
            <p className="hero__lede">
              Контактната страница е оформена така, както би изглеждала на реален
              production сайт: с отделни направления, ясни очаквания и директен начин за
              започване на разговор.
            </p>
          </div>

          <aside className="panel page-side-card">
            <p className="eyebrow">Работен стандарт</p>
            <h2>Бърза ориентация по тип запитване.</h2>
            <p>
              Общите въпроси, партньорствата и правните запитвания са разделени в различни
              канали, за да се насочват по-точно и по-лесно.
            </p>
            <div className="hero__points">
              <div>
                <span>Отговор</span>
                <strong>до 1 работен ден</strong>
              </div>
              <div>
                <span>Формат</span>
                <strong>имейл или форма</strong>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <section className="section">
        <div className="container contact-grid">
          {contactChannels.map((channel) => (
            <article className="info-card" key={channel.email}>
              <p className="eyebrow">Контактен канал</p>
              <h3>{channel.title}</h3>
              <p>{channel.description}</p>
              <a className="ghost-button" href={`mailto:${channel.email}`}>
                {channel.email}
              </a>
            </article>
          ))}
        </div>
      </section>

      <section className="section section--alt">
        <div className="container public-layout">
          <form className="panel form-stack" onSubmit={handleSubmit}>
            <p className="eyebrow">Форма за контакт</p>
            <h2>Изпрати запитване</h2>
            <p className="section-caption">
              Формата подготвя имейл към правилния канал според избраната тема.
            </p>

            {message ? <div className="panel panel--success">{message}</div> : null}

            <div className="two-column">
              <label>
                Име
                <input
                  value={form.name}
                  onChange={(event) => setForm({ ...form, name: event.target.value })}
                  placeholder="Име и фамилия"
                  required
                />
              </label>
              <label>
                Имейл
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) => setForm({ ...form, email: event.target.value })}
                  placeholder="name@example.com"
                  required
                />
              </label>
            </div>

            <label>
              Тема
              <select
                value={form.topic}
                onChange={(event) => setForm({ ...form, topic: event.target.value })}
              >
                <option value="support">Обща поддръжка</option>
                <option value="partnerships">Партньорства и реклама</option>
                <option value="legal">Правни и данни</option>
              </select>
            </label>

            <label>
              Съобщение
              <textarea
                rows={6}
                value={form.details}
                onChange={(event) => setForm({ ...form, details: event.target.value })}
                placeholder="Опиши запитването си възможно най-ясно."
                required
              />
            </label>

            <button className="primary-button" type="submit">
              Подготви имейл
            </button>
          </form>

          <aside className="panel page-side-card">
            <p className="eyebrow">Насоки</p>
            <h2>Кога коя тема е правилният избор</h2>
            <ul className="page-list">
              <li>Използвай `Обща поддръжка` за акаунт, достъп, вход и потребителски въпроси.</li>
              <li>Използвай `Партньорства и реклама` за рекламната зона и employer branding формати.</li>
              <li>Използвай `Правни и данни` за privacy заявки, условия и административни въпроси.</li>
            </ul>
          </aside>
        </div>
      </section>
    </>
  );
}

function AccountPage() {
  const navigate = useNavigate();
  const [account, setAccount] = useState<MockPreviewAccount | null>(() => readMockPreviewAccount());
  const [message, setMessage] = useState("");
  const [billingForm, setBillingForm] = useState({
    billingCycle: (readMockPreviewAccount()?.billingCycle || "monthly") as MockBillingCycle,
    cardNumber: readMockPreviewAccount()?.paymentLast4
      ? `4242 4242 4242 ${readMockPreviewAccount()?.paymentLast4}`
      : "4242 4242 4242 4242"
  });

  if (!account) {
    return (
      <section className="section">
        <div className="container">
          <div className="panel empty-state empty-state--centered">
            <p className="eyebrow">Профил и членство</p>
            <h2>Все още няма създаден профил.</h2>
            <p>
              Създай профил от регистрацията, за да видиш как изглеждат профилът,
              членството и достъпът до кариерни консултанти в CareerLane.
            </p>
            <Link className="primary-button" to="/auth?tab=register">
              Създай профил
            </Link>
          </div>
        </div>
      </section>
    );
  }

  function persist(nextAccount: MockPreviewAccount, nextMessage: string) {
    writeMockPreviewAccount(nextAccount);
    setAccount(nextAccount);
    setBillingForm((current) => ({
      ...current,
      billingCycle: nextAccount.billingCycle,
      cardNumber: nextAccount.paymentLast4
        ? `4242 4242 4242 ${nextAccount.paymentLast4}`
        : current.cardNumber
    }));
    setMessage(nextMessage);
  }

  const previewProfile = buildPreviewUserProfile(account);
  const previewConsultant = buildPreviewConsultantProfile(account);
  const consultantProfileIsPublic = isPublicConsultantPreview(account);
  const previewCompletion = getProfileCompletion(previewProfile, previewConsultant);
  const featureList = getMockPlanFeatures(account.role, account.plan);
  const price =
    isPaidConsultantPlan(account.role, account.plan)
      ? getMockProPrice(account.role, account.billingCycle)
      : 0;
  const visibleProfiles = demoConsultants.length + (consultantProfileIsPublic ? 1 : 0);
  const documentLabel = getMockStorageLabel(account.plan);
  const mockDocuments =
    account.plan === "pro"
      ? ["CV-2026.pdf", "Leadership-diploma.pdf", "Portfolio.pdf", "Case-study.pdf"]
      : ["CV-2026.pdf"];
  const profileSignals = [
    account.occupation,
    ...(account.interests || []).slice(0, 2),
    ...(account.keywords || []).slice(0, 2)
  ].filter(Boolean) as string[];
  const matchedConsultants =
    account.role === "client"
      ? demoConsultants
          .map((consultant) => ({
            consultant,
            match: getConsultantMatch(previewProfile, consultant)
          }))
          .sort((left, right) => (right.match?.score || 0) - (left.match?.score || 0))
          .slice(0, 3)
      : [];
  const matchedProfessionals =
    account.role === "consultant" && previewConsultant
      ? demoProfessionalProfiles
          .map((profile) => ({
            profile,
            match: getProfessionalMatch(previewConsultant, profile)
          }))
          .filter((item) => item.match)
          .sort((left, right) => (right.match?.score || 0) - (left.match?.score || 0))
          .slice(0, 3)
      : [];

  function upgradeToPro() {
    navigate(`/auth?tab=register&plan=pro&role=${account.role}`);
  }

  function downgradeToFree() {
    persist(
      {
        ...account,
        plan: "free",
        subscriptionStatus: "inactive",
        paymentLast4: null,
        nextBillingAt: null
      },
      "Акаунтът беше върнат към Free."
    );
  }

  function toggleSubscriptionStatus() {
    const nextStatus: MockSubscriptionStatus =
      account.subscriptionStatus === "active" ? "cancelled" : "active";

    persist(
      {
        ...account,
        subscriptionStatus: nextStatus,
        nextBillingAt: nextStatus === "active" ? buildMockNextBillingDate(account.billingCycle) : null
      },
      nextStatus === "active"
        ? "Членството беше активирано отново."
        : "Членството беше спряно."
    );
  }

  function saveBillingPreview(event: FormEvent) {
    event.preventDefault();

    const nextLast4 = billingForm.cardNumber.replace(/\D/g, "").slice(-4) || "4242";

    persist(
      {
        ...account,
        plan: "pro",
        billingCycle: billingForm.billingCycle,
        subscriptionStatus: "active",
        paymentLast4: nextLast4,
        nextBillingAt: buildMockNextBillingDate(billingForm.billingCycle)
      },
      "Информацията за членството беше обновена."
    );
  }

  function savePreviewProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const nextAge = Number(formData.get("age") || 0);

    persist(
      {
        ...account,
        name: String(formData.get("name") || account.name).trim(),
        city: String(formData.get("city") || account.city).trim(),
        occupation: String(formData.get("occupation") || "").trim(),
        age: Number.isFinite(nextAge) && nextAge > 0 ? nextAge : null,
        headline: String(formData.get("headline") || account.headline).trim(),
        bio: String(formData.get("bio") || account.bio || "").trim(),
        goals: String(formData.get("goals") || account.goals || "").trim(),
        interests: parseListValue(formData.get("interests")),
        keywords: parseListValue(formData.get("keywords")),
        preferredSessionModes: parseListValue(formData.get("preferredSessionModes"))
      },
      "Профилът за съвпадение беше обновен."
    );
  }

  function savePreviewConsultantProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const sessionLength = Number(formData.get("consultantSessionLengthMinutes") || 60);
    const experienceYears = Number(formData.get("consultantExperienceYears") || 1);
    const displayName = String(
      formData.get("consultantDisplayName") || account.consultantDisplayName || account.name
    ).trim();

    persist(
      {
        ...account,
        city: String(formData.get("consultantCity") || account.city).trim(),
        headline: String(formData.get("consultantHeadline") || account.headline).trim(),
        consultantSlug:
          String(formData.get("consultantSlug") || "").trim() || slugifyValue(displayName),
        consultantDisplayName: displayName,
        consultantProfileType:
          (formData.get("consultantProfileType") as ConsultantProfileType) ||
          account.consultantProfileType ||
          "consultant",
        consultantBio: String(
          formData.get("consultantBio") || account.consultantBio || account.bio || ""
        ).trim(),
        consultantExperienceYears:
          Number.isFinite(experienceYears) && experienceYears > 0 ? experienceYears : 1,
        consultantLanguages: parseListValue(formData.get("consultantLanguages")),
        consultantSpecializations: parseListValue(formData.get("consultantSpecializations")),
        consultantSessionModes: parseListValue(formData.get("consultantSessionModes")),
        consultantTags: parseListValue(formData.get("consultantTags")),
        consultantIdealFor: parseListValue(formData.get("consultantIdealFor")),
        consultantConsultationTopics: parseListValue(
          formData.get("consultantConsultationTopics")
        ),
        consultantWorkApproach: String(
          formData.get("consultantWorkApproach") || account.consultantWorkApproach || ""
        ).trim(),
        consultantAvailability: parseListValue(formData.get("consultantAvailability")),
        consultantSessionLengthMinutes:
          Number.isFinite(sessionLength) && sessionLength > 0 ? sessionLength : 60
      },
      "Публичният консултантски профил беше обновен."
    );
  }

  return (
    <>
      <section className="hero">
        <div className="container page-hero__grid">
          <div className="page-intro">
            <p className="eyebrow">Профил и членство</p>
            <h1>Профилът ти в CareerLane е мястото, от което започват съвпадението, подготовката и следващите разговори.</h1>
            <p className="hero__lede">
              Тук подреждаш как изглеждаш като професионалист или консултант, какво
              търсиш и как CareerLane да насочва по-подходящите срещи и профили.
            </p>
            <div className="hero-stats">
              <div>
                <strong>{formatRoleLabel(account.role)}</strong>
                <span>тип акаунт</span>
              </div>
              <div>
                <strong>{formatMembershipLabel(account.role, account.plan)}</strong>
                <span>активно членство</span>
              </div>
              <div>
                <strong>{visibleProfiles}</strong>
                <span>видими активни профили</span>
              </div>
            </div>
          </div>

          <aside className="panel page-side-card">
            <p className="eyebrow">Обобщение</p>
            <h2>{account.name}</h2>
            <p>{account.headline}</p>
            <div className="chip-row">
              <span className="chip chip--soft">{account.city}</span>
              <span className="chip chip--soft">{account.email}</span>
            </div>
            {profileSignals.length ? (
              <div className="chip-row">
                {profileSignals.map((item) => (
                  <span className="chip" key={item}>
                    {item}
                  </span>
                ))}
              </div>
            ) : null}
            <div className="dashboard-actions">
              <Link className="ghost-button" to={`/auth?tab=register&plan=${account.plan}&role=${account.role}`}>
                Редактирай регистрацията
              </Link>
              <button
                className="ghost-button"
                type="button"
                onClick={() => {
                  clearMockPreviewAccount();
                  setAccount(null);
                }}
              >
                Изчисти профила
              </button>
            </div>
          </aside>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {message ? <div className="panel panel--success">{message}</div> : null}

          <div className="summary-grid">
            <article className="summary-card">
              <span className="plan-pill">Достъп</span>
              <strong>{account.role === "client" ? "Отворен каталог" : consultantProfileIsPublic ? "Публичен профил" : "Профил в подготовка"}</strong>
              <p>
                {account.role === "client"
                  ? "Като потребител виждаш всички активни консултанти и ментори."
                  : consultantProfileIsPublic
                    ? "Профилът ти е активен, публичен и видим в списъка с профили."
                    : "Профилът ти е в подготовка и ще стане публичен след активиране."}
              </p>
            </article>
            <article className="summary-card">
              <span className="plan-pill">Документи</span>
              <strong>{documentLabel}</strong>
              <p>{account.plan === "pro" ? "Разширен документен профил." : "Базово пространство за един активен файл."}</p>
            </article>
            <article className="summary-card">
              <span className="plan-pill">Членство</span>
              <strong>{isPaidConsultantPlan(account.role, account.plan) ? formatEuro(price) : "0 €"}</strong>
              <p>
                {account.role === "client"
                  ? "Потребителският достъп е безплатен"
                  : isPaidConsultantPlan(account.role, account.plan)
                    ? `${account.billingCycle === "monthly" ? "Месечно" : "Годишно"} подновяване`
                    : "Профилът е в чернова без платено активиране"}
              </p>
            </article>
            <article className="summary-card">
              <span className="plan-pill">Статус</span>
              <strong>
                {isPaidConsultantPlan(account.role, account.plan)
                  ? account.subscriptionStatus === "active"
                    ? "Активно"
                    : "Спряно"
                  : account.role === "consultant"
                    ? "Чернова"
                    : "Free"}
              </strong>
              <p>{account.nextBillingAt ? `Следващо подновяване: ${formatDate(account.nextBillingAt)}` : "Няма планирано подновяване."}</p>
            </article>
          </div>
        </div>
      </section>

      <section className="section section--alt">
        <div className="container public-layout">
          <div className="panel-stack">
            <article className="panel">
              <p className="eyebrow">Какво включва профилът</p>
              <h2>Какво получава този акаунт</h2>
              <ul className="feature-list">
                {featureList.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>

            <form className="panel form-stack" onSubmit={savePreviewProfile}>
              <QuestionFlowIntro
                eyebrow="Профил за съвпадение"
                title="Отговори на няколко ясни въпроса и CareerLane ще подреди по-подходящите консултанти."
                description="Вместо сух формуляр, профилът е организиран като кратък въпросник. Можеш да пишеш свободно или да използваш готовите подсказки под въпросите."
                completion={previewCompletion}
              />
              <div className="question-grid">
                <QuestionBlock
                  step="01"
                  title="Кой си в момента?"
                  hint="Това дава базов контекст за ролята, града и етапа, в който се намираш."
                >
                  <div className="two-column">
                    <label>
                      Име
                      <input name="name" defaultValue={account.name} required />
                    </label>
                    <label>
                      Град
                      <input name="city" defaultValue={account.city} placeholder="Например: София" />
                    </label>
                  </div>
                  <div className="two-column">
                    <label>
                      Професия / роля
                      <input
                        name="occupation"
                        defaultValue={account.occupation || ""}
                        placeholder="Например: Product manager"
                      />
                    </label>
                    <label>
                      Възраст
                      <input
                        name="age"
                        type="number"
                        min="16"
                        defaultValue={account.age || ""}
                        placeholder="Например: 32"
                      />
                    </label>
                  </div>
                  <SuggestionPills
                    label="Бърз старт"
                    fieldName="occupation"
                    mode="replace"
                    options={[
                      "Product manager",
                      "Маркетинг специалист",
                      "Software engineer",
                      "HR business partner"
                    ]}
                  />
                </QuestionBlock>

                <QuestionBlock
                  step="02"
                  title="Към каква следваща стъпка вървиш?"
                  hint="Профилното заглавие и текущата ти цел помагат CareerLane да подреди правилните експерти."
                >
                  <label>
                    Профилно заглавие
                    <input
                      name="headline"
                      defaultValue={account.headline}
                      placeholder="Например: Product manager в преход към leadership роля"
                      required
                    />
                  </label>
                  <SuggestionPills
                    label="Примерни посоки"
                    fieldName="headline"
                    mode="replace"
                    options={[
                      "Product manager в преход към leadership роля",
                      "Маркетинг специалист, подготвящ международен преход",
                      "Софтуерен инженер, ориентиран към senior позиции"
                    ]}
                  />
                  <label>
                    Какво търсиш в момента
                    <textarea
                      name="goals"
                      rows={4}
                      defaultValue={account.goals || ""}
                      placeholder="Например: Искам помощ с CV, интервю подготовка и смяна на посоката."
                    />
                  </label>
                  <SuggestionPills
                    label="Често търсени теми"
                    fieldName="goals"
                    mode="replace"
                    options={[
                      "Търся помощ с CV, LinkedIn и интервю подготовка за следващата си роля.",
                      "Искам да подредя стратегия за кариерен преход и по-силно позициониране.",
                      "Търся по-ясна посока за leadership роля и подготовка за разговори с работодатели."
                    ]}
                  />
                </QuestionBlock>

                <QuestionBlock
                  step="03"
                  title="Какъв е професионалният ти контекст?"
                  hint="Краткият разказ за опита ти помага на консултантите да разберат откъде започваш."
                  wide
                >
                  <label>
                    Професионално описание
                    <textarea
                      name="bio"
                      rows={5}
                      defaultValue={account.bio || ""}
                      placeholder="Разкажи накратко за опита си, етапа, в който се намираш, и какво искаш да подобриш."
                    />
                  </label>
                  <SuggestionPills
                    label="Подсказки за тона"
                    fieldName="bio"
                    mode="replace"
                    options={[
                      "Имам няколко години опит в динамична среда и търся по-ясно позициониране за следващата роля.",
                      "Работя в международен контекст и искам по-силен профил за нова кариерна стъпка.",
                      "Искам да представя по-ясно опита си и да подготвя уверен разказ за интервюта и кандидатстване."
                    ]}
                  />
                </QuestionBlock>

                <QuestionBlock
                  step="04"
                  title="Кои теми описват най-добре търсенето ти?"
                  hint="Използвай интереси и ключови думи, за да направиш съвпадението по-точно."
                >
                  <div className="two-column">
                    <label>
                      Интереси
                      <input
                        name="interests"
                        defaultValue={(account.interests || []).join(", ")}
                        placeholder="Leadership roles, international teams, salary negotiation"
                      />
                    </label>
                    <label>
                      Ключови думи
                      <input
                        name="keywords"
                        defaultValue={(account.keywords || []).join(", ")}
                        placeholder="Product, leadership, career transition"
                      />
                    </label>
                  </div>
                  <label>
                    Предпочитан формат
                    <input
                      name="preferredSessionModes"
                      defaultValue={(account.preferredSessionModes || []).join(", ")}
                      placeholder="Онлайн, В офис"
                    />
                  </label>
                  <SuggestionPills
                    label="Добави теми"
                    fieldName="interests"
                    options={[
                      "Leadership roles",
                      "Career transition",
                      "Interview preparation",
                      "Salary negotiation"
                    ]}
                  />
                  <SuggestionPills
                    label="Добави ключови думи"
                    fieldName="keywords"
                    options={[
                      "Product",
                      "Leadership",
                      "International teams",
                      "Promotion"
                    ]}
                  />
                  <SuggestionPills
                    label="Предпочитан формат"
                    fieldName="preferredSessionModes"
                    options={["Онлайн", "В офис", "Хибридно"]}
                  />
                </QuestionBlock>
              </div>
              <div className="question-form__footer">
                <p className="form-note">
                  Колкото по-конкретни са отговорите, толкова по-добре ще изглеждат съвпаденията в търсенето.
                </p>
                <button className="primary-button" type="submit">
                  Запази профила
                </button>
              </div>
            </form>

            {account.role === "client" ? (
              <article className="panel">
                <p className="eyebrow">Подходящи консултанти</p>
                <h2>CareerLane ще подреди по-напред тези профили за теб</h2>
                <div className="info-grid">
                  {matchedConsultants.map(({ consultant, match }) => (
                    <article className="info-card" key={consultant.consultantId}>
                      <span className={match ? "status-badge status-badge--success" : "plan-pill"}>
                        {match ? `${match.score}% съвпадение` : "Профил"}
                      </span>
                      <h3>{consultant.name}</h3>
                      <p>{consultant.headline}</p>
                      <p>{match?.note || "Подреди профила си още малко, за да получиш по-точно насочване."}</p>
                      <Link className="ghost-button" to={`/consultants/${consultant.slug}`}>
                        Виж профила
                      </Link>
                    </article>
                  ))}
                </div>
              </article>
            ) : null}

            {account.role === "consultant" && previewConsultant ? (
              <article className="panel">
                <p className="eyebrow">Подходящи професионалисти</p>
                <h2>Тези профили са най-близо до темите и начина ти на работа</h2>
                <div className="info-grid">
                  {matchedProfessionals.map(({ profile, match }) => (
                    <article className="info-card" key={profile.userId}>
                      <span className="status-badge status-badge--success">
                        {match ? `${match.score}% съвпадение` : "Профил"}
                      </span>
                      <h3>{profile.name}</h3>
                      <p>{profile.headline}</p>
                      <p>{match?.note || "Подходящ професионален профил за темите ти."}</p>
                    </article>
                  ))}
                </div>
              </article>
            ) : null}

            <article className="panel">
              <p className="eyebrow">Документи</p>
              <h2>Документен профил</h2>
              <div className="info-grid info-grid--single">
                {mockDocuments.map((file) => (
                  <article className="info-card" key={file}>
                    <h3>{file}</h3>
                    <p>{account.plan === "pro" ? "Видим в разширения архив." : "Основен активен документ."}</p>
                  </article>
                ))}
              </div>
            </article>

            {account.role === "consultant" ? (
              <>
                <form className="panel form-stack" onSubmit={savePreviewConsultantProfile}>
                  <QuestionFlowIntro
                    eyebrow="Публичен консултантски профил"
                    title="Изгради профил като професионална практика, а не просто като визитка."
                    description="Профилът е структуриран като поредица от ясни въпроси. Използвай подсказките, за да подредиш по-бързо темите, подхода и свободните си часове."
                    completion={previewCompletion}
                  />
                  <div className="question-grid">
                    <QuestionBlock
                      step="01"
                      title="Как те виждат хората?"
                      hint="Публичното име, slug и заглавието са първото впечатление в CareerLane."
                    >
                      <div className="two-column">
                        <label>
                          Публично име
                          <input
                            name="consultantDisplayName"
                            defaultValue={account.consultantDisplayName || account.name}
                            required
                          />
                        </label>
                        <label>
                          Тип профил
                          <select
                            name="consultantProfileType"
                            defaultValue={account.consultantProfileType || "consultant"}
                          >
                            <option value="consultant">Консултант</option>
                            <option value="mentor">Ментор</option>
                          </select>
                        </label>
                      </div>
                      <div className="two-column">
                        <label>
                          Slug
                          <input
                            name="consultantSlug"
                            defaultValue={
                              account.consultantSlug ||
                              slugifyValue(account.consultantDisplayName || account.name)
                            }
                            required
                          />
                        </label>
                        <label>
                          Град
                          <input
                            name="consultantCity"
                            defaultValue={account.city}
                            placeholder="Например: София"
                            required
                          />
                        </label>
                        <label>
                          Години опит
                          <input
                            name="consultantExperienceYears"
                            type="number"
                            min="1"
                            defaultValue={account.consultantExperienceYears || 1}
                          />
                        </label>
                      </div>
                    <label>
                      Заглавие
                      <input
                        name="consultantHeadline"
                          defaultValue={account.headline}
                          placeholder="Например: Консултант за leadership преходи и executive позициониране"
                          required
                        />
                      </label>
                      <SuggestionPills
                        label="Стартови идеи"
                        fieldName="consultantHeadline"
                        mode="replace"
                        options={[
                          "Консултант за leadership преходи и executive позициониране",
                          "Кариерен консултант за интервю подготовка и професионално представяне",
                          "Консултант по кариерни преходи и международно позициониране"
                        ]}
                      />
                    </QuestionBlock>

                    <QuestionBlock
                      step="02"
                      title="С кого работиш и по какви теми?"
                      hint="Тези отговори определят как ще бъдеш намиран и какъв тип професионалисти ще стигат до теб."
                    >
                      <label>
                        Специализации
                        <input
                          name="consultantSpecializations"
                          defaultValue={(account.consultantSpecializations || []).join(", ")}
                          placeholder="CV review, interview preparation, leadership roles"
                        />
                      </label>
                      <label>
                        Основни теми на консултацията
                        <input
                          name="consultantConsultationTopics"
                          defaultValue={(account.consultantConsultationTopics || []).join(", ")}
                          placeholder="Кариерна стратегия, LinkedIn, интервю подготовка"
                        />
                      </label>
                      <label>
                        Подходящо за
                        <input
                          name="consultantIdealFor"
                          defaultValue={(account.consultantIdealFor || []).join(", ")}
                          placeholder="Mid-senior professionals, career transition, leadership moves"
                        />
                      </label>
                      <SuggestionPills
                        label="Добави специализации"
                        fieldName="consultantSpecializations"
                        options={[
                          "CV review",
                          "Interview preparation",
                          "Leadership roles",
                          "Career transition"
                        ]}
                      />
                      <SuggestionPills
                        label="Добави теми"
                        fieldName="consultantConsultationTopics"
                        options={[
                          "Кариерна стратегия",
                          "LinkedIn позициониране",
                          "Интервю подготовка",
                          "Executive CV"
                        ]}
                      />
                      <SuggestionPills
                        label="Подходящо за"
                        fieldName="consultantIdealFor"
                        options={[
                          "Mid-senior professionals",
                          "Leadership moves",
                          "Career transition",
                          "International roles"
                        ]}
                      />
                    </QuestionBlock>

                    <QuestionBlock
                      step="03"
                      title="Как протича работата с теб?"
                      hint="Това е частта, която прави профила ти по-убедителен и професионален."
                      wide
                    >
                      <label>
                        Биография
                        <textarea
                          name="consultantBio"
                          rows={5}
                          defaultValue={account.consultantBio || account.bio || ""}
                          placeholder="Опиши с кого работиш, по какви теми и какъв е начинът ти на работа."
                        />
                      </label>
                      <label>
                        Как протича работата
                        <textarea
                          name="consultantWorkApproach"
                          rows={4}
                          defaultValue={account.consultantWorkApproach || ""}
                          placeholder="Опиши кратко процеса, как подготвяш клиента и какво да очаква от консултацията."
                        />
                      </label>
                      <SuggestionPills
                        label="Примерен подход"
                        fieldName="consultantWorkApproach"
                        mode="replace"
                        options={[
                          "Първо подреждаме целта и текущия профил, след това работим върху позиционирането и подготовката за следващата стъпка.",
                          "Работя на етапи: анализ на профила, конкретни насоки и практическа подготовка за разговори и кандидатстване.",
                          "Всяка консултация започва с ясен контекст и завършва с конкретен план за действие."
                        ]}
                      />
                    </QuestionBlock>

                    <QuestionBlock
                      step="04"
                      title="Как и кога могат да те резервират?"
                      hint="Езиците, формата на работа и свободните часове правят профила ти завършен."
                    >
                      <div className="two-column">
                        <label>
                          Езици
                          <input
                            name="consultantLanguages"
                            defaultValue={(account.consultantLanguages || ["Български"]).join(", ")}
                            placeholder="Български, English"
                          />
                        </label>
                        <label>
                          Формати на работа
                          <input
                            name="consultantSessionModes"
                            defaultValue={(account.consultantSessionModes || ["Онлайн"]).join(", ")}
                            placeholder="Онлайн, В офис"
                          />
                        </label>
                      </div>
                      <div className="two-column">
                        <label>
                          Тагове
                          <input
                            name="consultantTags"
                            defaultValue={(account.consultantTags || []).join(", ")}
                            placeholder="Leadership, Product, Career change"
                          />
                        </label>
                        <label>
                          Продължителност на сесия
                          <input
                            name="consultantSessionLengthMinutes"
                            type="number"
                            min="30"
                            step="15"
                            defaultValue={account.consultantSessionLengthMinutes || 60}
                          />
                        </label>
                      </div>
                      <label>
                        Свободни часове
                        <textarea
                          name="consultantAvailability"
                          rows={5}
                          defaultValue={(account.consultantAvailability || []).join("\n")}
                          placeholder="2026-03-25T09:00:00.000Z"
                        />
                      </label>
                      <SuggestionPills
                        label="Добави примерни слотове"
                        fieldName="consultantAvailability"
                        mode="append-lines"
                        options={[
                          buildAvailabilityPreset(1, 9),
                          buildAvailabilityPreset(1, 14),
                          buildAvailabilityPreset(2, 11),
                          buildAvailabilityPreset(3, 16)
                        ]}
                      />
                    </QuestionBlock>
                  </div>
                  <div className="question-form__footer">
                    <p className="form-note">
                      Подреденият профил и ясните свободни часове правят резервирането по-лесно.
                    </p>
                    <button className="primary-button" type="submit">
                      Запази публичния профил
                    </button>
                  </div>
                </form>

                {previewConsultant ? (
                  <article className="panel">
                    <p className="eyebrow">Публичен преглед</p>
                    <h2>{previewConsultant.name}</h2>
                    <div className="chip-row">
                      <span className="status-badge">
                        {formatConsultantTypeLabel(getConsultantProfileType(previewConsultant))}
                      </span>
                      <span className={consultantProfileIsPublic ? "status-badge status-badge--success" : "plan-pill"}>
                        {consultantProfileIsPublic ? "Активен профил" : "В подготовка"}
                      </span>
                    </div>
                    <p className="section-caption">{previewConsultant.headline}</p>
                    <div className="chip-row">
                      {previewConsultant.specializations.map((item) => (
                        <span className="chip" key={item}>
                          {item}
                        </span>
                      ))}
                    </div>
                    <div className="summary-grid">
                      <article className="summary-card">
                        <span className="plan-pill">Подходящо за</span>
                        <strong>{getConsultantIdealFor(previewConsultant).slice(0, 2).join(" · ") || "Общ профил"}</strong>
                        <p>CareerLane ще използва тази секция при подреждането в търсенето.</p>
                      </article>
                      <article className="summary-card">
                        <span className="plan-pill">Сесия</span>
                        <strong>{getSessionLengthLabel(previewConsultant)}</strong>
                        <p>{previewConsultant.sessionModes.join(" · ")}</p>
                      </article>
                    </div>
                    <p>{getConsultantWorkApproach(previewConsultant)}</p>
                    {consultantProfileIsPublic ? (
                      <Link className="primary-button" to={`/consultants/${previewConsultant.slug}`}>
                        Виж публичния профил
                      </Link>
                    ) : (
                      <div className="panel panel--subtle">
                        <strong>Профилът още не е публичен.</strong>
                        <p>
                          Активирай абонамента, за да се появи в публичния списък, да може да се
                          споделя и да приема заявки от потребители.
                        </p>
                      </div>
                    )}
                  </article>
                ) : null}
              </>
            ) : null}
          </div>

          <aside className="panel page-side-card">
            <p className="eyebrow">Членство</p>
            <h2>
              {account.role === "consultant"
                ? isPaidConsultantPlan(account.role, account.plan)
                  ? "Управление на членството"
                  : "Активирай профила"
                : "Free акаунт"}
            </h2>
            {account.role === "consultant" && isPaidConsultantPlan(account.role, account.plan) ? (
              <form className="form-stack" onSubmit={saveBillingPreview}>
                <label>
                  Период
                  <select
                    value={billingForm.billingCycle}
                    onChange={(event) =>
                      setBillingForm({
                        ...billingForm,
                        billingCycle: event.target.value as MockBillingCycle
                      })
                    }
                  >
                    <option value="monthly">Месечно</option>
                    <option value="yearly">Годишно</option>
                  </select>
                </label>
                <label>
                  Номер на карта
                  <input
                    value={billingForm.cardNumber}
                    onChange={(event) =>
                      setBillingForm({ ...billingForm, cardNumber: event.target.value })
                    }
                    placeholder="4242 4242 4242 4242"
                  />
                </label>
                <div className="panel panel--subtle">
                  <strong>Метод на плащане</strong>
                  <p>Visa ending in {account.paymentLast4 || "4242"}</p>
                </div>
                <button className="primary-button" type="submit">
                  Запази членството
                </button>
              </form>
            ) : account.role === "consultant" ? (
              <div className="panel panel--subtle">
                <strong>Профил в чернова</strong>
                <p>
                  Подреди профила си, а след това активирай абонамента, за да стане
                  публичен, споделяем и видим сред активните консултанти и ментори.
                </p>
                <button className="primary-button" type="button" onClick={upgradeToPro}>
                  Активирай профила
                </button>
              </div>
            ) : (
              <div className="panel panel--subtle">
                <strong>Free статус</strong>
                <p>
                  Потребителският достъп е безплатен. Оттук поддържаш профила си и
                  можеш да разглеждаш всички активни консултанти и ментори.
                </p>
              </div>
            )}
            <div className="panel panel--subtle">
              <strong>Директен достъп</strong>
              <p>
                {account.role === "consultant"
                  ? consultantProfileIsPublic
                    ? "Отвори публичната си страница и прегледай как изглеждат свободните ти часове."
                    : "Прегледай страницата за консултанти и ментори и виж как е структуриран публичният каталог."
                  : "Разгледай подредения списък с консултанти и ментори и виж кои профили CareerLane извежда по-напред за теб."}
              </p>
              <Link
                className="ghost-button"
                to={
                  account.role === "consultant"
                    ? consultantProfileIsPublic && previewConsultant
                      ? `/consultants/${previewConsultant.slug}`
                      : "/consultants"
                    : "/users"
                }
              >
                {account.role === "consultant"
                  ? consultantProfileIsPublic
                    ? "Отвори публичния си профил"
                    : "Към страницата за консултанти и ментори"
                  : "Към търсенето на профили"}
              </Link>
            </div>
            {account.role === "consultant" && isPaidConsultantPlan(account.role, account.plan) ? (
              <div className="dashboard-actions">
                <button className="ghost-button" type="button" onClick={toggleSubscriptionStatus}>
                  {account.subscriptionStatus === "active"
                    ? "Спри подновяването"
                    : "Активирай отново"}
                </button>
                <button className="ghost-button" type="button" onClick={downgradeToFree}>
                  Върни към чернова
                </button>
              </div>
            ) : null}
          </aside>
        </div>
      </section>
    </>
  );
}

function FaqPage() {
  return (
    <>
      <section className="hero">
        <div className="container page-hero__grid">
          <div className="page-intro">
            <p className="eyebrow">FAQ</p>
            <h1>Отговори на най-честите въпроси за платформата, акаунтите и достъпа.</h1>
            <p className="hero__lede">
              FAQ страницата е подредена така, че нов потребител, консултант или партньор
              да получи бърза ориентация без да търси информация в отделни секции.
            </p>
          </div>

          <aside className="panel page-side-card">
            <p className="eyebrow">Полезни връзки</p>
            <h2>Още помощ</h2>
            <div className="helper-grid helper-grid--single">
              <article className="helper-card">
                <strong>Contact</strong>
                <p>За въпроси извън FAQ използвай страницата за контакти.</p>
                <Link className="ghost-button" to="/contact">
                  Отвори Contact
                </Link>
              </article>
              <article className="helper-card">
                <strong>Legal</strong>
                <p>За условия, privacy и правни детайли виж правната страница.</p>
                <Link className="ghost-button" to="/legal">
                  Отвори Legal
                </Link>
              </article>
            </div>
          </aside>
        </div>
      </section>

      <section className="section">
        <div className="container faq-list">
          {faqItems.map((item, index) => (
            <details className="faq-item" key={item.question} open={index === 0}>
              <summary>{item.question}</summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </div>
      </section>
    </>
  );
}

function LegalPage() {
  return (
    <>
      <section className="hero">
        <div className="container page-hero__grid">
          <div className="page-intro">
            <p className="eyebrow">Legal</p>
            <h1>Правна информация, условия за използване и насоки за поверителност.</h1>
            <p className="hero__lede">
              Тази страница обобщава основните правила за използване на платформата,
              обработката на данни и ролята на CareerLane като професионална среда за
              свързване и организация на консултации.
            </p>
          </div>

          <aside className="panel page-side-card">
            <p className="eyebrow">Последна актуализация</p>
            <h2>20 март 2026</h2>
            <p>
              При промени по членствата, политиките или начина на работа на платформата
              правната информация следва да бъде обновявана ясно и навреме.
            </p>
            <a className="ghost-button" href="mailto:legal@careerlane.eu">
              legal@careerlane.eu
            </a>
          </aside>
        </div>
      </section>

      <section className="section">
        <div className="container public-layout">
          <div className="panel-stack">
            {legalSections.map((section) => (
              <article className="panel legal-section" key={section.title}>
                <h2>{section.title}</h2>
                <ul className="page-list">
                  {section.points.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>

          <aside className="panel page-side-card">
            <p className="eyebrow">Важно</p>
            <h2>Платформата не е гаранция за резултат.</h2>
            <p>
              CareerLane улеснява професионалното позициониране и организацията на
              консултации, но не дава гаранция за интервю, оферта или наемане.
            </p>
            <Link className="ghost-button" to="/faq">
              Прегледай FAQ
            </Link>
          </aside>
        </div>
      </section>
    </>
  );
}

function NotFoundPage() {
  return (
    <section className="section">
      <div className="container">
        <div className="panel empty-state empty-state--centered">
          <p className="eyebrow">404</p>
          <h2>Тази страница не беше намерена.</h2>
          <p>
            Възможно е адресът да е променен или страницата вече да не е активна. Използвай
            някоя от основните секции, за да продължиш.
          </p>
          <div className="dashboard-actions">
            <Link className="primary-button" to="/">
              Към началото
            </Link>
            <Link className="ghost-button" to="/users">
              За потребители
            </Link>
            <Link className="ghost-button" to="/contact">
              Contact us
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function ConsultantPage() {
  const { slug = "" } = useParams();
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const previewAccount = useMockPreviewSnapshot();
  const { profile: viewerProfile, loading: viewerProfileLoading } = useViewerProfile();
  const [consultant, setConsultant] = useState<ConsultantProfile | null>(null);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [note, setNote] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [shareMessage, setShareMessage] = useState("");

  useEffect(() => {
    api
      .getConsultant(slug)
      .then((value) => {
        setConsultant(value);
        setSelectedSlot(value.availability[0] || "");
      })
      .catch((value) => {
        setError(value instanceof Error ? value.message : "Неуспешно зареждане.");
      });
  }, [slug]);

  if (error) {
    return (
      <section className="section">
        <div className="container">
          <div className="panel panel--error">{error}</div>
        </div>
      </section>
    );
  }

  if (!consultant) {
    return (
      <section className="section">
        <div className="container">
          <div className="panel">Зареждаме профила на консултанта...</div>
        </div>
      </section>
    );
  }

  const isConsultantViewer = viewerProfile?.role === "consultant";
  const bookingCtaTo = user ? "/dashboard" : previewAccount ? "/account" : "/auth?tab=register";
  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/career/#/consultants/${consultant.slug}`
      : "";

  const shareProfile = async () => {
    setShareMessage("");

    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({
          title: `${consultant.name} | CareerLane`,
          text: consultant.headline,
          url: shareUrl
        });
        setShareMessage("Профилът беше споделен успешно.");
        return;
      }

      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
        setShareMessage("Линкът към профила беше копиран.");
        return;
      }

      setShareMessage("Профилният линк е готов за споделяне.");
    } catch {
      setShareMessage("Споделянето беше прекъснато.");
    }
  };

  const submitBooking = async (event: FormEvent) => {
    event.preventDefault();
    setMessage("");
    setError("");

    if (isConsultantViewer) {
      setError(
        "Консултантските акаунти не резервират други консултанти. В профила и таблото си ще виждаш подходящите професионалисти за твоята практика."
      );
      return;
    }

    const bookingToken =
      user && token
        ? token
        : previewAccount?.role === "client"
          ? previewAccount.email
          : "";

    if (!bookingToken) {
      navigate(`/auth?redirect=${encodeURIComponent(`/consultants/${consultant.slug}`)}`);
      return;
    }

    try {
      await api.createBooking(bookingToken, {
        consultantId: consultant.consultantId,
        scheduledAt: selectedSlot,
        note
      });
      setMessage("Консултацията е заявена успешно. Ще я видиш в профила си.");
    } catch (value) {
      setError(value instanceof Error ? value.message : "Неуспешно създаване на заявка.");
    }
  };

  return (
    <>
      <section className="profile-hero">
        <div className="container profile-hero__grid">
          <article className="profile-card">
            <img
              className="profile-card__avatar"
              src={resolvePublicUrl(consultant.avatarUrl)}
              alt={consultant.name}
            />
            <div>
              <p className="eyebrow">
                Публичен профил · {formatConsultantTypeLabel(getConsultantProfileType(consultant))}
              </p>
              <h1>{consultant.name}</h1>
              <p className="profile-card__headline">{consultant.headline}</p>
              <div className="chip-row">
                {consultant.specializations.map((item) => (
                  <span className="chip" key={item}>
                    {item}
                  </span>
                ))}
              </div>
              <div className="meta-row">
                <span>{consultant.city}</span>
                <span>{consultant.experienceYears} години опит</span>
                <span>
                  {consultant.rating} рейтинг · {consultant.reviewCount} мнения
                </span>
              </div>
              <div className="profile-actions">
                <button className="ghost-button" type="button" onClick={shareProfile}>
                  Сподели профила
                </button>
                <Link className="ghost-button" to="/users">
                  Виж профилите
                </Link>
              </div>
              {shareMessage ? <div className="panel panel--success">{shareMessage}</div> : null}
            </div>
          </article>

          <aside className="booking-card">
            <span className="status-badge status-badge--success">Следващ свободен слот</span>
            <strong>{formatDate(consultant.nextAvailable)}</strong>
            <span>
              {getSessionLengthLabel(consultant)} · {consultant.sessionModes.join(" · ")}
            </span>
            <p>
              {getConsultantWorkApproach(consultant)}
            </p>
            <img src={resolvePublicUrl(consultant.mapImageUrl)} alt={consultant.city} />
          </aside>
        </div>
      </section>

      <section className="section">
        <div className="container consultant-detail-grid">
          <div className="panel-stack">
            <article className="panel">
              <h2>За консултанта</h2>
              <p>{consultant.bio}</p>
            </article>

            <article className="panel">
              <h2>Подходящо за</h2>
              <div className="chip-row">
                {getConsultantIdealFor(consultant).map((item) => (
                  <span className="chip chip--soft" key={item}>
                    {item}
                  </span>
                ))}
              </div>
            </article>

            <article className="panel">
              <h2>Теми на консултацията</h2>
              <div className="chip-row">
                {getConsultationTopics(consultant).map((item) => (
                  <span className="chip" key={item}>
                    {item}
                  </span>
                ))}
              </div>
            </article>

            <article className="panel">
              <h2>Езици, формати и професионален контекст</h2>
              <div className="chip-row">
                {consultant.languages.map((item) => (
                  <span className="chip chip--soft" key={item}>
                    {item}
                  </span>
                ))}
                {consultant.sessionModes.map((item) => (
                  <span className="chip chip--soft" key={item}>
                    {item}
                  </span>
                ))}
                {consultant.tags.map((item) => (
                  <span className="chip chip--soft" key={item}>
                    {item}
                  </span>
                ))}
              </div>
            </article>

            <article className="panel">
              <h2>Как протича работата</h2>
              <p>{getConsultantWorkApproach(consultant)}</p>
            </article>
          </div>

          <form className="panel booking-panel" onSubmit={submitBooking}>
            <h2>Заяви консултация</h2>
            <p className="section-caption">
              Избери свободен час и изпрати кратък контекст, за да започне разговорът по-лесно.
            </p>
            {isConsultantViewer ? (
              <div className="panel panel--subtle role-guard-panel">
                <strong>Тази стъпка е активна за потребители.</strong>
                <p>
                  CareerLane съпоставя консултантите с потребители, а не с други
                  консултанти. Подходящите професионалисти за теб се показват в профила и таблото ти.
                </p>
                <Link className="ghost-button" to={bookingCtaTo}>
                  {user ? "Отвори таблото си" : "Отвори профила си"}
                </Link>
              </div>
            ) : (
              <>
                <div className="slot-grid">
                  {consultant.availability.map((slot) => (
                    <button
                      type="button"
                      key={slot}
                      className={`slot-button ${selectedSlot === slot ? "slot-button--active" : ""}`}
                      onClick={() => setSelectedSlot(slot)}
                    >
                      {formatDate(slot)}
                    </button>
                  ))}
                </div>

                <label>
                  Кратка бележка
                  <textarea
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                    rows={5}
                    placeholder="Например: искам преглед на LinkedIn, интервю подготовка и позициониране за leadership роли."
                  />
                </label>
              </>
            )}

            {message ? <div className="panel panel--success">{message}</div> : null}
            {error ? <div className="panel panel--error">{error}</div> : null}

            {!isConsultantViewer ? (
              <button className="primary-button" type="submit" disabled={viewerProfileLoading}>
                {user ? "Изпрати заявка" : "Влез и изпрати заявка"}
              </button>
            ) : null}
          </form>
        </div>
      </section>
    </>
  );
}

function AuthPage() {
  const {
    configured,
    user,
    loading,
    register: registerWithAuth,
    confirm: confirmWithAuth,
    login: loginWithAuth,
    requestPasswordReset,
    completePasswordReset
  } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const redirect = params.get("redirect") || (configured ? "/dashboard" : "/account");
  const resolvedRedirect = configured && redirect === "/account" ? "/dashboard" : redirect;
  const initialTab = params.get("tab") === "register" ? "register" : "login";
  const initialRole = params.get("role") === "consultant" ? "consultant" : "client";
  const initialPlan = "free";
  const existingPreview = configured ? null : readMockPreviewAccount();

  const [screen, setScreen] = useState<AuthScreen>(initialTab);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: existingPreview?.name || "",
    email: existingPreview?.email || "",
    password: "",
    role: (existingPreview?.role || initialRole) as UserRole,
    plan:
      ((existingPreview?.role || initialRole) === "consultant"
        ? existingPreview?.plan || initialPlan
        : "free") as PlanTier,
    city: existingPreview?.city || "София",
    headline:
      existingPreview?.headline ||
      "Product manager в преход към по-видима международна роля",
    consultantProfileType:
      (existingPreview?.consultantProfileType || "consultant") as ConsultantProfileType,
    billingCycle: (existingPreview?.billingCycle || "monthly") as MockBillingCycle,
    cardName: existingPreview?.name || "",
    cardNumber: existingPreview?.paymentLast4
      ? `4242 4242 4242 ${existingPreview.paymentLast4}`
      : "4242 4242 4242 4242",
    expiry: "12/29",
    cvc: "123",
    acceptSubscription: true,
    code: "",
    newPassword: ""
  });

  useEffect(() => {
    setScreen(initialTab);
    setForm((current) => ({
      ...current,
      role: initialRole as UserRole,
      plan: initialRole === "consultant" ? (initialPlan as PlanTier) : "free"
    }));
  }, [initialPlan, initialRole, initialTab]);

  useEffect(() => {
    if (form.plan !== "free") {
      setForm((current) => ({ ...current, plan: "free" }));
    }
  }, [form.plan]);

  if (!loading && user) {
    return <Navigate to={resolvedRedirect} replace />;
  }

  const activeTab =
    screen === "register" || screen === "confirm" ? "register" : "login";
  const isPro = isPaidConsultantPlan(form.role, form.plan);
  const registrationSummary = getRolePlanSummary(form.role, form.plan);
  const planFeatures = getMockPlanFeatures(form.role, form.plan);
  const planPrice = isPro ? getMockProPrice(form.role, form.billingCycle) : 0;
  const authStageTitle =
    screen === "register"
      ? "Създаваш нов профил"
      : screen === "confirm"
        ? "Завършваш регистрацията"
        : screen === "forgot-request"
          ? "Изпращаш заявка за нова парола"
          : screen === "forgot-confirm"
            ? "Задаваш нова парола"
            : "Влизаш в профила си";
  const authStageDescription =
    screen === "register"
      ? "Създаваш акаунт според ролята си и подреждаш достъпа си до кариерни консултанти, документите и консултациите."
      : screen === "confirm"
        ? "Потвърждаваш регистрацията и продължаваш директно към профила и членството си."
        : screen === "forgot-request"
          ? "Изпращаме код за сигурно възстановяване само към посочения имейл."
          : screen === "forgot-confirm"
            ? "Задаваш нова парола и веднага възстановяваш достъпа до профила си."
            : "Влизаш бързо в своя профил и продължаваш към документите, консултантите и следващите си стъпки.";
  const canRegister = Boolean(
    form.name.trim() &&
      form.email.trim() &&
      form.password.trim().length >= 8 &&
      form.city.trim() &&
      form.headline.trim() &&
      (!isPro ||
        (form.cardName.trim() &&
          form.cardNumber.trim() &&
          form.expiry.trim() &&
          form.cvc.trim() &&
          form.acceptSubscription))
  );

  function clearFeedback() {
    setMessage("");
    setError("");
  }

  function handleSocialEntry(providerLabel: string) {
    clearFeedback();
    setMessage(
      `${providerLabel} входът е предвиден в CareerLane и ще бъде активиран в следващата стъпка. Засега можеш да продължиш с имейл и да разгледаш целия поток.`
    );
  }

  function buildPresentationAccount(): MockPreviewAccount {
    const paymentLast4 =
      isPro && form.cardNumber.trim()
        ? form.cardNumber.replace(/\D/g, "").slice(-4) || "4242"
        : null;

    return {
      name: form.name.trim(),
      email: form.email.trim(),
      password: form.password.trim() || existingPreview?.password || "",
      role: form.role,
      plan: form.role === "consultant" ? form.plan : "free",
      city: form.city.trim(),
      occupation: "",
      age: null,
      headline: form.headline.trim(),
      bio: "",
      interests: [],
      keywords: [],
      goals: "",
      preferredSessionModes: form.role === "consultant" ? ["Онлайн"] : [],
      billingCycle: form.billingCycle,
      subscriptionStatus: isPro ? "active" : "inactive",
      paymentLast4,
      startedAt: new Date().toISOString(),
      nextBillingAt: isPro ? buildMockNextBillingDate(form.billingCycle) : null,
      consultantProfileType:
        form.role === "consultant" ? form.consultantProfileType : undefined,
      consultantSlug:
        form.role === "consultant" ? slugifyValue(form.name.trim()) : undefined,
      consultantDisplayName: form.role === "consultant" ? form.name.trim() : undefined,
      consultantBio:
        form.role === "consultant"
          ? "Добави по-подробен професионален профил, теми и свободни часове от профила си."
          : undefined,
      consultantExperienceYears: form.role === "consultant" ? 1 : undefined,
      consultantLanguages: form.role === "consultant" ? ["Български"] : undefined,
      consultantSpecializations:
        form.role === "consultant" ? ["Кариерна стратегия"] : undefined,
      consultantSessionModes: form.role === "consultant" ? ["Онлайн"] : undefined,
      consultantTags: form.role === "consultant" ? ["CareerLane"] : undefined,
      consultantIdealFor:
        form.role === "consultant" ? ["Професионалисти в кариерен преход"] : undefined,
      consultantConsultationTopics:
        form.role === "consultant"
          ? ["Кариерна стратегия", "CV и профил"]
          : undefined,
      consultantWorkApproach:
        form.role === "consultant"
          ? "Работим стъпка по стъпка: профил, цели и конкретна подготовка."
          : undefined,
      consultantAvailability:
        form.role === "consultant"
          ? [new Date(Date.now() + 86_400_000).toISOString()]
          : undefined,
      consultantSessionLengthMinutes: form.role === "consultant" ? 60 : undefined
    };
  }

  async function handleRegister(event: FormEvent) {
    event.preventDefault();
    clearFeedback();

    if (!canRegister) {
      setError("Попълни нужните полета, за да продължиш.");
      return;
    }

    if (!configured) {
      writeMockPreviewAccount(buildPresentationAccount());
      navigate("/account");
      return;
    }

    try {
      await registerWithAuth({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password.trim(),
        role: form.role,
        plan: form.role === "consultant" ? form.plan : "free"
      });

      writePendingBootstrap({
        name: form.name.trim(),
        email: form.email.trim(),
        role: form.role,
        plan: form.role === "consultant" ? form.plan : "free",
        consultantProfileType:
          form.role === "consultant" ? form.consultantProfileType : undefined
      });

      setScreen("confirm");
      setMessage("Изпратихме код за потвърждение на посочения имейл.");
    } catch (value) {
      setError(value instanceof Error ? value.message : "Неуспешна регистрация.");
    }
  }

  async function handleConfirm(event: FormEvent) {
    event.preventDefault();
    clearFeedback();

    if (!configured) {
      writeMockPreviewAccount(buildPresentationAccount());
      navigate("/account");
      return;
    }

    if (!form.password.trim()) {
      setError("Въведи паролата си, за да завършиш регистрацията.");
      return;
    }

    try {
      await confirmWithAuth(form.email.trim(), form.code.trim());
      const token = await loginWithAuth(form.email.trim(), form.password.trim());
      const pendingBootstrap = readPendingBootstrap();

      if (pendingBootstrap && pendingBootstrap.email.toLowerCase() === form.email.trim().toLowerCase()) {
        await api.bootstrapUser(token, pendingBootstrap);
        clearPendingBootstrap();
      }

      navigate(resolvedRedirect);
    } catch (value) {
      setError(value instanceof Error ? value.message : "Неуспешно потвърждение.");
    }
  }

  async function handleLogin(event: FormEvent) {
    event.preventDefault();
    clearFeedback();

    if (!form.password.trim()) {
      setError("Въведи паролата си, за да продължиш.");
      return;
    }

    if (!configured) {
      const previewAccount = readMockPreviewAccount();

      if (!previewAccount) {
        setError("Първо създай профил от регистрацията, за да влезеш.");
        return;
      }

      if (previewAccount.email.toLowerCase() !== form.email.trim().toLowerCase()) {
        setError("Не открихме профил с този имейл.");
        return;
      }

      if (previewAccount.password && previewAccount.password !== form.password.trim()) {
        setError("Паролата не съвпада с този профил.");
        return;
      }

      navigate("/account");
      return;
    }

    try {
      const token = await loginWithAuth(form.email.trim(), form.password.trim());
      const pendingBootstrap = readPendingBootstrap();

      if (pendingBootstrap && pendingBootstrap.email.toLowerCase() === form.email.trim().toLowerCase()) {
        await api.bootstrapUser(token, pendingBootstrap);
        clearPendingBootstrap();
      }

      navigate(resolvedRedirect);
    } catch (value) {
      setError(value instanceof Error ? value.message : "Неуспешен вход.");
    }
  }

  async function handlePasswordResetRequest(event: FormEvent) {
    event.preventDefault();
    clearFeedback();

    if (!configured) {
      const previewAccount = readMockPreviewAccount();

      if (!previewAccount || previewAccount.email.toLowerCase() !== form.email.trim().toLowerCase()) {
        setError("Не открихме профил с този имейл.");
        return;
      }

      setScreen("forgot-confirm");
      setMessage("Изпратихме код за нова парола. Въведи го заедно с новата си парола.");
      return;
    }

    try {
      await requestPasswordReset(form.email.trim());
      setScreen("forgot-confirm");
      setMessage("Изпратихме код за нова парола. Въведи го заедно с новата си парола.");
    } catch (value) {
      setError(value instanceof Error ? value.message : "Неуспешно изпращане на код.");
    }
  }

  async function handlePasswordResetConfirm(event: FormEvent) {
    event.preventDefault();
    clearFeedback();

    if (!form.code.trim() || !form.newPassword.trim()) {
      setError("Попълни кода и новата парола.");
      return;
    }

    if (!configured) {
      const previewAccount = readMockPreviewAccount();

      if (!previewAccount) {
        setError("Не открихме профил за възстановяване.");
        return;
      }

      writeMockPreviewAccount({
        ...previewAccount,
        password: form.newPassword.trim()
      });

      setScreen("login");
      setForm((current) => ({ ...current, code: "", newPassword: "", password: "" }));
      setMessage("Паролата е обновена успешно. Можеш да влезеш отново.");
      return;
    }

    try {
      await completePasswordReset(
        form.email.trim(),
        form.code.trim(),
        form.newPassword.trim()
      );
      setScreen("login");
      setForm((current) => ({ ...current, code: "", newPassword: "", password: "" }));
      setMessage("Паролата е обновена успешно. Можеш да влезеш отново.");
    } catch (value) {
      setError(value instanceof Error ? value.message : "Неуспешно обновяване на паролата.");
    }
  }

  return (
    <section className="section auth-section">
      <div className="container auth-layout">
        <div className="auth-copy">
          <p className="eyebrow">Вход и регистрация</p>
          <h1>Влизаш в CareerLane и продължаваш там, откъдето започва следващата ти стъпка.</h1>
          <p>
            Оттук създаваш профил и управляваш сигурно входа си. Потвърждението се
            появява само след регистрация, а забравената парола има отделен ясен поток
            за възстановяване.
          </p>

          <div className="panel auth-side-panel">
            <h2>{authStageTitle}</h2>
            <p className="section-heading__copy">{authStageDescription}</p>
            <ul>
              <li>Потребителски акаунт с ясен старт и подреден следващ ход</li>
              <li>Консултантски профил с професионално присъствие в CareerLane</li>
              <li>Едно начало за профил, документи и следващи действия</li>
            </ul>
            {existingPreview ? (
              <Link className="ghost-button" to="/account">
                Отвори профила
              </Link>
            ) : null}
            {screen === "register" ? (
              <div className="panel panel--subtle">
                <strong>
                  {form.role === "consultant"
                    ? `Избран тип: ${
                        form.consultantProfileType === "mentor" ? "Ментор" : "Консултант"
                      }`
                    : "Избран тип: Потребител"}
                </strong>
                <p>{registrationSummary}</p>
              </div>
            ) : null}
          </div>
        </div>

        <div className="panel auth-card">
          <div className="tab-row">
            <button
              type="button"
              className={activeTab === "login" ? "tab-row__active" : ""}
              onClick={() => {
                clearFeedback();
                setScreen("login");
              }}
            >
              Вход
            </button>
            <button
              type="button"
              className={activeTab === "register" ? "tab-row__active" : ""}
              onClick={() => {
                clearFeedback();
                setScreen("register");
              }}
            >
              Регистрация
            </button>
          </div>

          {message ? <div className="panel panel--success">{message}</div> : null}
          {error ? <div className="panel panel--error">{error}</div> : null}

          <div className="social-auth">
            <span className="search-shortcuts__label">Вход с външен профил</span>
            <div className="social-auth__grid">
              {socialProviders.map((provider) => (
                <button
                  className="social-auth__button"
                  key={provider.key}
                  type="button"
                  onClick={() => handleSocialEntry(provider.label)}
                >
                  {provider.label}
                </button>
              ))}
            </div>
          </div>

          {screen === "login" ? (
            <form className="form-stack" onSubmit={handleLogin}>
              <label>
                Имейл
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) => setForm({ ...form, email: event.target.value })}
                  autoComplete="email"
                  placeholder="name@example.com"
                  required
                />
              </label>
              <label>
                Парола
                <input
                  type="password"
                  value={form.password}
                  onChange={(event) => setForm({ ...form, password: event.target.value })}
                  autoComplete="current-password"
                  placeholder="Въведи паролата си"
                  required
                />
              </label>
              <div className="auth-inline-actions">
                <button
                  type="button"
                  className="text-button"
                  onClick={() => {
                    clearFeedback();
                    setScreen("forgot-request");
                  }}
                >
                  Забравена парола?
                </button>
                <button
                  type="button"
                  className="text-button"
                  onClick={() => {
                    clearFeedback();
                    setScreen("register");
                  }}
                >
                  Нямаш акаунт?
                </button>
              </div>
              <button className="primary-button" type="submit">
                Вход
              </button>
            </form>
          ) : null}

          {screen === "register" ? (
            <form className="form-stack" onSubmit={handleRegister}>
              <label>
                Име и фамилия
                <input
                  value={form.name}
                  onChange={(event) => setForm({ ...form, name: event.target.value })}
                  autoComplete="name"
                  placeholder="Например: Елица Маринова"
                  required
                />
              </label>
              <label>
                Имейл
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) => setForm({ ...form, email: event.target.value })}
                  autoComplete="email"
                  placeholder="name@example.com"
                  required
                />
              </label>
              <div className="two-column">
                <label>
                  Град
                  <input
                    value={form.city}
                    onChange={(event) => setForm({ ...form, city: event.target.value })}
                    placeholder="Например: София"
                    required
                  />
                </label>
                <label>
                  Тип акаунт
                  <select
                    value={form.role}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        role: event.target.value as UserRole,
                        plan:
                          event.target.value === "consultant" ? form.plan : "free"
                      })
                    }
                  >
                    <option value="client">Потребител</option>
                    <option value="consultant">Консултант / ментор</option>
                  </select>
                </label>
              </div>
              {form.role === "consultant" ? (
                <label>
                  Тип профил
                  <select
                    value={form.consultantProfileType}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        consultantProfileType: event.target.value as ConsultantProfileType
                      })
                    }
                  >
                    <option value="consultant">Консултант</option>
                    <option value="mentor">Ментор</option>
                  </select>
                </label>
              ) : null}
              <label>
                Професионално headline
                <input
                  value={form.headline}
                  onChange={(event) => setForm({ ...form, headline: event.target.value })}
                  placeholder="Например: Product manager в преход към leadership роля"
                  required
                />
              </label>
              <label>
                Парола
                <input
                  type="password"
                  value={form.password}
                  onChange={(event) => setForm({ ...form, password: event.target.value })}
                  autoComplete="new-password"
                  placeholder="Минимум 8 символа"
                  minLength={8}
                  required
                />
              </label>

              {form.role === "consultant" ? (
                <div className="panel panel--subtle">
                  <strong>Безплатният публичен профил е активен в текущата версия.</strong>
                  <p>
                    Можеш да създадеш безплатен консултантски или менторски профил,
                    да добавиш специализации, снимка, CV и свободни слотове и да бъдеш
                    намиран в платформата. Разширените tiers остават за следващ етап.
                  </p>
                </div>
              ) : (
                <div className="panel panel--subtle">
                  <strong>Потребителският достъп е безплатен.</strong>
                  <p>
                    Потребителите не плащат членство на този етап и могат да създадат
                    профил, да разглеждат активните профили и да заявяват консултации.
                  </p>
                </div>
              )}

              <div className="panel panel--subtle">
                <strong>Какво включва</strong>
                <ul className="feature-list">
                  {planFeatures.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>

              {isPro ? (
                <>
                  <div className="choice-grid">
                    {(["monthly", "yearly"] as MockBillingCycle[]).map((cycle) => (
                      <button
                        type="button"
                        key={cycle}
                        className={`choice-card ${
                          form.billingCycle === cycle ? "choice-card--active" : ""
                        }`}
                        onClick={() =>
                          setForm({ ...form, billingCycle: cycle })
                        }
                      >
                        <span className={form.billingCycle === cycle ? "status-badge" : "plan-pill"}>
                          {cycle === "monthly" ? "Месечно" : "Годишно"}
                        </span>
                        <strong>{formatEuro(getMockProPrice(form.role, cycle))}</strong>
                        <p>
                          {cycle === "monthly"
                            ? "Гъвкаво месечно членство."
                            : "Годишно членство с по-дълъг хоризонт."}
                        </p>
                      </button>
                    ))}
                  </div>

                  <div className="two-column">
                    <label>
                      Име върху карта
                      <input
                        value={form.cardName}
                        onChange={(event) =>
                          setForm({ ...form, cardName: event.target.value })
                        }
                        placeholder="ELITSA MARINOVA"
                        required={isPro}
                      />
                    </label>
                    <label>
                      Номер на карта
                      <input
                        value={form.cardNumber}
                        onChange={(event) =>
                          setForm({ ...form, cardNumber: event.target.value })
                        }
                        placeholder="4242 4242 4242 4242"
                        required={isPro}
                      />
                    </label>
                  </div>

                  <div className="three-column">
                    <label>
                      Валидност
                      <input
                        value={form.expiry}
                        onChange={(event) =>
                          setForm({ ...form, expiry: event.target.value })
                        }
                        placeholder="12/29"
                        required={isPro}
                      />
                    </label>
                    <label>
                      CVC
                      <input
                        value={form.cvc}
                        onChange={(event) => setForm({ ...form, cvc: event.target.value })}
                        placeholder="123"
                        required={isPro}
                      />
                    </label>
                    <label className="checkbox-row">
                      <input
                        type="checkbox"
                        checked={form.acceptSubscription}
                        onChange={(event) =>
                          setForm({
                            ...form,
                            acceptSubscription: event.target.checked
                          })
                        }
                      />
                      <span>Потвърждавам избора на членство</span>
                    </label>
                  </div>
                </>
              ) : null}

              <p className="form-note">
                След регистрация ще продължиш директно към профила си, настройките и
                следващите стъпки в CareerLane.
              </p>
              <div className="panel panel--subtle">
                <strong>Избрано членство</strong>
                <p>{registrationSummary}</p>
                {isPro ? (
                  <p>
                    {formatEuro(planPrice)} / {form.billingCycle === "monthly" ? "месец" : "година"}
                  </p>
                ) : null}
              </div>
              <button className="primary-button" type="submit" disabled={!canRegister}>
                Създай профил
              </button>
            </form>
          ) : null}

          {screen === "confirm" ? (
            <form className="form-stack auth-state-panel" onSubmit={handleConfirm}>
              <div className="auth-state-header">
                <h2>Потвърждение на регистрацията</h2>
                <button
                  type="button"
                  className="text-button"
                  onClick={() => {
                    clearFeedback();
                    setScreen("register");
                  }}
                >
                  Назад
                </button>
              </div>
              <label>
                Имейл
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) => setForm({ ...form, email: event.target.value })}
                  required
                />
              </label>
              <label>
                Код за потвърждение
                <input
                  value={form.code}
                  onChange={(event) => setForm({ ...form, code: event.target.value })}
                  placeholder="Въведи получения код"
                  required
                />
              </label>
              <label>
                Парола
                <input
                  type="password"
                  value={form.password}
                  onChange={(event) => setForm({ ...form, password: event.target.value })}
                  autoComplete="current-password"
                  placeholder="Въведи паролата, с която се регистрира"
                  required
                />
              </label>
              <button className="primary-button" type="submit">
                Потвърди и влез
              </button>
            </form>
          ) : null}

          {screen === "forgot-request" ? (
            <form className="form-stack auth-state-panel" onSubmit={handlePasswordResetRequest}>
              <div className="auth-state-header">
                <h2>Забравена парола</h2>
                <button
                  type="button"
                  className="text-button"
                  onClick={() => {
                    clearFeedback();
                    setScreen("login");
                  }}
                >
                  Назад към вход
                </button>
              </div>
              <label>
                Имейл
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) => setForm({ ...form, email: event.target.value })}
                  autoComplete="email"
                  placeholder="name@example.com"
                  required
                />
              </label>
              <button className="primary-button" type="submit">
                Изпрати код
              </button>
            </form>
          ) : null}

          {screen === "forgot-confirm" ? (
            <form className="form-stack auth-state-panel" onSubmit={handlePasswordResetConfirm}>
              <div className="auth-state-header">
                <h2>Нова парола</h2>
                <button
                  type="button"
                  className="text-button"
                  onClick={() => {
                    clearFeedback();
                    setScreen("login");
                  }}
                >
                  Назад към вход
                </button>
              </div>
              <label>
                Имейл
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) => setForm({ ...form, email: event.target.value })}
                  autoComplete="email"
                  required
                />
              </label>
              <label>
                Код
                <input
                  value={form.code}
                  onChange={(event) => setForm({ ...form, code: event.target.value })}
                  required
                />
              </label>
              <label>
                Нова парола
                <input
                  type="password"
                  value={form.newPassword}
                  onChange={(event) => setForm({ ...form, newPassword: event.target.value })}
                  autoComplete="new-password"
                  placeholder="Минимум 8 символа"
                  minLength={8}
                  required
                />
              </label>
              <button className="primary-button" type="submit">
                Запази новата парола
              </button>
            </form>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function DashboardPage() {
  const { user, token, loading } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [consultantProfile, setConsultantProfile] = useState<ConsultantProfile | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth?redirect=/dashboard");
    }
  }, [loading, navigate, user]);

  useEffect(() => {
    if (!token) {
      return;
    }

    let mounted = true;

    Promise.all([
      api.getMyProfile(token),
      api.listBookings(token),
      api
        .getMyConsultantProfile(token)
        .then((value) => value)
        .catch(() => null)
    ])
      .then(([nextProfile, nextBookings, nextConsultantProfile]) => {
        if (!mounted) {
          return;
        }

        setProfile(nextProfile);
        setBookings(nextBookings);
        setConsultantProfile(nextConsultantProfile);
      })
      .catch((value) => {
        if (mounted) {
          setError(value instanceof Error ? value.message : "Неуспешно зареждане на таблото.");
        }
      });

    return () => {
      mounted = false;
    };
  }, [token]);

  if (loading || !user) {
    return (
      <section className="section">
        <div className="container">
          <div className="panel">Зареждаме таблото...</div>
        </div>
      </section>
    );
  }

  if (!profile) {
    return (
      <section className="section">
        <div className="container">
          {error ? (
            <div className="panel panel--error">{error}</div>
          ) : (
            <div className="panel">Зареждаме профила...</div>
          )}
        </div>
      </section>
    );
  }

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");

    const formData = new FormData(event.currentTarget);

    try {
      const updated = await api.updateMyProfile(token, {
        name: String(formData.get("name") || ""),
        city: String(formData.get("city") || ""),
        occupation: String(formData.get("occupation") || ""),
        age: Number(formData.get("age") || 0) || null,
        headline: String(formData.get("headline") || ""),
        bio: String(formData.get("bio") || ""),
        interests: parseListValue(formData.get("interests")),
        keywords: parseListValue(formData.get("keywords")),
        goals: String(formData.get("goals") || ""),
        preferredSessionModes: parseListValue(formData.get("preferredSessionModes")),
        plan: profile.plan
      });
      setProfile(updated);
      setMessage("Профилът е записан.");
    } catch (value) {
      setError(value instanceof Error ? value.message : "Неуспешно записване.");
    }
  }

  async function uploadCv(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");

    const formData = new FormData(event.currentTarget);
    const file = formData.get("cv") as File | null;

    if (!file || !file.name) {
      setError("Избери файл за качване.");
      return;
    }

    try {
      const result = await api.createCvUpload(token, file);

      if (result.uploadUrl) {
        await fetch(result.uploadUrl, {
          method: "PUT",
          headers: {
            "Content-Type": file.type || "application/octet-stream"
          },
          body: file
        });
      }

      const updated = await api.updateMyProfile(token, {
        cvDocument: result.document as UploadedDocument
      });

      setProfile(updated);
      setMessage("Основният документ е обновен.");
      event.currentTarget.reset();
    } catch (value) {
      setError(value instanceof Error ? value.message : "Неуспешно качване.");
    }
  }

  async function saveConsultantProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");

    try {
      const formData = new FormData(event.currentTarget);
      const availability = String(formData.get("availability") || "")
        .split(/\n|,/)
        .map((item) => item.trim())
        .filter(Boolean);

      const updated = await api.updateMyConsultantProfile(token, {
        slug: String(formData.get("slug") || consultantProfile?.slug || ""),
        name: String(formData.get("displayName") || consultantProfile?.name || ""),
        profileType: String(
          formData.get("consultantProfileType") || consultantProfile?.profileType || "consultant"
        ) as ConsultantProfileType,
        headline: String(
          formData.get("consultantHeadline") || consultantProfile?.headline || ""
        ),
        bio: String(formData.get("consultantBio") || consultantProfile?.bio || ""),
        city: String(formData.get("consultantCity") || consultantProfile?.city || ""),
        experienceYears: Number(
          formData.get("experienceYears") || consultantProfile?.experienceYears || 0
        ),
        languages: String(formData.get("languages") || "")
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        specializations: String(formData.get("specializations") || "")
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        sessionModes: String(formData.get("sessionModes") || "")
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        tags: String(formData.get("tags") || "")
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        avatarUrl: String(formData.get("avatarUrl") || consultantProfile?.avatarUrl || ""),
        heroUrl: String(formData.get("heroUrl") || consultantProfile?.heroUrl || ""),
        idealFor: parseListValue(formData.get("idealFor")),
        consultationTopics: parseListValue(formData.get("consultationTopics")),
        workApproach: String(formData.get("workApproach") || ""),
        sessionLengthMinutes: Number(formData.get("sessionLengthMinutes") || 60) || 60,
        availability
      });

      setConsultantProfile(updated);
      setMessage("Консултантският профил е обновен.");
    } catch (value) {
      setError(value instanceof Error ? value.message : "Неуспешно записване.");
    }
  }

  const membershipNote =
    profile.role === "consultant"
      ? "Публичният ти профил, свободните слотове и съвпаденията с професионалисти се управляват оттук."
      : "Профилът, документите и достъпът до кариерни консултанти се управляват оттук.";
  const profileCompletion = getProfileCompletion(profile, consultantProfile);
  const nextBooking = getNextBooking(bookings);
  const setupChecklist =
    profile.role === "consultant"
      ? [
          "Подреди headline и биографията си така, че да звучат уверено и конкретно.",
          "Добави езици, теми, подход и свободни слотове за по-лесно резервиране.",
          "Прегледай публичния си профил така, както ще го виждат потребителите."
        ]
      : [
          "Добави професия, интереси и ключови думи, за да имаш по-точно съвпадение.",
          "Качи основното си CV, за да държиш материалите си на едно място.",
          "Разгледай кариерните консултанти и запази следващата консултация директно от профила на консултанта."
        ];
  const dashboardMatchedConsultants =
    profile.role === "client"
      ? demoConsultants
          .map((consultant) => ({
            consultant,
            match: getConsultantMatch(profile, consultant)
          }))
          .sort((left, right) => (right.match?.score || 0) - (left.match?.score || 0))
          .slice(0, 3)
      : [];
  const dashboardMatchedProfessionals =
    profile.role === "consultant" && consultantProfile
      ? demoProfessionalProfiles
          .map((candidate) => ({
            profile: candidate,
            match: getProfessionalMatch(consultantProfile, candidate)
          }))
          .filter((item) => item.match)
          .sort((left, right) => (right.match?.score || 0) - (left.match?.score || 0))
          .slice(0, 3)
      : [];

  return (
    <section className="section">
      <div className="container dashboard-grid">
        <aside className="panel dashboard-sidebar">
          <p className="eyebrow">Табло</p>
          <h2>{profile.name}</h2>
          <p>{profile.headline || "Допълни кратък професионален текст за по-силно присъствие."}</p>

          <div className="dashboard-metrics">
            <div>
              <strong>{formatRoleLabel(profile.role)}</strong>
              <span>тип акаунт</span>
            </div>
            <div>
              <strong>{formatPlanLabel(profile.plan)}</strong>
              <span>активно членство</span>
            </div>
            <div>
              <strong>{bookings.length}</strong>
              <span>записани сесии</span>
            </div>
          </div>

          <div className="chip-row">
            <span className="chip chip--soft">{profile.email}</span>
            <span className="chip chip--soft">{profile.city || "Добави град"}</span>
          </div>

          <p className="form-note">{membershipNote}</p>
        </aside>

        <div className="dashboard-content">
          {message ? <div className="panel panel--success">{message}</div> : null}
          {error ? <div className="panel panel--error">{error}</div> : null}

          <section className="panel dashboard-overview">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Работно табло</p>
                <h2>Добре дошъл в профила си, {profile.name.split(" ")[0]}.</h2>
                <p className="section-heading__copy">
                  Това е централното място за профила ти, документите и следващите действия.
                  Подредихме го така, че да е ясно какво да направиш първо.
                </p>
              </div>
            </div>

            <div className="summary-grid">
              <article className="summary-card">
                <span className="plan-pill">Завършеност</span>
                <strong>{profileCompletion}%</strong>
                <p>
                  {profileCompletion >= 80
                    ? "Профилът ти вече изглежда добре структуриран."
                    : "Остава още малко, за да изглежда профилът ти по-пълен и професионален."}
                </p>
              </article>
              <article className="summary-card">
                <span className="plan-pill">Документи</span>
                <strong>{profile.cvDocument ? "1 активен файл" : "Няма качен файл"}</strong>
                <p>{getDocumentCapacityNote(profile.plan)}</p>
              </article>
              <article className="summary-card">
                <span className="plan-pill">Следваща сесия</span>
                <strong>{nextBooking ? formatDate(nextBooking.scheduledAt) : "Все още няма"}</strong>
                <p>
                  {nextBooking
                    ? `С ${nextBooking.consultantName}`
                    : "След като резервираш консултация, тя ще се покаже тук."}
                </p>
              </article>
              <article className="summary-card">
                <span className="plan-pill">Акаунт</span>
                <strong>{formatRoleLabel(profile.role)} · {formatPlanLabel(profile.plan)}</strong>
                <p>{getRolePlanSummary(profile.role, profile.plan)}</p>
              </article>
            </div>

            <div className="helper-grid">
              {setupChecklist.map((item) => (
                <article className="helper-card" key={item}>
                  <strong>Следваща стъпка</strong>
                  <p>{item}</p>
                </article>
              ))}
            </div>

            <div className="dashboard-actions">
              <Link
                className="primary-button"
                to={
                  profile.role === "consultant" && consultantProfile
                    ? `/consultants/${consultantProfile.slug}`
                    : "/users"
                }
              >
                {profile.role === "consultant" && consultantProfile
                  ? "Виж публичния профил"
                  : "Разгледай консултантите"}
              </Link>
              <Link
                className="ghost-button"
                to={profile.role === "consultant" ? "/consultants" : "/users"}
              >
                {profile.role === "consultant"
                  ? "Отвори страницата за консултанти"
                  : "Отвори страницата за потребители"}
              </Link>
            </div>
          </section>

          {profile.role === "client" ? (
            <section className="panel">
              <p className="eyebrow">Подходящи консултанти</p>
              <h2>CareerLane подрежда тези профили най-близо до твоите цели</h2>
              <div className="info-grid">
                {dashboardMatchedConsultants.map(({ consultant, match }) => (
                  <article className="info-card" key={consultant.consultantId}>
                    <span className={match ? "status-badge status-badge--success" : "plan-pill"}>
                      {match ? `${match.score}% съвпадение` : "Профил"}
                    </span>
                    <h3>{consultant.name}</h3>
                    <p>{consultant.headline}</p>
                    <p>{match?.note || "Подходящ консултант според профила ти."}</p>
                    <Link className="ghost-button" to={`/consultants/${consultant.slug}`}>
                      Виж профила
                    </Link>
                  </article>
                ))}
              </div>
            </section>
          ) : null}

          {profile.role === "consultant" && consultantProfile ? (
            <section className="panel">
              <p className="eyebrow">Подходящи професионалисти</p>
              <h2>Тези профили са най-близо до темите и начина ти на работа</h2>
              <div className="info-grid">
                {dashboardMatchedProfessionals.map(({ profile: candidate, match }) => (
                  <article className="info-card" key={candidate.userId}>
                    <span className="status-badge status-badge--success">
                      {match ? `${match.score}% съвпадение` : "Профил"}
                    </span>
                    <h3>{candidate.name}</h3>
                    <p>{candidate.headline}</p>
                    <p>{match?.note || "Подходящ професионален профил за темите ти."}</p>
                  </article>
                ))}
              </div>
            </section>
          ) : null}

          <form className="panel form-stack" onSubmit={saveProfile}>
            <QuestionFlowIntro
              eyebrow="Профил за съвпадение"
              title="Подреди профила си през няколко ясни въпроса."
              description="Това е по-чист начин да попълниш информацията си. Можеш да пишеш свободно или да използваш готовите подсказки, за да изградиш профила по-бързо."
              completion={profileCompletion}
            />
            <div className="question-grid">
              <QuestionBlock
                step="01"
                title="Кой си в момента?"
                hint="Името, градът и ролята ти дават базов контекст за съвпадението."
              >
                <div className="two-column">
                  <label>
                    Име
                    <input
                      name="name"
                      defaultValue={profile.name}
                      placeholder="Име и фамилия"
                      required
                    />
                  </label>
                  <label>
                    Град
                    <input
                      name="city"
                      defaultValue={profile.city || ""}
                      placeholder="Например: София"
                    />
                  </label>
                </div>
                <div className="two-column">
                  <label>
                    Професия / роля
                    <input
                      name="occupation"
                      defaultValue={profile.occupation || ""}
                      placeholder="Например: Product manager"
                    />
                  </label>
                  <label>
                    Възраст
                    <input
                      name="age"
                      type="number"
                      min="16"
                      defaultValue={profile.age || ""}
                      placeholder="Например: 32"
                    />
                  </label>
                </div>
                <SuggestionPills
                  label="Бърз старт"
                  fieldName="occupation"
                  mode="replace"
                  options={[
                    "Product manager",
                    "Маркетинг специалист",
                    "Software engineer",
                    "HR business partner"
                  ]}
                />
              </QuestionBlock>

              <QuestionBlock
                step="02"
                title="Към каква следваща стъпка се движиш?"
                hint="Заглавието и текущата цел помагат на CareerLane да изведе по-подходящите профили."
              >
                <label>
                  Профилно заглавие
                  <input
                    name="headline"
                    defaultValue={profile.headline || ""}
                    placeholder="Например: Product manager в преход към leadership роля"
                    required
                  />
                </label>
                <SuggestionPills
                  label="Примерни посоки"
                  fieldName="headline"
                  mode="replace"
                  options={[
                    "Product manager в преход към leadership роля",
                    "Маркетинг специалист, подготвящ международен преход",
                    "Софтуерен инженер, ориентиран към senior позиции"
                  ]}
                />
                <label>
                  Какво търсиш в момента
                  <textarea
                    name="goals"
                    rows={4}
                    defaultValue={profile.goals || ""}
                    placeholder="Например: Искам помощ с CV, интервю подготовка и смяна на посоката."
                  />
                </label>
                <SuggestionPills
                  label="Често търсени теми"
                  fieldName="goals"
                  mode="replace"
                  options={[
                    "Търся помощ с CV, LinkedIn и интервю подготовка за следващата си роля.",
                    "Искам да подредя стратегия за кариерен преход и по-силно позициониране.",
                    "Търся по-ясна посока за leadership роля и подготовка за разговори с работодатели."
                  ]}
                />
              </QuestionBlock>

              <QuestionBlock
                step="03"
                title="Какъв е професионалният ти контекст?"
                hint="Краткият разказ за опита ти дава повече яснота на консултантите."
                wide
              >
                <label>
                  Професионално описание
                  <textarea
                    name="bio"
                    rows={5}
                    defaultValue={profile.bio || ""}
                    placeholder="Разкажи накратко за посоката си, опита си и какво търсиш."
                    required
                  />
                </label>
                <SuggestionPills
                  label="Подсказки за тона"
                  fieldName="bio"
                  mode="replace"
                  options={[
                    "Имам няколко години опит в динамична среда и търся по-ясно позициониране за следващата роля.",
                    "Работя в международен контекст и искам по-силен профил за нова кариерна стъпка.",
                    "Искам да представя по-ясно опита си и да подготвя уверен разказ за интервюта и кандидатстване."
                  ]}
                />
              </QuestionBlock>

              <QuestionBlock
                step="04"
                title="Кои теми описват най-добре търсенето ти?"
                hint="Използвай интереси, ключови думи и предпочитан формат, за да направиш съвпадението по-точно."
              >
                <div className="two-column">
                  <label>
                    Интереси
                    <input
                      name="interests"
                      defaultValue={(profile.interests || []).join(", ")}
                      placeholder="Leadership roles, international teams, salary negotiation"
                    />
                  </label>
                  <label>
                    Ключови думи
                    <input
                      name="keywords"
                      defaultValue={(profile.keywords || []).join(", ")}
                      placeholder="Product, leadership, career transition"
                    />
                  </label>
                </div>
                <label>
                  Предпочитан формат
                  <input
                    name="preferredSessionModes"
                    defaultValue={(profile.preferredSessionModes || []).join(", ")}
                    placeholder="Онлайн, В офис"
                  />
                </label>
                <SuggestionPills
                  label="Добави теми"
                  fieldName="interests"
                  options={[
                    "Leadership roles",
                    "Career transition",
                    "Interview preparation",
                    "Salary negotiation"
                  ]}
                />
                <SuggestionPills
                  label="Добави ключови думи"
                  fieldName="keywords"
                  options={[
                    "Product",
                    "Leadership",
                    "International teams",
                    "Promotion"
                  ]}
                />
                <SuggestionPills
                  label="Предпочитан формат"
                  fieldName="preferredSessionModes"
                  options={["Онлайн", "В офис", "Хибридно"]}
                />
              </QuestionBlock>
            </div>
            <div className="question-form__footer">
              <p className="form-note">
                Подреденият профил прави търсенето по-ясно и съвпаденията по-полезни.
              </p>
              <button className="primary-button" type="submit">
                Запази профила
              </button>
            </div>
          </form>

          <form className="panel form-stack" onSubmit={uploadCv}>
            <h2>Основен документ</h2>
            <p className="section-caption">
              Дръж основния си документ на едно място. Това улеснява подготовката преди
              консултации и следващи кандидатствания.
            </p>
            <p className="form-note">
              {getDocumentCapacityNote(profile.plan)}
            </p>
            <label>
              Качи CV
              <input name="cv" type="file" />
            </label>
            {profile.cvDocument ? (
              <div className="panel">
                Активен документ: <strong>{profile.cvDocument.fileName}</strong>
              </div>
            ) : null}
            <button className="primary-button" type="submit">
              Качи документ
            </button>
          </form>

          {profile.role === "consultant" ? (
            <form className="panel form-stack" onSubmit={saveConsultantProfile}>
              <QuestionFlowIntro
                eyebrow="Консултантски профил"
                title="Подреди публичния си профил през няколко ясни въпроса."
                description="Така профилът изглежда по-сериозно, по-подредено и по-лесно води до резервация. Подсказките под въпросите ти помагат да попълниш по-бързо основните секции."
                completion={profileCompletion}
              />
              <div className="question-grid">
                <QuestionBlock
                  step="01"
                  title="Как изглеждаш публично?"
                  hint="Името, slug-ът, заглавието и градът изграждат първото впечатление."
                >
                  <div className="two-column">
                    <label>
                      Slug
                      <input
                        name="slug"
                        defaultValue={consultantProfile?.slug || ""}
                        placeholder="ivan-petrov"
                        required
                      />
                    </label>
                    <label>
                      Име за профила
                      <input
                        name="displayName"
                        defaultValue={consultantProfile?.name || profile.name}
                        required
                      />
                    </label>
                  </div>
                  <div className="two-column">
                    <label>
                      Тип профил
                      <select
                        name="consultantProfileType"
                        defaultValue={consultantProfile?.profileType || "consultant"}
                      >
                        <option value="consultant">Консултант</option>
                        <option value="mentor">Ментор</option>
                      </select>
                    </label>
                    <label>
                      Град
                      <input
                        name="consultantCity"
                        defaultValue={consultantProfile?.city || ""}
                        placeholder="Например: София"
                        required
                      />
                    </label>
                    <label>
                      Години опит
                      <input
                        name="experienceYears"
                        type="number"
                        min="0"
                        defaultValue={consultantProfile?.experienceYears || 1}
                      />
                    </label>
                  </div>
                  <div className="two-column">
                    <label>
                      Линк към профилна снимка
                      <input
                        name="avatarUrl"
                        defaultValue={consultantProfile?.avatarUrl || ""}
                        placeholder="https://..."
                      />
                    </label>
                    <label>
                      Линк към снимка за корицата
                      <input
                        name="heroUrl"
                        defaultValue={consultantProfile?.heroUrl || ""}
                        placeholder="https://..."
                      />
                    </label>
                  </div>
                  <label>
                    Заглавие
                    <input
                      name="consultantHeadline"
                      defaultValue={consultantProfile?.headline || ""}
                      placeholder="Например: Стратег за leadership преходи и executive позициониране"
                      required
                    />
                  </label>
                  <SuggestionPills
                    label="Стартови идеи"
                    fieldName="consultantHeadline"
                    mode="replace"
                    options={[
                      "Консултант за leadership преходи и executive позициониране",
                      "Кариерен консултант за интервю подготовка и професионално представяне",
                      "Консултант по кариерни преходи и международно позициониране"
                    ]}
                  />
                </QuestionBlock>

                <QuestionBlock
                  step="02"
                  title="С кого работиш и по какви теми?"
                  hint="Тези отговори определят как ще бъдеш намиран в CareerLane."
                >
                  <label>
                    Специализации
                    <input
                      name="specializations"
                      defaultValue={consultantProfile?.specializations.join(", ") || ""}
                      placeholder="Executive CV, интервю подготовка, leadership"
                      required
                    />
                  </label>
                  <label>
                    Основни теми на консултацията
                    <input
                      name="consultationTopics"
                      defaultValue={
                        consultantProfile ? getConsultationTopics(consultantProfile).join(", ") : ""
                      }
                      placeholder="Кариерна стратегия, CV review, interview preparation"
                    />
                  </label>
                  <label>
                    Подходящо за
                    <input
                      name="idealFor"
                      defaultValue={
                        consultantProfile ? getConsultantIdealFor(consultantProfile).join(", ") : ""
                      }
                      placeholder="Mid-senior professionals, leadership roles, career transition"
                    />
                  </label>
                  <SuggestionPills
                    label="Добави специализации"
                    fieldName="specializations"
                    options={[
                      "Executive CV",
                      "Interview preparation",
                      "Leadership",
                      "Career transition"
                    ]}
                  />
                  <SuggestionPills
                    label="Добави теми"
                    fieldName="consultationTopics"
                    options={[
                      "Кариерна стратегия",
                      "LinkedIn позициониране",
                      "Интервю подготовка",
                      "Executive CV"
                    ]}
                  />
                  <SuggestionPills
                    label="Подходящо за"
                    fieldName="idealFor"
                    options={[
                      "Mid-senior professionals",
                      "Leadership moves",
                      "Career transition",
                      "International roles"
                    ]}
                  />
                </QuestionBlock>

                <QuestionBlock
                  step="03"
                  title="Как протича работата с теб?"
                  hint="Добрият консултантски профил обяснява ясно процеса, а не само изброява услуги."
                  wide
                >
                  <label>
                    Биография
                    <textarea
                      name="consultantBio"
                      rows={5}
                      defaultValue={consultantProfile?.bio || ""}
                      placeholder="Опиши с кого работиш, по какви теми и какъв резултат постигате."
                      required
                    />
                  </label>
                  <label>
                    Работен подход
                    <textarea
                      name="workApproach"
                      rows={4}
                      defaultValue={consultantProfile?.workApproach || ""}
                      placeholder="Например: Първо подреждаме целите, после профила и подготовката."
                    />
                  </label>
                  <SuggestionPills
                    label="Примерен подход"
                    fieldName="workApproach"
                    mode="replace"
                    options={[
                      "Първо подреждаме целта и текущия профил, след това работим върху позиционирането и подготовката за следващата стъпка.",
                      "Работя на етапи: анализ на профила, конкретни насоки и практическа подготовка за разговори и кандидатстване.",
                      "Всяка консултация започва с ясен контекст и завършва с конкретен план за действие."
                    ]}
                  />
                </QuestionBlock>

                <QuestionBlock
                  step="04"
                  title="Как и кога могат да те резервират?"
                  hint="Езиците, форматът на работа, продължителността и свободните слотове завършват профила."
                >
                  <div className="two-column">
                    <label>
                      Езици
                      <input
                        name="languages"
                        defaultValue={consultantProfile?.languages.join(", ") || ""}
                        placeholder="Български, English"
                        required
                      />
                    </label>
                    <label>
                      Формати на работа
                      <input
                        name="sessionModes"
                        defaultValue={consultantProfile?.sessionModes.join(", ") || ""}
                        placeholder="Онлайн, В офис"
                      />
                    </label>
                  </div>
                  <div className="two-column">
                    <label>
                      Тагове
                      <input
                        name="tags"
                        defaultValue={consultantProfile?.tags.join(", ") || ""}
                        placeholder="Leadership, Product, Promotions"
                      />
                    </label>
                    <label>
                      Продължителност на сесия
                      <input
                        name="sessionLengthMinutes"
                        type="number"
                        min="30"
                        step="15"
                        defaultValue={consultantProfile?.sessionLengthMinutes || 60}
                      />
                    </label>
                  </div>
                  <label>
                    Свободни слотове
                    <textarea
                      name="availability"
                      rows={5}
                      defaultValue={consultantProfile?.availability.join("\n") || ""}
                      placeholder="2026-03-25T09:00:00.000Z"
                      required
                    />
                  </label>
                  <SuggestionPills
                    label="Добави примерни слотове"
                    fieldName="availability"
                    mode="append-lines"
                    options={[
                      buildAvailabilityPreset(1, 9),
                      buildAvailabilityPreset(1, 14),
                      buildAvailabilityPreset(2, 11),
                      buildAvailabilityPreset(3, 16)
                    ]}
                  />
                </QuestionBlock>
              </div>
              <div className="question-form__footer">
                <p className="form-note">
                  Подреденият профил, ясен подход и налични часове правят резервирането по-лесно.
                </p>
                <button className="primary-button" type="submit">
                  Запази консултантския профил
                </button>
              </div>
            </form>
          ) : null}

          <section className="panel">
            <h2>Предстоящи сесии</h2>
            <p className="section-caption">
              Тук държиш всички заявки и потвърдени срещи на едно място.
            </p>
            {bookings.length === 0 ? (
              <div className="empty-state">
                <p>Все още няма заявки или потвърдени консултации.</p>
                <Link className="ghost-button" to={profile.role === "consultant" ? "/consultants" : "/users"}>
                  {profile.role === "consultant"
                    ? "Виж как изглежда списъкът"
                    : "Разгледай консултантите"}
                </Link>
              </div>
            ) : (
              <div className="booking-list">
                {bookings.map((booking) => (
                  <article className="booking-item" key={booking.bookingId}>
                    <div>
                      <strong>{booking.consultantName}</strong>
                      <p>{formatDate(booking.scheduledAt)}</p>
                    </div>
                    <span className={`status-badge status-badge--${booking.status}`}>
                      {formatBookingStatusLabel(booking.status)}
                    </span>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </section>
  );
}

function PlanSection({
  eyebrow,
  title,
  description,
  plans
}: {
  eyebrow: string;
  title: string;
  description: string;
  plans: MarketingPlan[];
}) {
  return (
    <section className="section">
      <div className="container">
        <div className="section-heading">
          <div>
            <p className="eyebrow">{eyebrow}</p>
            <h2>{title}</h2>
            <p className="section-heading__copy">{description}</p>
          </div>
        </div>

        <div className="pricing-grid">
          {plans.map((plan) => (
            <article
              className={`pricing-card ${plan.featured ? "pricing-card--featured" : ""}`}
              key={`${eyebrow}-${plan.name}`}
            >
              <span className={plan.featured ? "status-badge" : "plan-pill"}>
                {plan.badge}
              </span>
              <h3>{plan.name}</h3>
              {plan.price ? <strong>{plan.price}</strong> : null}
              <p className="plan-card__note">{plan.note}</p>
              <ul>
                {plan.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
              <Link className={plan.featured ? "primary-button" : "ghost-button"} to={plan.ctaTo}>
                {plan.ctaLabel}
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function ConsultantCard({
  consultant,
  match
}: {
  consultant: ConsultantProfile;
  match?: MatchInsight | null;
}) {
  return (
    <article className="consultant-card">
      <img src={resolvePublicUrl(consultant.heroUrl)} alt={consultant.name} />
      <div className="consultant-card__body">
        <div className="consultant-card__top">
          <div>
            <div className="chip-row consultant-card__status-row">
              <span className="plan-pill">
                {formatConsultantTypeLabel(getConsultantProfileType(consultant))}
              </span>
              <span className={consultant.featured ? "status-badge" : "plan-pill"}>
                {consultant.featured ? "Подбран профил" : "Активен профил"}
              </span>
              {match ? <span className="plan-pill">{match.score}% съвпадение</span> : null}
            </div>
            <h3>{consultant.name}</h3>
            <p>{consultant.headline}</p>
            {match ? <p className="consultant-card__match">{match.note}</p> : null}
          </div>
          <span className="rating-pill">{consultant.rating.toFixed(1)}</span>
        </div>

        <div className="chip-row">
          {consultant.specializations.slice(0, 2).map((item) => (
            <span className="chip" key={item}>
              {item}
            </span>
          ))}
        </div>

        <div className="consultant-card__meta">
          <span>{consultant.city}</span>
          <span>{consultant.experienceYears} години опит</span>
          <span>{consultant.reviewCount} мнения</span>
        </div>
        <div className="consultant-card__meta">
          <span>{consultant.sessionModes.join(" · ")}</span>
          <span>Свободен: {formatDate(consultant.nextAvailable)}</span>
        </div>

        <Link className="ghost-button" to={`/consultants/${consultant.slug}`}>
          Виж профила
        </Link>
      </div>
    </article>
  );
}

export function App() {
  return (
    <HashRouter>
      <AuthProvider>
        <AppShell />
      </AuthProvider>
    </HashRouter>
  );
}
