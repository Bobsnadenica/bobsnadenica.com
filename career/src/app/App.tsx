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
import { AuthProvider, useAuth } from "../lib/auth";
import { config } from "../lib/config";
import { api } from "../lib/api";
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

function formatDate(date: string) {
  return new Intl.DateTimeFormat("bg-BG", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(date));
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("bg-BG", {
    style: "currency",
    currency: "BGN",
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

const pricingTracks = [
  {
    audience: "За професионалисти",
    title: "Започни безплатно и надгради към Pro, когато искаш по-силно позициониране.",
    description:
      "Free планът е подходящ за първи профил, резервации и качване на материали. Pro е за по-ясна подготовка, приоритет и разширено присъствие.",
    plans: [
      {
        name: "Free",
        price: "0 лв.",
        points: [
          "Профил и история на сесиите",
          "Записване на консултации",
          "Качване на CV и работни файлове"
        ]
      },
      {
        name: "Pro",
        price: "29 лв. / месец",
        featured: true,
        points: [
          "Приоритетен onboarding и по-бърз старт",
          "Разширени ресурси за подготовка",
          "По-силно позициониране за следващия ход"
        ]
      }
    ]
  },
  {
    audience: "За консултанти",
    title: "Изгради публично присъствие без входна бариера и отключи Pro при растеж.",
    description:
      "Free планът е достатъчен за старт, а Pro дава повече видимост, по-силно представяне на услугите и по-премиум присъствие.",
    plans: [
      {
        name: "Free",
        price: "0 лв.",
        points: [
          "Публичен профил и основни данни",
          "Цени, езици и свободни часове",
          "Получаване на нови заявки"
        ]
      },
      {
        name: "Pro",
        price: "49 лв. / месец",
        featured: true,
        points: [
          "По-видимо позициониране в каталога",
          "По-богат профил и по-силно представяне",
          "По-добър conversion flow за нови клиенти"
        ]
      }
    ]
  }
] as const;

function brandMark() {
  return (
    <span className="brand-mark" aria-hidden="true">
      <span className="brand-mark__vertical" />
      <span className="brand-mark__horizontal" />
    </span>
  );
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
            <NavLink to="/consultants">Консултанти</NavLink>
            <NavLink to="/pricing">Планове</NavLink>
            <NavLink to="/dashboard">Табло</NavLink>
          </nav>

          <div className="site-header__actions">
            {user ? (
              <>
                <span className="user-chip">{user.name}</span>
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
          <Route path="/consultants" element={<ConsultantsPage />} />
          <Route path="/consultants/:slug" element={<ConsultantPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
        </Routes>
      </main>

      <footer className="site-footer">
        <div className="container footer-grid">
          <div>
            <h3>{config.appName}</h3>
            <p>
              Платформа за професионалисти, консултанти и партньори, които искат по-ясно
              професионално присъствие, по-добро позициониране и по-силен следващ ход.
            </p>
          </div>
          <div>
            <h4>За професионалисти</h4>
            <ul>
              <li>Открий подходящ консултант</li>
              <li>Поддържай силен профил</li>
              <li>Записвай сесии и следващи стъпки</li>
            </ul>
          </div>
          <div>
            <h4>За консултанти</h4>
            <ul>
              <li>Публично присъствие с ясен фокус</li>
              <li>Свободни часове и ясни цени</li>
              <li>Free старт и Pro видимост</li>
            </ul>
          </div>
          <div>
            <h4>За партньори</h4>
            <ul>
              <li>Рекламни позиции в ключови зони</li>
              <li>Подходящо за работодателски брандове и академии</li>
              <li>Видимост пред активна професионална аудитория</li>
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
  const featured = useMemo(() => demoConsultants.filter((item) => item.featured), []);
  const spotlight = featured[0] || demoConsultants[0];

  return (
    <>
      <section className="hero">
        <div className="container hero__grid">
          <div className="hero__copy">
            <p className="eyebrow">Професионална кариерна мрежа</p>
            <h1>Намери правилния консултант и представи следващата си стъпка с увереност.</h1>
            <p className="hero__lede">
              CareerLane събира на едно място професионалисти, които търсят по-силно
              позициониране, и консултанти, които искат по-видимо присъствие, свободни
              часове и доверие още от първия поглед.
            </p>

            <form
              className="search-card"
              onSubmit={(event) => {
                event.preventDefault();
                navigate(`/consultants?q=${encodeURIComponent(query)}`);
              }}
            >
              <label>
                Какво търсиш?
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="CV стратегия, лидерски роли, интервю, кариерна промяна..."
                />
              </label>
              <button className="primary-button" type="submit">
                Намери консултант
              </button>
            </form>

            <div className="hero-stats">
              <div>
                <strong>Free</strong>
                <span>старт и за професионалисти, и за консултанти</span>
              </div>
              <div>
                <strong>Pro</strong>
                <span>за повече видимост, инструменти и приоритет</span>
              </div>
              <div>
                <strong>Ясни профили</strong>
                <span>цени, фокус и свободни часове на едно място</span>
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
              <img
                src={resolvePublicUrl(spotlight.avatarUrl)}
                alt={spotlight.name}
              />
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
                <span>Следващ час</span>
                <strong>{formatDate(spotlight.nextAvailable)}</strong>
              </div>
              <div>
                <span>Цена</span>
                <strong>{formatCurrency(spotlight.priceBgn)}</strong>
              </div>
            </div>
            <Link className="primary-button" to={`/consultants/${spotlight.slug}`}>
              Прегледай профила
            </Link>
          </aside>
        </div>
      </section>

      <section className="section section--tight">
        <div className="container">
          <aside className="ad-banner">
            <div>
              <span className="ad-banner__label">Реклама</span>
              <h2>Имате академия, работодателски бранд или leadership програма?</h2>
              <p>
                Покажете я на хора и консултанти точно когато планират следващото си
                професионално решение.
              </p>
            </div>
            <div className="ad-banner__actions">
              <span>Спонсорирана позиция</span>
              <Link className="ghost-button" to="/auth">
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
              <p className="eyebrow">Подбрани консултанти</p>
              <h2>Профили с ясна експертиза, реални цени и силно професионално присъствие.</h2>
            </div>
            <Link className="ghost-button" to="/consultants">
              Виж всички
            </Link>
          </div>

          <div className="consultant-grid">
            {featured.map((consultant) => (
              <ConsultantCard key={consultant.consultantId} consultant={consultant} />
            ))}
          </div>
        </div>
      </section>

      <section className="section section--alt">
        <div className="container journey-grid">
          <article className="journey-card">
            <span className="journey-card__step">01</span>
            <h3>За професионалисти</h3>
            <p>Откриваш консултант по фокус, цена, локация и стил на работа.</p>
          </article>
          <article className="journey-card">
            <span className="journey-card__step">02</span>
            <h3>За консултанти</h3>
            <p>Създаваш профил, публикуваш свободни часове и изграждаш доверие още при първото посещение.</p>
          </article>
          <article className="journey-card">
            <span className="journey-card__step">03</span>
            <h3>Free и Pro</h3>
            <p>И двете роли могат да стартират безплатно и да преминат към Pro при нужда от повече видимост и инструменти.</p>
          </article>
        </div>
      </section>
    </>
  );
}

function ConsultantsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [consultants, setConsultants] = useState<ConsultantProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const query = searchParams.get("q") || "";
  const city = searchParams.get("city") || "";

  useEffect(() => {
    let mounted = true;

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

  return (
    <section className="section">
      <div className="container">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Каталог с консултанти</p>
            <h2>Открий консултант с подходящ фокус, ниво на опит и професионален стил.</h2>
          </div>
        </div>

        <div className="filter-bar">
          <label>
            Ключова дума
            <input
              value={query}
              onChange={(event) =>
                setSearchParams({ q: event.target.value, city })
              }
              placeholder="CV, позициониране, leadership, първа работа..."
            />
          </label>
          <label>
            Град
            <input
              value={city}
              onChange={(event) =>
                setSearchParams({ q: query, city: event.target.value })
              }
              placeholder="София, Пловдив, Варна"
            />
          </label>
        </div>

        {loading ? <div className="panel">Зареждаме консултантите...</div> : null}
        {error ? <div className="panel panel--error">{error}</div> : null}

        {!loading && !error && consultants.length === 0 ? (
          <div className="panel">Няма съвпадения за избраните филтри.</div>
        ) : null}

        <div className="consultant-grid">
          {consultants.map((consultant) => (
            <ConsultantCard key={consultant.consultantId} consultant={consultant} />
          ))}
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
      setMessage("Сесията е заявена успешно. Ще я видиш и в таблото си.");
    } catch (value) {
      setError(value instanceof Error ? value.message : "Неуспешно създаване на booking.");
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
              <p className="eyebrow">Професионален профил</p>
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
                <span>{consultant.rating} рейтинг · {consultant.reviewCount} мнения</span>
              </div>
            </div>
          </article>

          <aside className="booking-card">
            <strong>{formatCurrency(consultant.priceBgn)}</strong>
            <span>за индивидуална консултация</span>
            <p>Следващ свободен час: {formatDate(consultant.nextAvailable)}</p>
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
              <h2>Езици и формати</h2>
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
              </div>
            </article>
          </div>

          <form className="panel booking-panel" onSubmit={submitBooking}>
            <h2>Запази консултация</h2>
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
              Кратка бележка за консултацията
              <textarea
                value={note}
                onChange={(event) => setNote(event.target.value)}
                rows={5}
                placeholder="Например: искам преглед на CV, позициониране за leadership роли и подготовка за интервю."
              />
            </label>

            {message ? <div className="panel panel--success">{message}</div> : null}
            {error ? <div className="panel panel--error">{error}</div> : null}

            <button className="primary-button" type="submit">
              {user ? "Заяви консултация" : "Влез и заяви консултация"}
            </button>
          </form>
        </div>
      </section>
    </>
  );
}

function PricingPage() {
  return (
    <section className="section">
      <div className="container">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Планове</p>
            <h2>Free старт и Pro надграждане и за професионалисти, и за консултанти.</h2>
          </div>
        </div>

        <div className="pricing-stack">
          {pricingTracks.map((track) => (
            <section className="pricing-track" key={track.audience}>
              <div className="pricing-track__intro">
                <p className="eyebrow">{track.audience}</p>
                <h3>{track.title}</h3>
                <p>{track.description}</p>
              </div>

              <div className="pricing-grid">
                {track.plans.map((plan) => (
                  <article
                    className={`pricing-card ${plan.featured ? "pricing-card--featured" : ""}`}
                    key={`${track.audience}-${plan.name}`}
                  >
                    <span className={plan.featured ? "status-badge" : "plan-pill"}>
                      {plan.featured ? "Препоръчано" : "Винаги налично"}
                    </span>
                    <h3>{plan.name}</h3>
                    <strong>{plan.price}</strong>
                    <ul>
                      {plan.points.map((point) => (
                        <li key={point}>{point}</li>
                      ))}
                    </ul>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="panel">
          Безплатният план остава реална отправна точка и за двете роли. Pro е за хора,
          които искат повече видимост, по-силно представяне и по-премиум работен поток.
        </div>
      </div>
    </section>
  );
}

function AuthPage() {
  const { register, confirm, login, configured } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const redirect = params.get("redirect") || "/dashboard";

  const [mode, setMode] = useState<"login" | "register" | "confirm">("login");
  const [message, setMessage] = useState(
    configured ? "" : "За потвърждение в предварителната версия използвайте код 123456."
  );
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "client" as UserRole,
    plan: "free" as PlanTier,
    code: ""
  });

  async function handleRegister(event: FormEvent) {
    event.preventDefault();
    setError("");
    setMessage("");

    try {
      await register({
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
        plan: form.plan
      });
      window.sessionStorage.setItem(
        "careerdoc.pending-bootstrap",
        JSON.stringify({
          email: form.email,
          name: form.name,
          role: form.role,
          plan: form.plan
        })
      );
      setMode("confirm");
      setMessage("Изпратихме код за потвърждение. След това ще довършим профила автоматично.");
    } catch (value) {
      setError(value instanceof Error ? value.message : "Неуспешна регистрация.");
    }
  }

  async function handleConfirm(event: FormEvent) {
    event.preventDefault();
    setError("");

    try {
      await confirm(form.email, form.code);
      const loggedInToken = await login(form.email, form.password);
      const bootstrapRaw = window.sessionStorage.getItem("careerdoc.pending-bootstrap");

      if (bootstrapRaw) {
        const bootstrap = JSON.parse(bootstrapRaw);
        await api.bootstrapUser(loggedInToken, bootstrap);
        window.sessionStorage.removeItem("careerdoc.pending-bootstrap");
      }

      navigate(redirect);
    } catch (value) {
      setError(value instanceof Error ? value.message : "Неуспешно потвърждение.");
    }
  }

  async function handleLogin(event: FormEvent) {
    event.preventDefault();
    setError("");
    setMessage("");

    try {
      const loggedInToken = await login(form.email, form.password);
      const bootstrapRaw = window.sessionStorage.getItem("careerdoc.pending-bootstrap");

      if (bootstrapRaw) {
        const bootstrap = JSON.parse(bootstrapRaw);
        await api.bootstrapUser(loggedInToken, bootstrap);
        window.sessionStorage.removeItem("careerdoc.pending-bootstrap");
      }

      navigate(redirect);
    } catch (value) {
      setError(value instanceof Error ? value.message : "Неуспешен вход.");
    }
  }

  return (
    <section className="section auth-section">
      <div className="container auth-layout">
        <div className="auth-copy">
          <p className="eyebrow">Достъп до профил</p>
          <h1>Създай профил като професионалист или консултант.</h1>
          <p>
            И двата типа акаунти могат да започнат на Free и да преминат към Pro, когато
            имат нужда от по-силно присъствие, повече инструменти и по-добър приоритет.
          </p>
        </div>

        <div className="panel auth-card">
          <div className="tab-row">
            <button className={mode === "login" ? "tab-row__active" : ""} onClick={() => setMode("login")}>
              Вход
            </button>
            <button className={mode === "register" ? "tab-row__active" : ""} onClick={() => setMode("register")}>
              Регистрация
            </button>
            <button className={mode === "confirm" ? "tab-row__active" : ""} onClick={() => setMode("confirm")}>
              Потвърждение
            </button>
          </div>

          {message ? <div className="panel panel--success">{message}</div> : null}
          {error ? <div className="panel panel--error">{error}</div> : null}

          {mode === "login" ? (
            <form className="form-stack" onSubmit={handleLogin}>
              <label>
                Имейл
                <input value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
              </label>
              <label>
                Парола
                <input
                  type="password"
                  value={form.password}
                  onChange={(event) => setForm({ ...form, password: event.target.value })}
                />
              </label>
              <button className="primary-button" type="submit">
                Вход
              </button>
            </form>
          ) : null}

          {mode === "register" ? (
            <form className="form-stack" onSubmit={handleRegister}>
              <label>
                Име
                <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
              </label>
              <label>
                Имейл
                <input value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
              </label>
              <label>
                Парола
                <input
                  type="password"
                  value={form.password}
                  onChange={(event) => setForm({ ...form, password: event.target.value })}
                />
              </label>
              <div className="two-column">
                <label>
                  Роля
                  <select
                    value={form.role}
                    onChange={(event) =>
                      setForm({ ...form, role: event.target.value as UserRole })
                    }
                  >
                    <option value="client">Професионалист</option>
                    <option value="consultant">Консултант</option>
                  </select>
                </label>
                <label>
                  План
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
                Започваш безплатно и можеш да преминеш към Pro, когато искаш повече
                видимост и по-силно позициониране.
              </p>
              <button className="primary-button" type="submit">
                Създай профил
              </button>
            </form>
          ) : null}

          {mode === "confirm" ? (
            <form className="form-stack" onSubmit={handleConfirm}>
              <label>
                Имейл
                <input value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
              </label>
              <label>
                Код за потвърждение
                <input value={form.code} onChange={(event) => setForm({ ...form, code: event.target.value })} />
              </label>
              <button className="primary-button" type="submit">
                Потвърди и влез
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
        if (!mounted) return;
        setProfile(nextProfile);
        setBookings(nextBookings);
        setConsultantProfile(nextConsultantProfile);
      })
      .catch((value) => {
        if (!mounted) return;
        setError(value instanceof Error ? value.message : "Неуспешно зареждане на таблото.");
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
          {error ? <div className="panel panel--error">{error}</div> : <div className="panel">Зареждаме профила...</div>}
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
      setMessage("CV документът е обновен.");
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
      const updated = await api.updateMyConsultantProfile(token, {
        slug: String(formData.get("slug") || ""),
        name: String(formData.get("displayName") || ""),
        headline: String(formData.get("consultantHeadline") || ""),
        bio: String(formData.get("consultantBio") || ""),
        city: String(formData.get("consultantCity") || ""),
        experienceYears: Number(formData.get("experienceYears") || 0),
        priceBgn: Number(formData.get("priceBgn") || 0),
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
        availability: String(formData.get("availability") || "")
          .split("\n")
          .map((item) => item.trim())
          .filter(Boolean)
      });
      setConsultantProfile(updated);
      setMessage("Публичният профил на консултанта е записан.");
    } catch (value) {
      setError(value instanceof Error ? value.message : "Неуспешно записване.");
    }
  }

  return (
    <section className="section dashboard-section">
      <div className="container dashboard-grid">
        <aside className="dashboard-sidebar">
          <div className="panel">
            <p className="eyebrow">Account</p>
            <h2>{profile.name}</h2>
            <p>{profile.email}</p>
            <div className="chip-row">
              <span className="chip chip--soft">{formatRoleLabel(profile.role)}</span>
              <span className="chip chip--soft">{formatPlanLabel(profile.plan)}</span>
            </div>
          </div>
        </aside>

        <div className="dashboard-content">
          {message ? <div className="panel panel--success">{message}</div> : null}
          {error ? <div className="panel panel--error">{error}</div> : null}

          <form className="panel form-stack" onSubmit={saveProfile}>
            <h2>Личен профил</h2>
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
              Професионално заглавие
              <input name="headline" defaultValue={profile.headline || ""} />
            </label>
            <label>
              Представяне
              <textarea name="bio" rows={4} defaultValue={profile.bio || ""} />
            </label>
              <label>
                План
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
            <h2>CV документ</h2>
            <p>
              {profile.cvDocument
                ? `Последен качен файл: ${profile.cvDocument.fileName}`
                : "Все още няма качен CV документ."}
            </p>
            <input name="cv" type="file" accept=".pdf,.doc,.docx" />
            <button className="primary-button" type="submit">
              Качи CV
            </button>
          </form>

          <section className="panel">
            <h2>Резервации</h2>
            <div className="booking-list">
              {bookings.length === 0 ? <p>Все още няма резервации.</p> : null}
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
          </section>

          {profile.role === "consultant" && consultantProfile ? (
            <form className="panel form-stack" onSubmit={saveConsultantProfile}>
              <h2>Публичен профил на консултанта</h2>
              <div className="two-column">
                <label>
                  Slug
                  <input name="slug" defaultValue={consultantProfile.slug} />
                </label>
                <label>
                  Име за публичен профил
                  <input name="displayName" defaultValue={consultantProfile.name} />
                </label>
              </div>
              <label>
                Професионално заглавие
                <input
                  name="consultantHeadline"
                  defaultValue={consultantProfile.headline}
                />
              </label>
              <label>
                Представяне
                <textarea name="consultantBio" rows={5} defaultValue={consultantProfile.bio} />
              </label>
              <div className="two-column">
                <label>
                  Град
                  <input name="consultantCity" defaultValue={consultantProfile.city} />
                </label>
                <label>
                  Опит (години)
                  <input
                    name="experienceYears"
                    type="number"
                    defaultValue={consultantProfile.experienceYears}
                  />
                </label>
              </div>
              <div className="two-column">
                <label>
                  Цена (BGN)
                  <input name="priceBgn" type="number" defaultValue={consultantProfile.priceBgn} />
                </label>
                <label>
                  Езици (comma separated)
                  <input
                    name="languages"
                    defaultValue={consultantProfile.languages.join(", ")}
                  />
                </label>
              </div>
              <label>
                Специализации
                <input
                  name="specializations"
                  defaultValue={consultantProfile.specializations.join(", ")}
                />
              </label>
              <label>
                Формати на сесия
                <input name="sessionModes" defaultValue={consultantProfile.sessionModes.join(", ")} />
              </label>
              <label>
                Ключови теми
                <input name="tags" defaultValue={consultantProfile.tags.join(", ")} />
              </label>
              <label>
                Свободни часове (по един ISO час на ред)
                <textarea
                  name="availability"
                  rows={5}
                  defaultValue={consultantProfile.availability.join("\n")}
                />
              </label>
              <button className="primary-button" type="submit">
                Запази публичния профил
              </button>
            </form>
          ) : null}
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
            <h3>{consultant.name}</h3>
            <p>{consultant.headline}</p>
          </div>
          <span className="rating-pill">{consultant.rating}</span>
        </div>

        <div className="chip-row">
          {consultant.specializations.slice(0, 2).map((item) => (
            <span className="chip chip--soft" key={item}>
              {item}
            </span>
          ))}
        </div>

        <div className="consultant-card__meta">
          <span>{consultant.city}</span>
          <span>{formatCurrency(consultant.priceBgn)}</span>
          <span>{formatDate(consultant.nextAvailable)}</span>
        </div>

        <Link className="ghost-button" to={`/consultants/${consultant.slug}`}>
          Прегледай профила
        </Link>
      </div>
    </article>
  );
}

export function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <AppShell />
      </HashRouter>
    </AuthProvider>
  );
}
