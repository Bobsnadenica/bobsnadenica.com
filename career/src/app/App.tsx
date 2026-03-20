import { FormEvent, useEffect, useMemo, useState } from "react";
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
import { demoConsultants } from "../lib/demo";
import {
  clearMockPreviewAccount,
  readMockPreviewAccount,
  writeMockPreviewAccount,
  type MockBillingCycle,
  type MockPreviewAccount,
  type MockSubscriptionStatus
} from "../lib/mock-preview";
import { resolvePublicUrl } from "../lib/url";
import type {
  Booking,
  ConsultantProfile,
  PlanTier,
  UploadedDocument,
  UserProfile,
  UserRole
} from "../lib/types";

const FREE_DIRECTORY_LIMIT = 6;
const PENDING_BOOTSTRAP_KEY = "careerdoc.pending-bootstrap";

type AuthScreen =
  | "login"
  | "register"
  | "confirm"
  | "forgot-request"
  | "forgot-confirm";

type MockSignupStep = "account" | "membership" | "checkout";

type MarketingPlan = {
  name: string;
  price: string;
  badge: string;
  featured?: boolean;
  note: string;
  points: string[];
  ctaLabel: string;
  ctaTo: string;
};

const userPlans: MarketingPlan[] = [
  {
    name: "Free",
    price: "0 €",
    badge: "Старт веднага",
    note: "Подходящ за първо кариерно подреждане и ориентиране в пазара.",
    points: [
        "Достъп до до 6 профила в каталога",
        "1 основен CV файл в профила",
        "Записване на консултации и история на сесиите"
      ],
    ctaLabel: "Тествай Free signup",
    ctaTo: "/preview-account"
  },
  {
    name: "Pro",
    price: "19 € / месец",
    badge: "Най-пълният достъп",
    featured: true,
    note: "За хора, които искат по-широк избор, по-добра подготовка и повече пространство.",
    points: [
        "Пълен достъп до целия каталог с консултанти",
        "Разширено място за CV, дипломи и портфолио",
        "Приоритетни слотове и по-бърз follow-up"
      ],
    ctaLabel: "Тествай Pro checkout",
    ctaTo: "/preview-account"
  }
];

const consultantPlans: MarketingPlan[] = [
  {
    name: "Free",
    price: "0 €",
    badge: "За старт",
    note: "Създай присъствие, публикувай експертизата си и започни да приемаш заявки.",
    points: [
        "Публичен профил с ключова специализация",
        "Свободни часове, езици и формати на работа",
        "Достъп до заявки от нови професионалисти"
      ],
    ctaLabel: "Тествай Free signup",
    ctaTo: "/preview-account"
  },
  {
    name: "Pro",
    price: "39 € / месец",
    badge: "Премиум присъствие",
    featured: true,
    note: "За консултанти, които искат по-силно позициониране и по-представителен профил.",
        points: [
        "По-видимо позициониране в каталога",
        "Разширен профил с повече секции и материали",
        "Приоритетна поддръжка и premium поток от нови запитвания"
      ],
    ctaLabel: "Тествай Pro subscription",
    ctaTo: "/preview-account"
  }
];

const homeJourney = [
  {
    step: "01",
    title: "За професионалисти",
    text: "Откриваш консултант по фокус, град, ниво на опит и стил на работа.",
    ctaLabel: "Разгледай потребителската страница",
    ctaTo: "/users"
  },
  {
    step: "02",
    title: "За консултанти",
    text: "Изграждаш професионално присъствие и публикуваш свободни часове без излишен шум.",
    ctaLabel: "Разгледай страницата за консултанти",
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

const aboutHighlights = [
  {
    value: `${demoConsultants.length}+`,
    label: "примерни консултантски профили в production каталога"
  },
  {
    value: "Free / Pro",
    label: "ясно разграничени планове за потребители и консултанти"
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
    text: "Регистрацията, входът, профилът и каталогът са подредени с минимално триене и без излишни технически детайли."
  }
] as const;

const faqItems = [
  {
    question: "Каква е разликата между Free и Pro за потребителите?",
    answer:
      "Free е подходящ за старт: базов профил, основен CV документ и достъп до подбрана част от каталога. Pro отключва целия каталог, повече пространство за документи и по-богат работен поток."
  },
  {
    question: "Могат ли консултантите да използват платформата безплатно?",
    answer:
      "Да. Консултантите могат да започнат с Free профил и да публикуват присъствие, специализации и свободни слотове. Pro е за по-силно позициониране и по-богат публичен профил."
  },
  {
    question: "Показват ли се публично консултантските тарифи?",
    answer:
      "Не. В текущата публична версия акцентът е върху профила, експертизата и свободните слотове, а не върху видими тарифи в каталога."
  },
  {
    question: "Как работи регистрацията и потвърждението?",
    answer:
      "Потвърждението се появява само след успешна регистрация. След кода за потвърждение профилът се довършва и потребителят влиза директно в таблото си."
  },
  {
    question: "Има ли forgot password процес?",
    answer:
      "Да. На страницата за вход има отделен поток за забравена парола с изпращане на код и въвеждане на нова парола."
  },
  {
    question: "Какви документи могат да се пазят в профила?",
    answer:
      "Free включва основен CV документ. Pro е подготвен за по-широк документен профил, включително дипломи, портфолио и допълнителни материали."
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
      "Free и Pro членствата имат различен обхват и видимост, описани в публичните страници на платформата.",
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
  return role === "consultant" ? "Консултант" : "Професионалист";
}

function formatPlanLabel(plan: PlanTier) {
  return plan === "pro" ? "Pro" : "Free";
}

function formatBookingStatusLabel(status: Booking["status"]) {
  if (status === "confirmed") return "Потвърдена";
  if (status === "cancelled") return "Отказана";
  return "Заявена";
}

function getMockProPrice(role: UserRole, billingCycle: MockBillingCycle) {
  const prices = {
    client: {
      monthly: 19,
      yearly: 190
    },
    consultant: {
      monthly: 39,
      yearly: 390
    }
  } as const;

  return prices[role][billingCycle];
}

function getMockPlanFeatures(role: UserRole, plan: PlanTier) {
  if (role === "consultant") {
    return plan === "pro"
      ? [
          "Премиум позициониране в каталога",
          "Разширен профил с повече секции",
          "Приоритетни нови запитвания",
          "По-представителна subscription визия"
        ]
      : [
          "Публичен профил за старт",
          "Основни специализации и езици",
          "Получаване на заявки",
          "Свободни слотове и работни формати"
        ];
  }

  return plan === "pro"
    ? [
        "Пълен каталог с консултанти",
        "Повече място за CV, дипломи и портфолио",
        "Mock subscription панел в таблото",
        "Разширен личен workspace preview"
      ]
    : [
        "Базов профил и основен CV документ",
        "Достъп до подбран каталог",
        "История на заявки и сесии",
        "Лесен старт без плащане"
      ];
}

function getMockStorageLabel(plan: PlanTier) {
  return plan === "pro" ? "6 файла и разширен архив" : "1 основен CV файл";
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
    Boolean((profile.headline || "").trim()),
    Boolean((profile.bio || "").trim()),
    Boolean(profile.cvDocument)
  ];

  const consultantChecks =
    profile.role === "consultant"
      ? [
          Boolean(consultantProfile?.headline.trim()),
          Boolean(consultantProfile?.bio.trim()),
          Boolean(consultantProfile?.specializations.length),
          Boolean(consultantProfile?.languages.length),
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
      ? "Pro консултантски профил с по-силно позициониране и premium присъствие."
      : "Free консултантски профил за старт с публично присъствие и заявки.";
  }

  return plan === "pro"
    ? "Pro потребителски акаунт с пълен каталог и по-широк документен профил."
    : "Free потребителски акаунт с базов профил и подбран достъп до каталога.";
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
                : pathname === "/preview-account"
                  ? "Mock signup"
                  : pathname === "/preview-dashboard"
                    ? "Mock табло"
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
      setProfile(null);
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

  return previewAccount;
}

function AppShell() {
  const { user, logout } = useAuth();
  const currentYear = new Date().getFullYear();
  const previewAccount = useMockPreviewSnapshot();

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
            <NavLink to="/about">За нас</NavLink>
            <NavLink to="/contact">Контакти</NavLink>
          </nav>

          <div className="site-header__actions">
            {user ? (
              <>
                <span className="user-chip">{user.name}</span>
                <Link className="ghost-button" to="/dashboard">
                  Табло
                </Link>
                <button className="ghost-button" onClick={() => logout()}>
                  Изход
                </button>
              </>
            ) : (
              <>
                <Link className="ghost-button" to={previewAccount ? "/preview-dashboard" : "/preview-account"}>
                  {previewAccount ? "Mock табло" : "Mock signup"}
                </Link>
                <Link className="ghost-button" to="/auth">
                  Вход / Регистрация
                </Link>
              </>
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
          <Route path="/preview-account" element={<MockSignupPage />} />
          <Route path="/preview-dashboard" element={<MockDashboardPage />} />
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

function HomePage() {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const featured = useMemo(
    () => demoConsultants.filter((item) => item.featured).slice(0, 4),
    []
  );
  const spotlight = featured[0] || demoConsultants[0];

  return (
    <>
      <section className="hero">
        <div className="container hero__grid">
          <div className="hero__copy">
            <p className="eyebrow">Професионална кариерна мрежа</p>
            <h1>По-представителна кариера, по-ясен избор на консултант и по-силен следващ ход.</h1>
            <p className="hero__lede">
              CareerLane свързва професионалисти с проверени консултанти в среда,
              създадена за доверие, добра презентация и ясно разграничение между Free и
              Pro достъп.
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
                Търси в каталога
              </button>
            </form>

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
                <strong>{demoConsultants.length} профила</strong>
                <span>подредени по специализация, опит и град</span>
              </div>
              <div>
                <strong>Free и Pro</strong>
                <span>ясно различени членства за двете роли</span>
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
              <span className="status-badge status-badge--success">Подбран консултант</span>
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
              <h2>Позиция за работодатели, академии и премиум кариерни програми.</h2>
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
              <p className="eyebrow">Подбран каталог</p>
              <h2>Профили, които изглеждат уверено още на първо отваряне.</h2>
            </div>
            <Link className="ghost-button" to="/users">
              Виж каталога за потребители
            </Link>
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
  const { profile, plan, loading: viewerLoading } = useViewerProfile();
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

  const visibleConsultants = useMemo(
    () => (plan === "pro" ? consultants : consultants.slice(0, FREE_DIRECTORY_LIMIT)),
    [consultants, plan]
  );
  const hiddenCount = Math.max(consultants.length - visibleConsultants.length, 0);
  const hasActiveFilters = Boolean(query || city);

  return (
    <>
      <section className="hero">
        <div className="container hero__grid">
          <div className="hero__copy">
            <p className="eyebrow">За потребители</p>
            <h1>Избор на консултант с по-добра видимост, повече контекст и ясни членства.</h1>
            <p className="hero__lede">
              Тази страница е фокусирана върху хората, които търсят консултант. Free
              членството е силен старт, а Pro отключва целия каталог и по-богато
              пространство за документи.
            </p>

            <div className="hero-stats">
              <div>
                <strong>{plan === "pro" ? "Пълен каталог" : `${FREE_DIRECTORY_LIMIT} профила`}</strong>
                <span>{plan === "pro" ? "видим за твоя акаунт" : "видими във Free режима"}</span>
              </div>
              <div>
                <strong>{plan === "pro" ? "Разширен архив" : "Базов профил"}</strong>
                <span>{plan === "pro" ? "CV, дипломи и портфолио" : "основен CV документ"}</span>
              </div>
              <div>
                <strong>{profile ? formatPlanLabel(plan) : "Гост достъп"}</strong>
                <span>{profile ? `Роля: ${formatRoleLabel(profile.role)}` : "влез за персонален достъп"}</span>
              </div>
            </div>
          </div>

          <aside className="hero__card">
            <div className="hero__card-top">
              <span className={plan === "pro" ? "status-badge" : "plan-pill"}>
                {plan === "pro" ? "Активен Pro достъп" : "Free достъп"}
              </span>
              <strong>{plan === "pro" ? "Виждаш целия каталог" : "Виждаш подбрана част от каталога"}</strong>
              <p>
                {plan === "pro"
                  ? "Профилът ти отключва всички консултанти, разширени документи и по-бързо планиране."
                  : "Pro добавя още профили за разглеждане, повече пространство за документи и по-пълен процес на работа."}
              </p>
            </div>
            <div className="hero__points">
              <div>
                <span>Показани профили</span>
                <strong>{visibleConsultants.length}</strong>
              </div>
              <div>
                <span>Още в Pro</span>
                <strong>{hiddenCount > 0 ? `+${hiddenCount}` : "Пълен достъп"}</strong>
              </div>
            </div>
            <Link className="primary-button" to="/auth?tab=register">
              {plan === "pro" ? "Отвори таблото" : "Отключи Pro"}
            </Link>
          </aside>
        </div>
      </section>

      <PlanSection
        eyebrow="Планове за потребители"
        title="Ясно разграничение между Free и Pro за хората, които търсят консултант."
        description="Разликата не е само в етикета. Pro дава по-голяма видимост в каталога и повече пространство за кариерните ти материали."
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
              <p className="eyebrow">Каталог за потребители</p>
              <h2>Филтрирай, сравнявай и разгледай профилите в професионален вид.</h2>
              <p className="section-heading__copy">
                Подбраният каталог е лесен за сканиране. Във Free виждаш част от профилите,
                а в Pro отключваш пълния списък и по-богато лично работно пространство.
              </p>
            </div>
          </div>

          <div className="filter-bar">
            <label>
              Ключова дума
              <input
                value={query}
                onChange={(event) =>
                  setSearchParams(
                    event.target.value || city
                      ? { q: event.target.value, city }
                      : {}
                  )
                }
                placeholder="Executive CV, интервю, leadership, кариерна промяна..."
              />
            </label>
            <label>
              Град
              <input
                value={city}
                onChange={(event) =>
                  setSearchParams(
                    query || event.target.value
                      ? { q: query, city: event.target.value }
                      : {}
                  )
                }
                placeholder="София, Берлин, Лондон, Виена"
              />
            </label>
          </div>

          <div className="filter-actions">
            <button
              className="ghost-button"
              type="button"
              onClick={() => setSearchParams({})}
              disabled={!hasActiveFilters}
            >
              Изчисти филтрите
            </button>
            <Link className="ghost-button" to={profile ? "/dashboard" : "/auth"}>
              {profile ? "Отвори моето табло" : "Влез за персонален достъп"}
            </Link>
          </div>

          {viewerLoading ? <div className="panel">Проверяваме достъпа на акаунта...</div> : null}
          {loading ? <div className="panel">Зареждаме консултантите...</div> : null}
          {error ? <div className="panel panel--error">{error}</div> : null}

          {!loading && !error && visibleConsultants.length === 0 ? (
            <div className="panel">Няма съвпадения за избраните филтри.</div>
          ) : null}

          <div className="consultant-grid">
            {visibleConsultants.map((consultant) => (
              <ConsultantCard key={consultant.consultantId} consultant={consultant} />
            ))}
          </div>

          {hiddenCount > 0 ? (
            <div className="panel unlock-panel">
              <p className="eyebrow">Pro видимост</p>
              <h2>Още {hiddenCount} профила чакат зад Pro достъпа.</h2>
              <p>
                Надгради, за да разгледаш целия каталог, да запазиш повече материали и да
                работиш с по-пълен личен профил.
              </p>
              <Link className="primary-button" to="/auth?tab=register">
                Активирай Pro
              </Link>
            </div>
          ) : null}
        </div>
      </section>
    </>
  );
}

function ConsultantsPage() {
  const showcase = demoConsultants.slice(0, 6);

  return (
    <>
      <section className="hero">
        <div className="container hero__grid">
          <div className="hero__copy">
            <p className="eyebrow">За консултанти</p>
            <h1>Профил, който изглежда сериозно и превръща интереса в реални заявки.</h1>
            <p className="hero__lede">
              Страницата за консултанти е отделена ясно от потребителската част. Тук
              акцентът е върху представянето, видимостта в каталога и разликата между Free
              и Pro профил.
            </p>

            <div className="hero-actions">
              <Link className="primary-button" to="/auth?tab=register">
                Създай консултантски профил
              </Link>
              <Link className="ghost-button" to="/users">
                Виж потребителската перспектива
              </Link>
            </div>

            <div className="hero-stats">
              <div>
                <strong>Free старт</strong>
                <span>без бариера за първоначално присъствие</span>
              </div>
              <div>
                <strong>Pro позициониране</strong>
                <span>за по-богат профил и по-висока видимост</span>
              </div>
              <div>
                <strong>Професионална визия</strong>
                <span>по-ясен профил, по-силно доверие</span>
              </div>
            </div>
          </div>

          <aside className="hero__card">
            <div className="hero__card-top">
              <span className="status-badge status-badge--success">Консултантски профил</span>
              <strong>Какво получаваш още от старт</strong>
              <p>
                Отделна страница за консултанти, публичен профил, свободни слотове и ясна
                презентация на специализацията ти.
              </p>
            </div>
            <div className="hero__points">
              <div>
                <span>Публичен профил</span>
                <strong>Да</strong>
              </div>
              <div>
                <span>Pro надграждане</span>
                <strong>Налично</strong>
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

      <PlanSection
        eyebrow="Планове за консултанти"
        title="Free присъствие за старт и Pro профил за по-силна видимост."
        description="Тук не показваме консултантски тарифи за сесии. Акцентът е върху качеството на профила и членството в платформата."
        plans={consultantPlans}
      />

      <section className="section section--alt">
        <div className="container journey-grid">
          <article className="journey-card">
            <span className="journey-card__step">01</span>
            <h3>Създаваш профил</h3>
            <p>Подреждаш специализация, град, езици, формати и ключова професионална история.</p>
          </article>
          <article className="journey-card">
            <span className="journey-card__step">02</span>
            <h3>Получаваш видимост</h3>
            <p>Потребителите разглеждат профила ти в отделния каталог за търсещи консултант.</p>
          </article>
            <article className="journey-card">
              <span className="journey-card__step">03</span>
              <h3>Надграждаш към Pro</h3>
              <p>При нужда от premium присъствие преминаваш към Pro профил с по-силно позициониране.</p>
            </article>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Мокъп на мрежата</p>
              <h2>Повече активни консултанти за реалистичен production каталог.</h2>
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
            <h2>Професионална структура, а не шумен каталог.</h2>
            <p>
              В основата на CareerLane са ясно разграничени роли, добра навигация и
              подредено представяне на профили, документи и следващи действия.
            </p>
            <div className="chip-row">
              <span className="chip">Trust-first UX</span>
              <span className="chip">Free / Pro модел</span>
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

function MockSignupPage() {
  const navigate = useNavigate();
  const existingPreview = useMemo(() => readMockPreviewAccount(), []);
  const [step, setStep] = useState<MockSignupStep>("account");
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    name: existingPreview?.name || "",
    email: existingPreview?.email || "",
    city: existingPreview?.city || "София",
    headline:
      existingPreview?.headline ||
      "Product manager в преход към по-видима международна роля",
    role: existingPreview?.role || ("client" as UserRole),
    plan: existingPreview?.plan || ("free" as PlanTier),
    billingCycle: existingPreview?.billingCycle || ("monthly" as MockBillingCycle),
    cardName: existingPreview?.name || "",
    cardNumber: existingPreview?.paymentLast4
      ? `4242 4242 4242 ${existingPreview.paymentLast4}`
      : "4242 4242 4242 4242",
    expiry: "12/29",
    cvc: "123",
    acceptMock: true
  });

  const featureList = useMemo(
    () => getMockPlanFeatures(form.role, form.plan),
    [form.plan, form.role]
  );
  const isPro = form.plan === "pro";
  const price = isPro ? getMockProPrice(form.role, form.billingCycle) : 0;
  const nextBillingAt = isPro ? buildMockNextBillingDate(form.billingCycle) : null;
  const roleLabel = form.role === "consultant" ? "Консултант" : "Потребител";
  const canSubmit = Boolean(
    form.name.trim() &&
      form.email.trim() &&
      form.city.trim() &&
      form.headline.trim() &&
      (!isPro ||
        (form.cardName.trim() &&
          form.cardNumber.trim() &&
          form.expiry.trim() &&
          form.cvc.trim() &&
          form.acceptMock))
  );

  function createPreviewAccount(status: MockSubscriptionStatus) {
    const paymentLast4 =
      isPro && form.cardNumber.trim()
        ? form.cardNumber.replace(/\D/g, "").slice(-4) || "4242"
        : null;

    const previewAccount: MockPreviewAccount = {
      name: form.name.trim(),
      email: form.email.trim(),
      role: form.role,
      plan: form.plan,
      city: form.city.trim(),
      headline: form.headline.trim(),
      billingCycle: form.billingCycle,
      subscriptionStatus: status,
      paymentLast4,
      startedAt: new Date().toISOString(),
      nextBillingAt: status === "active" ? nextBillingAt : null
    };

    writeMockPreviewAccount(previewAccount);
    return previewAccount;
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setMessage("");

    if (!canSubmit) {
      return;
    }

    createPreviewAccount(isPro ? "active" : "inactive");
    navigate("/preview-dashboard");
  }

  return (
    <>
      <section className="hero">
        <div className="container page-hero__grid">
          <div className="page-intro">
            <p className="eyebrow">Mock signup</p>
            <h1>Тествай account creation, Free / Pro избор и mock subscription без backend.</h1>
            <p className="hero__lede">
              Това е изцяло фронтенд preview поток. Нищо не се изпраща към backend и
              няма реално плащане. Целта е да видиш как ще изглеждат регистрацията,
              Pro checkout и subscription управлението в production визия.
            </p>

            <div className="mock-stepper">
              <button
                type="button"
                className={`step-pill ${step === "account" ? "step-pill--active" : ""}`}
                onClick={() => setStep("account")}
              >
                1. Account
              </button>
              <button
                type="button"
                className={`step-pill ${step === "membership" ? "step-pill--active" : ""}`}
                onClick={() => setStep("membership")}
              >
                2. Plan
              </button>
              <button
                type="button"
                className={`step-pill ${step === "checkout" ? "step-pill--active" : ""}`}
                onClick={() => setStep("checkout")}
              >
                3. {isPro ? "Checkout" : "Preview"}
              </button>
            </div>
          </div>

          <aside className="panel page-side-card mock-summary">
            <p className="eyebrow">Live summary</p>
            <h2>{form.plan === "pro" ? "Pro mock subscription" : "Free mock account"}</h2>
            <p>{getRolePlanSummary(form.role, form.plan)}</p>
            <div className="summary-grid">
              <article className="summary-card">
                <span className="plan-pill">Тип акаунт</span>
                <strong>{roleLabel}</strong>
                <p>{form.city}</p>
              </article>
              <article className="summary-card">
                <span className="plan-pill">Членство</span>
                <strong>{formatPlanLabel(form.plan)}</strong>
                <p>
                  {isPro
                    ? `${formatEuro(price)} / ${form.billingCycle === "monthly" ? "месец" : "година"}`
                    : "Без плащане"}
                </p>
              </article>
            </div>
            <ul className="feature-list">
              {featureList.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <div className="panel panel--subtle">
              <strong>Mock note</strong>
              <p>
                След завършване ще се отвори mock dashboard със subscription статус,
                документи и управляема Pro / Free визия.
              </p>
            </div>
          </aside>
        </div>
      </section>

      <section className="section">
        <div className="container mock-layout">
          <form className="panel-stack" onSubmit={handleSubmit}>
            <article className={`panel mock-panel ${step === "account" ? "mock-panel--active" : ""}`}>
              <div className="section-heading">
                <div>
                  <p className="eyebrow">Стъпка 1</p>
                  <h2>Основни данни за mock акаунта</h2>
                  <p className="section-heading__copy">
                    Използвай реалистични данни, за да видиш как изглежда onboarding flow.
                  </p>
                </div>
              </div>
              <div className="two-column">
                <label>
                  Име
                  <input
                    value={form.name}
                    onChange={(event) => setForm({ ...form, name: event.target.value })}
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
                    placeholder="name@example.com"
                    required
                  />
                </label>
              </div>
              <div className="two-column">
                <label>
                  Град
                  <input
                    value={form.city}
                    onChange={(event) => setForm({ ...form, city: event.target.value })}
                    placeholder="София"
                    required
                  />
                </label>
                <label>
                  Тип акаунт
                  <select
                    value={form.role}
                    onChange={(event) => setForm({ ...form, role: event.target.value as UserRole })}
                  >
                    <option value="client">Потребител</option>
                    <option value="consultant">Консултант</option>
                  </select>
                </label>
              </div>
              <label>
                Кратко headline
                <input
                  value={form.headline}
                  onChange={(event) => setForm({ ...form, headline: event.target.value })}
                  placeholder="Например: Product manager в преход към leadership роля"
                  required
                />
              </label>
              <div className="dashboard-actions">
                <button
                  className="ghost-button"
                  type="button"
                  onClick={() => setStep("membership")}
                >
                  Продължи към плановете
                </button>
                {existingPreview ? (
                  <button
                    className="ghost-button"
                    type="button"
                    onClick={() => {
                      clearMockPreviewAccount();
                      setMessage("Mock preview е изчистен.");
                    }}
                  >
                    Изчисти стария preview
                  </button>
                ) : null}
              </div>
            </article>

            <article className={`panel mock-panel ${step === "membership" ? "mock-panel--active" : ""}`}>
              <div className="section-heading">
                <div>
                  <p className="eyebrow">Стъпка 2</p>
                  <h2>Избор между Free и Pro</h2>
                  <p className="section-heading__copy">
                    Премини през реалистична визуализация на plan selection и feature
                    comparison.
                  </p>
                </div>
              </div>

              <div className="choice-grid">
                {(["free", "pro"] as PlanTier[]).map((plan) => {
                  const active = form.plan === plan;
                  const features = getMockPlanFeatures(form.role, plan);

                  return (
                    <button
                      type="button"
                      className={`choice-card ${active ? "choice-card--active" : ""}`}
                      key={plan}
                      onClick={() => {
                        setForm({ ...form, plan });
                        setStep("checkout");
                      }}
                    >
                      <span className={plan === "pro" ? "status-badge" : "plan-pill"}>
                        {plan === "pro" ? "Pro" : "Free"}
                      </span>
                      <strong>
                        {plan === "pro"
                          ? formatEuro(getMockProPrice(form.role, form.billingCycle))
                          : "0 €"}
                      </strong>
                      <p>
                        {plan === "pro"
                          ? "Mock subscription с checkout и billing управление."
                          : "Безплатен старт с основни възможности и без плащане."}
                      </p>
                      <ul className="feature-list">
                        {features.slice(0, 3).map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </button>
                  );
                })}
              </div>

              <div className="dashboard-actions">
                <button
                  className="ghost-button"
                  type="button"
                  onClick={() => setStep("account")}
                >
                  Назад
                </button>
                <button
                  className="ghost-button"
                  type="button"
                  onClick={() => setStep("checkout")}
                >
                  Продължи към {isPro ? "checkout" : "preview"}
                </button>
              </div>
            </article>

            <article className={`panel mock-panel ${step === "checkout" ? "mock-panel--active" : ""}`}>
              <div className="section-heading">
                <div>
                  <p className="eyebrow">Стъпка 3</p>
                  <h2>{isPro ? "Mock checkout и subscription" : "Mock account preview"}</h2>
                  <p className="section-heading__copy">
                    {isPro
                      ? "Визуализация на плащане, billing cycle и subscription summary без реална транзакция."
                      : "Free акаунтът се създава веднага и прескача checkout секцията."}
                  </p>
                </div>
              </div>

              {isPro ? (
                <>
                  <div className="choice-grid">
                    {(["monthly", "yearly"] as MockBillingCycle[]).map((cycle) => (
                      <button
                        type="button"
                        key={cycle}
                        className={`choice-card ${form.billingCycle === cycle ? "choice-card--active" : ""}`}
                        onClick={() => setForm({ ...form, billingCycle: cycle })}
                      >
                        <span className={form.billingCycle === cycle ? "status-badge" : "plan-pill"}>
                          {cycle === "monthly" ? "Месечно" : "Годишно"}
                        </span>
                        <strong>{formatEuro(getMockProPrice(form.role, cycle))}</strong>
                        <p>
                          {cycle === "monthly"
                            ? "По-гъвкава mock subscription визия."
                            : "По-завършен annual billing preview."}
                        </p>
                      </button>
                    ))}
                  </div>

                  <div className="two-column">
                    <label>
                      Име върху карта
                      <input
                        value={form.cardName}
                        onChange={(event) => setForm({ ...form, cardName: event.target.value })}
                        placeholder="ELITSA MARINOVA"
                        required={isPro}
                      />
                    </label>
                    <label>
                      Номер на карта
                      <input
                        value={form.cardNumber}
                        onChange={(event) => setForm({ ...form, cardNumber: event.target.value })}
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
                        onChange={(event) => setForm({ ...form, expiry: event.target.value })}
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
                        checked={form.acceptMock}
                        onChange={(event) =>
                          setForm({ ...form, acceptMock: event.target.checked })
                        }
                      />
                      <span>Разбирам, че това е mock checkout</span>
                    </label>
                  </div>

                  <div className="mock-billing-grid">
                    <article className="summary-card">
                      <span className="plan-pill">План</span>
                      <strong>{roleLabel} Pro</strong>
                      <p>{formatEuro(price)} / {form.billingCycle === "monthly" ? "месец" : "година"}</p>
                    </article>
                    <article className="summary-card">
                      <span className="plan-pill">Следващо подновяване</span>
                      <strong>{nextBillingAt ? formatDate(nextBillingAt) : "n/a"}</strong>
                      <p>Няма реално таксуване. Само UI preview.</p>
                    </article>
                  </div>
                </>
              ) : (
                <div className="panel panel--subtle">
                  <strong>Free account preview</strong>
                  <p>
                    След създаването ще видиш mock dashboard с базов профил, 1 активен CV
                    документ и подбран каталог с консултанти.
                  </p>
                </div>
              )}

              {message ? <div className="panel panel--success">{message}</div> : null}

              <div className="dashboard-actions">
                <button
                  className="ghost-button"
                  type="button"
                  onClick={() => setStep("membership")}
                >
                  Назад
                </button>
                <button className="primary-button" type="submit" disabled={!canSubmit}>
                  {isPro ? "Активирай mock Pro" : "Създай mock Free акаунт"}
                </button>
              </div>
            </article>
          </form>

          <aside className="panel page-side-card">
            <p className="eyebrow">Какво ще тестваш</p>
            <h2>Пълен front-end preview поток</h2>
            <ul className="page-list">
              <li>Регистрация с избор на роля и plan tier</li>
              <li>Mock payment / subscription визия за Pro</li>
              <li>Mock dashboard с активни features според плана</li>
              <li>Subscription management без backend интеграция</li>
            </ul>
            <Link className="ghost-button" to="/preview-dashboard">
              Виж текущия mock dashboard
            </Link>
          </aside>
        </div>
      </section>
    </>
  );
}

function MockDashboardPage() {
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
            <p className="eyebrow">Mock dashboard</p>
            <h2>Все още няма mock account.</h2>
            <p>
              Създай preview акаунт, за да тестваш как изглеждат Free / Pro features и
              subscription управлението.
            </p>
            <Link className="primary-button" to="/preview-account">
              Създай mock account
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

  const featureList = getMockPlanFeatures(account.role, account.plan);
  const price =
    account.plan === "pro" ? getMockProPrice(account.role, account.billingCycle) : 0;
  const visibleProfiles =
    account.plan === "pro" ? demoConsultants.length : FREE_DIRECTORY_LIMIT;
  const documentLabel = getMockStorageLabel(account.plan);
  const mockDocuments =
    account.plan === "pro"
      ? ["CV-2026.pdf", "Leadership-diploma.pdf", "Portfolio.pdf", "Case-study.pdf"]
      : ["CV-2026.pdf"];

  function upgradeToPro() {
    navigate("/preview-account");
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
      "Mock акаунтът беше върнат към Free."
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
        ? "Mock subscription е реактивиран."
        : "Mock subscription е маркиран като cancelled."
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
      "Mock billing информацията е обновена."
    );
  }

  return (
    <>
      <section className="hero">
        <div className="container page-hero__grid">
          <div className="page-intro">
            <p className="eyebrow">Mock dashboard</p>
            <h1>Преглед на Free / Pro акаунт, subscription status и отключени features.</h1>
            <p className="hero__lede">
              Това е фронтенд preview табло. Използвай го, за да видиш как ще изглежда
              акаунт след signup и как ще се визуализира subscription management за Pro.
            </p>
            <div className="hero-stats">
              <div>
                <strong>{formatRoleLabel(account.role)}</strong>
                <span>тип mock акаунт</span>
              </div>
              <div>
                <strong>{formatPlanLabel(account.plan)}</strong>
                <span>активно членство</span>
              </div>
              <div>
                <strong>{visibleProfiles}</strong>
                <span>видими профили в каталога</span>
              </div>
            </div>
          </div>

          <aside className="panel page-side-card">
            <p className="eyebrow">Account summary</p>
            <h2>{account.name}</h2>
            <p>{account.headline}</p>
            <div className="chip-row">
              <span className="chip chip--soft">{account.city}</span>
              <span className="chip chip--soft">{account.email}</span>
            </div>
            <div className="dashboard-actions">
              <Link className="ghost-button" to="/preview-account">
                Редактирай mock signup
              </Link>
              <button
                className="ghost-button"
                type="button"
                onClick={() => {
                  clearMockPreviewAccount();
                  setAccount(null);
                }}
              >
                Изчисти preview
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
              <span className="plan-pill">Каталог</span>
              <strong>{visibleProfiles === demoConsultants.length ? "Пълен достъп" : `${visibleProfiles} профила`}</strong>
              <p>{account.plan === "pro" ? "Отключен е целият каталог." : "Вижда се подбран каталог във Free режима."}</p>
            </article>
            <article className="summary-card">
              <span className="plan-pill">Документи</span>
              <strong>{documentLabel}</strong>
              <p>{account.plan === "pro" ? "Разширен документен профил." : "Базово пространство за един активен файл."}</p>
            </article>
            <article className="summary-card">
              <span className="plan-pill">Subscription</span>
              <strong>{account.plan === "pro" ? formatEuro(price) : "0 €"}</strong>
              <p>
                {account.plan === "pro"
                  ? `${account.billingCycle === "monthly" ? "Месечно" : "Годишно"} mock таксуване`
                  : "Без subscription"}
              </p>
            </article>
            <article className="summary-card">
              <span className="plan-pill">Статус</span>
              <strong>
                {account.plan === "pro"
                  ? account.subscriptionStatus === "active"
                    ? "Active"
                    : "Cancelled"
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
              <p className="eyebrow">Unlocked features</p>
              <h2>Какво вижда този mock акаунт</h2>
              <ul className="feature-list">
                {featureList.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>

            <article className="panel">
              <p className="eyebrow">Mock documents</p>
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

            <article className="panel">
              <p className="eyebrow">Actions</p>
              <h2>Промени mock състоянието</h2>
              <div className="dashboard-actions">
                {account.plan === "free" ? (
                  <button className="primary-button" type="button" onClick={upgradeToPro}>
                    Отиди към mock Pro checkout
                  </button>
                ) : (
                  <>
                    <button className="ghost-button" type="button" onClick={toggleSubscriptionStatus}>
                      {account.subscriptionStatus === "active"
                        ? "Маркирай като cancelled"
                        : "Реактивирай subscription"}
                    </button>
                    <button className="ghost-button" type="button" onClick={downgradeToFree}>
                      Върни към Free
                    </button>
                  </>
                )}
                <Link className="ghost-button" to="/users">
                  Виж каталога
                </Link>
              </div>
            </article>
          </div>

          <aside className="panel page-side-card">
            <p className="eyebrow">Mock billing</p>
            <h2>{account.plan === "pro" ? "Управление на subscription" : "Free акаунт"}</h2>
            {account.plan === "pro" ? (
              <form className="form-stack" onSubmit={saveBillingPreview}>
                <label>
                  Billing cycle
                  <select
                    value={billingForm.billingCycle}
                    onChange={(event) =>
                      setBillingForm({
                        ...billingForm,
                        billingCycle: event.target.value as MockBillingCycle
                      })
                    }
                  >
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </label>
                <label>
                  Card number
                  <input
                    value={billingForm.cardNumber}
                    onChange={(event) =>
                      setBillingForm({ ...billingForm, cardNumber: event.target.value })
                    }
                    placeholder="4242 4242 4242 4242"
                  />
                </label>
                <div className="panel panel--subtle">
                  <strong>Mock payment method</strong>
                  <p>Visa ending in {account.paymentLast4 || "4242"}</p>
                </div>
                <button className="primary-button" type="submit">
                  Запази mock subscription
                </button>
              </form>
            ) : (
              <div className="panel panel--subtle">
                <strong>Free status</strong>
                <p>
                  За да видиш mock checkout и billing детайли, премини през Pro signup preview.
                </p>
                <button className="primary-button" type="button" onClick={upgradeToPro}>
                  Тествай Pro subscription
                </button>
              </div>
            )}
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
  const [consultant, setConsultant] = useState<ConsultantProfile | null>(null);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [note, setNote] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

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

  const submitBooking = async (event: FormEvent) => {
    event.preventDefault();
    setMessage("");
    setError("");

    if (!user) {
      navigate(`/auth?redirect=${encodeURIComponent(`/consultants/${consultant.slug}`)}`);
      return;
    }

    try {
      await api.createBooking(token, {
        consultantId: consultant.consultantId,
        scheduledAt: selectedSlot,
        note
      });
      setMessage("Консултацията е заявена успешно. Ще я видиш и в таблото си.");
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
              <p className="eyebrow">Публичен профил</p>
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
            </div>
          </article>

          <aside className="booking-card">
            <span className="status-badge status-badge--success">Следващ свободен слот</span>
            <strong>{formatDate(consultant.nextAvailable)}</strong>
            <span>Работа в {consultant.sessionModes.join(" · ")}</span>
            <p>
              Профилът е подготвен за ясна презентация на експертизата, без публично
              показване на консултантски тарифи.
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
              <h2>Езици, формати и фокус</h2>
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
          </div>

          <form className="panel booking-panel" onSubmit={submitBooking}>
            <h2>Заяви консултация</h2>
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

            {message ? <div className="panel panel--success">{message}</div> : null}
            {error ? <div className="panel panel--error">{error}</div> : null}

            <button className="primary-button" type="submit">
              {user ? "Изпрати заявка" : "Влез и изпрати заявка"}
            </button>
          </form>
        </div>
      </section>
    </>
  );
}

function AuthPage() {
  const {
    register,
    confirm,
    login,
    requestPasswordReset,
    completePasswordReset,
    configured,
    user,
    loading
  } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const redirect = params.get("redirect") || "/dashboard";
  const initialTab = params.get("tab") === "register" ? "register" : "login";

  const [screen, setScreen] = useState<AuthScreen>(initialTab);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "client" as UserRole,
    plan: "free" as PlanTier,
    code: "",
    newPassword: ""
  });

  useEffect(() => {
    setScreen(initialTab);
  }, [initialTab]);

  if (!loading && user) {
    return <Navigate to={redirect} replace />;
  }

  const activeTab = screen === "register" || screen === "confirm" ? "register" : "login";
  const authStageTitle =
    screen === "register"
      ? "Създаваш нов акаунт"
      : screen === "confirm"
        ? "Потвърждаваш регистрацията"
        : screen === "forgot-request"
          ? "Изпращаш заявка за нова парола"
          : screen === "forgot-confirm"
            ? "Задаваш нова парола"
            : "Влизаш в профила си";
  const authStageDescription =
    screen === "register"
      ? "Избираш тип акаунт и членство, а платформата подготвя началния ти профил."
      : screen === "confirm"
        ? "След кода за потвърждение влизаш директно и довършваш профила от таблото."
        : screen === "forgot-request"
          ? "Изпращаме код само към посочения имейл за сигурно възстановяване."
          : screen === "forgot-confirm"
            ? "С новата парола ще можеш да влезеш веднага в таблото си."
            : "Входът е кратък и ясен, а при нужда имаш отделен forgot password поток.";
  const registrationSummary = getRolePlanSummary(form.role, form.plan);

  function clearFeedback() {
    setMessage("");
    setError("");
  }

  async function finalizeBootstrap(token: string) {
    const bootstrapRaw = window.sessionStorage.getItem(PENDING_BOOTSTRAP_KEY);

    if (!bootstrapRaw) {
      return;
    }

    const bootstrap = JSON.parse(bootstrapRaw);
    await api.bootstrapUser(token, bootstrap);
    window.sessionStorage.removeItem(PENDING_BOOTSTRAP_KEY);
  }

  async function handleRegister(event: FormEvent) {
    event.preventDefault();
    clearFeedback();

    try {
      await register({
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
        plan: form.plan
      });

      window.sessionStorage.setItem(
        PENDING_BOOTSTRAP_KEY,
        JSON.stringify({
          email: form.email,
          name: form.name,
          role: form.role,
          plan: form.plan
        })
      );

      setScreen("confirm");
      setMessage(
        configured
          ? "Изпратихме код за потвърждение на имейла ти. Потвърди регистрацията, за да завършим профила."
          : "Потвърди регистрацията си с код 123456 и ще довършим профила автоматично."
      );
    } catch (value) {
      setError(value instanceof Error ? value.message : "Неуспешна регистрация.");
    }
  }

  async function handleConfirm(event: FormEvent) {
    event.preventDefault();
    clearFeedback();

    try {
      await confirm(form.email, form.code);
      const token = await login(form.email, form.password);
      await finalizeBootstrap(token);
      navigate(redirect);
    } catch (value) {
      setError(value instanceof Error ? value.message : "Неуспешно потвърждение.");
    }
  }

  async function handleLogin(event: FormEvent) {
    event.preventDefault();
    clearFeedback();

    try {
      const token = await login(form.email, form.password);
      await finalizeBootstrap(token);
      navigate(redirect);
    } catch (value) {
      setError(value instanceof Error ? value.message : "Неуспешен вход.");
    }
  }

  async function handlePasswordResetRequest(event: FormEvent) {
    event.preventDefault();
    clearFeedback();

    try {
      await requestPasswordReset(form.email);
      setScreen("forgot-confirm");
      setMessage(
        configured
          ? "Изпратихме код за нова парола. Въведи го заедно с новата си парола."
          : "За mock режим използвай код 123456 и избери нова парола."
      );
    } catch (value) {
      setError(value instanceof Error ? value.message : "Неуспешно изпращане на код.");
    }
  }

  async function handlePasswordResetConfirm(event: FormEvent) {
    event.preventDefault();
    clearFeedback();

    try {
      await completePasswordReset(form.email, form.code, form.newPassword);
      setScreen("login");
      setForm((current) => ({ ...current, code: "", newPassword: "", password: "" }));
      setMessage("Паролата е обновена успешно. Можеш да влезеш с новата парола.");
    } catch (value) {
      setError(value instanceof Error ? value.message : "Неуспешно обновяване на паролата.");
    }
  }

  return (
    <section className="section auth-section">
      <div className="container auth-layout">
        <div className="auth-copy">
          <p className="eyebrow">Вход и регистрация</p>
          <h1>Една страница за достъп, създадена по-подредено и по-професионално.</h1>
          <p>
            Потвърждението се появява само след успешна регистрация. Възстановяването на
            парола е отделен професионален поток с forgot password стъпка и нов код.
          </p>

          <div className="panel auth-side-panel">
            <h2>{authStageTitle}</h2>
            <p className="section-heading__copy">{authStageDescription}</p>
            <ul>
              <li>Потребителски акаунт с Free или Pro достъп</li>
              <li>Консултантски профил с отделна страница и видимост</li>
              <li>Подредено начало за CV, документи и заявки</li>
            </ul>
            <Link className="ghost-button" to="/preview-account">
              Тествай mock signup
            </Link>
            {(screen === "register" || screen === "confirm") && (
              <div className="panel panel--subtle">
                <strong>{form.role === "consultant" ? "Избран тип: Консултант" : "Избран тип: Потребител"}</strong>
                <p>{registrationSummary}</p>
              </div>
            )}
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
              <div className="two-column">
                <label>
                  Тип акаунт
                  <select
                    value={form.role}
                    onChange={(event) =>
                      setForm({ ...form, role: event.target.value as UserRole })
                    }
                  >
                    <option value="client">Потребител</option>
                    <option value="consultant">Консултант</option>
                  </select>
                </label>
                <label>
                  Членство
                  <select
                    value={form.plan}
                    onChange={(event) =>
                      setForm({ ...form, plan: event.target.value as PlanTier })
                    }
                  >
                    <option value="free">Free</option>
                    <option value="pro">Pro</option>
                  </select>
                </label>
              </div>
              <p className="form-note">
                Потребителите могат да започнат безплатно или да активират Pro с повече
                профили и пространство за документи. Консултантите също имат Free и Pro
                опция.
              </p>
              <div className="panel panel--subtle">
                <strong>Избрано членство</strong>
                <p>{registrationSummary}</p>
              </div>
              <button className="primary-button" type="submit">
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
        headline: String(formData.get("headline") || ""),
        bio: String(formData.get("bio") || ""),
        plan: formData.get("plan") as PlanTier
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
      ? profile.plan === "pro"
        ? "Pro профилът ти е позициониран за по-богата презентация и premium видимост."
        : "Free профилът ти е активен и може да бъде надграден към Pro по всяко време."
      : profile.plan === "pro"
        ? "Pro акаунтът ти отключва пълния каталог и разширено пространство за документи."
        : "Free акаунтът ти включва базов профил, основен документ и достъп до подбрана част от каталога.";
  const profileCompletion = getProfileCompletion(profile, consultantProfile);
  const nextBooking = getNextBooking(bookings);
  const setupChecklist =
    profile.role === "consultant"
      ? [
          "Подреди headline и биографията си така, че да звучат уверено и конкретно.",
          "Добави езици, специализации и свободни слотове за по-лесно резервиране.",
          "Прегледай публичния си профил така, както ще го виждат потребителите."
        ]
      : [
          "Добави град, headline и кратко описание, за да имаш по-пълен профил.",
          "Качи основното си CV, за да държиш материалите си на едно място.",
          "Разгледай каталога и запази следващата консултация директно от профила на консултанта."
        ];

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

          <form className="panel form-stack" onSubmit={saveProfile}>
            <h2>Основен профил</h2>
            <p className="section-caption">
              Попълни основните данни така, че профилът ти да е ясен още от първия прочит.
            </p>
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
            <label>
              Кратко заглавие
              <input
                name="headline"
                defaultValue={profile.headline || ""}
                placeholder="Например: Product manager в преход към leadership роля"
                required
              />
            </label>
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
            <label>
              Членство
              <select name="plan" defaultValue={profile.plan}>
                <option value="free">Free</option>
                <option value="pro">Pro</option>
              </select>
            </label>
            <button className="primary-button" type="submit">
              Запази профила
            </button>
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
              <h2>Консултантски профил</h2>
              <p className="section-caption">
                Това е публичната витрина на услугата ти. Колкото по-точен и пълен е
                профилът, толкова по-лесно ще бъде разбран от нови потребители.
              </p>
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
              <label>
                Заглавие
                <input
                  name="consultantHeadline"
                  defaultValue={consultantProfile?.headline || ""}
                  placeholder="Например: Стратег за leadership преходи и executive позициониране"
                  required
                />
              </label>
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
              <div className="two-column">
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
                Специализации
                <input
                  name="specializations"
                  defaultValue={consultantProfile?.specializations.join(", ") || ""}
                  placeholder="Executive CV, интервю подготовка, leadership"
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
              <label>
                Тагове
                <input
                  name="tags"
                  defaultValue={consultantProfile?.tags.join(", ") || ""}
                  placeholder="Leadership, Product, Promotions"
                />
              </label>
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
              <button className="primary-button" type="submit">
                Запази консултантския профил
              </button>
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
                    ? "Виж как изглежда каталогът"
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
              <strong>{plan.price}</strong>
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

function ConsultantCard({ consultant }: { consultant: ConsultantProfile }) {
  return (
    <article className="consultant-card">
      <img src={resolvePublicUrl(consultant.heroUrl)} alt={consultant.name} />
      <div className="consultant-card__body">
        <div className="consultant-card__top">
          <div>
            <span className={consultant.featured ? "status-badge" : "plan-pill"}>
              {consultant.featured ? "Подбран профил" : "Активен профил"}
            </span>
            <h3>{consultant.name}</h3>
            <p>{consultant.headline}</p>
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
