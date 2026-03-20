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
    ctaLabel: "Създай безплатен профил",
    ctaTo: "/auth?tab=register"
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
    ctaLabel: "Активирай Pro",
    ctaTo: "/auth?tab=register"
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
    ctaLabel: "Започни като консултант",
    ctaTo: "/auth?tab=register"
  },
  {
    name: "Pro",
    price: "По заявка",
    badge: "Премиум присъствие",
    featured: true,
    note: "За консултанти, които искат по-силно позициониране и по-представителен профил.",
    points: [
      "По-видимо позициониране в каталога",
      "Разширен профил с повече секции и материали",
      "Приоритетна поддръжка и premium lead flow"
    ],
    ctaLabel: "Заяви Pro профил",
    ctaTo: "/auth?tab=register"
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

function formatDate(date: string) {
  return new Intl.DateTimeFormat("bg-BG", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(date));
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

function brandMark() {
  return (
    <span className="brand-mark" aria-hidden="true">
      <span className="brand-mark__vertical" />
      <span className="brand-mark__horizontal" />
    </span>
  );
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

function AppShell() {
  const { user, logout } = useAuth();

  return (
    <div className="site-shell">
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
                  Табло
                </Link>
                <button className="ghost-button" onClick={() => logout()}>
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
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/pricing" element={<Navigate to="/users" replace />} />
        </Routes>
      </main>

      <footer className="site-footer">
        <div className="container footer-grid">
          <div>
            <h3>{config.appName}</h3>
            <p>
              Професионална платформа за консултации, позициониране и по-ясна следваща
              стъпка в кариерата.
            </p>
          </div>
          <div>
            <h4>Потребители</h4>
            <ul>
              <li>Каталог с консултанти</li>
              <li>Free и Pro достъп</li>
              <li>CV и документен профил</li>
            </ul>
          </div>
          <div>
            <h4>Консултанти</h4>
            <ul>
              <li>Публично присъствие</li>
              <li>Слотове и заявки</li>
              <li>Pro позициониране</li>
            </ul>
          </div>
          <div>
            <h4>Партньори</h4>
            <ul>
              <li>Рекламни позиции</li>
              <li>Видимост към активна аудитория</li>
              <li>Работодателски и образователни кампании</li>
            </ul>
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
              <span className="status-badge status-badge--success">Featured consultant</span>
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
              <span>Sponsored banner placement</span>
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
                <strong>{plan === "pro" ? "Разширен vault" : "Базов профил"}</strong>
                <span>{plan === "pro" ? "CV, дипломи и портфолио" : "основен CV документ"}</span>
              </div>
              <div>
                <strong>{profile ? formatPlanLabel(plan) : "Гост preview"}</strong>
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
                  : "Pro добавя още профили за разглеждане, повече пространство за документи и по-пълен workflow."}
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
        <div className="container">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Каталог за потребители</p>
              <h2>Филтрирай, сравнявай и разгледай профилите в професионален вид.</h2>
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
                placeholder="Executive CV, интервю, leadership, career switch..."
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
              <span className="status-badge status-badge--success">Consultant profile</span>
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
              <span className="chip">Interview prep</span>
              <span className="chip">Career transitions</span>
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
            <p>При нужда от premium presence преминаваш към Pro профил с по-силно позициониране.</p>
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
            <h2>Какво подготвяш тук</h2>
            <ul>
              <li>Потребителски акаунт с Free или Pro достъп</li>
              <li>Консултантски профил с отделна страница и видимост</li>
              <li>Подредено начало за CV, документи и заявки</li>
            </ul>
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
                  value={form.email}
                  onChange={(event) => setForm({ ...form, email: event.target.value })}
                  autoComplete="email"
                />
              </label>
              <label>
                Парола
                <input
                  type="password"
                  value={form.password}
                  onChange={(event) => setForm({ ...form, password: event.target.value })}
                  autoComplete="current-password"
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
                />
              </label>
              <label>
                Имейл
                <input
                  value={form.email}
                  onChange={(event) => setForm({ ...form, email: event.target.value })}
                  autoComplete="email"
                />
              </label>
              <label>
                Парола
                <input
                  type="password"
                  value={form.password}
                  onChange={(event) => setForm({ ...form, password: event.target.value })}
                  autoComplete="new-password"
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
                  value={form.email}
                  onChange={(event) => setForm({ ...form, email: event.target.value })}
                />
              </label>
              <label>
                Код за потвърждение
                <input
                  value={form.code}
                  onChange={(event) => setForm({ ...form, code: event.target.value })}
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
                  value={form.email}
                  onChange={(event) => setForm({ ...form, email: event.target.value })}
                  autoComplete="email"
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
                  value={form.email}
                  onChange={(event) => setForm({ ...form, email: event.target.value })}
                  autoComplete="email"
                />
              </label>
              <label>
                Код
                <input
                  value={form.code}
                  onChange={(event) => setForm({ ...form, code: event.target.value })}
                />
              </label>
              <label>
                Нова парола
                <input
                  type="password"
                  value={form.newPassword}
                  onChange={(event) => setForm({ ...form, newPassword: event.target.value })}
                  autoComplete="new-password"
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
        ? "Pro профилът ти е позициониран за по-богата презентация и premium visibility."
        : "Free профилът ти е активен и може да бъде надграден към Pro по всяко време."
      : profile.plan === "pro"
        ? "Pro акаунтът ти отключва пълния каталог и разширено пространство за документи."
        : "Free акаунтът ти включва базов профил, основен документ и достъп до подбрана част от каталога.";

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

          <form className="panel form-stack" onSubmit={saveProfile}>
            <h2>Основен профил</h2>
            <div className="two-column">
              <label>
                Име
                <input name="name" defaultValue={profile.name} />
              </label>
              <label>
                Град
                <input name="city" defaultValue={profile.city || ""} />
              </label>
            </div>
            <label>
              Кратко заглавие
              <input
                name="headline"
                defaultValue={profile.headline || ""}
                placeholder="Например: Product manager в преход към leadership роля"
              />
            </label>
            <label>
              Професионално описание
              <textarea
                name="bio"
                rows={5}
                defaultValue={profile.bio || ""}
                placeholder="Разкажи накратко за посоката си, опита си и какво търсиш."
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
            <p className="form-note">
              Free включва основен CV документ. Pro е подготвен за разширено пространство
              за допълнителни материали.
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
              <div className="two-column">
                <label>
                  Slug
                  <input name="slug" defaultValue={consultantProfile?.slug || ""} />
                </label>
                <label>
                  Име за профила
                  <input name="displayName" defaultValue={consultantProfile?.name || profile.name} />
                </label>
              </div>
              <label>
                Заглавие
                <input
                  name="consultantHeadline"
                  defaultValue={consultantProfile?.headline || ""}
                  placeholder="Например: Executive career strategist for leadership moves"
                />
              </label>
              <label>
                Биография
                <textarea
                  name="consultantBio"
                  rows={5}
                  defaultValue={consultantProfile?.bio || ""}
                />
              </label>
              <div className="two-column">
                <label>
                  Град
                  <input name="consultantCity" defaultValue={consultantProfile?.city || ""} />
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
                />
              </label>
              <label>
                Специализации
                <input
                  name="specializations"
                  defaultValue={consultantProfile?.specializations.join(", ") || ""}
                  placeholder="Executive CV, Interview coaching, Leadership"
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
                />
              </label>
              <button className="primary-button" type="submit">
                Запази консултантския профил
              </button>
            </form>
          ) : null}

          <section className="panel">
            <h2>Предстоящи сесии</h2>
            {bookings.length === 0 ? (
              <p>Все още няма заявки или потвърдени консултации.</p>
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
