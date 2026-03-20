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

function brandMark() {
  return (
    <span className="brand-mark" aria-hidden="true">
      <span className="brand-mark__vertical" />
      <span className="brand-mark__horizontal" />
    </span>
  );
}

function AppShell() {
  const { user, logout, configured } = useAuth();

  return (
    <div className="site-shell">
      <header className="site-header">
        <div className="container site-header__inner">
          <Link className="brand-link" to="/">
            {brandMark()}
            <div>
              <strong>{config.appName}</strong>
              <span>Career consultants marketplace</span>
            </div>
          </Link>

          <nav className="site-nav">
            <NavLink to="/consultants">Консултанти</NavLink>
            <NavLink to="/pricing">Планове</NavLink>
            <NavLink to="/dashboard">Табло</NavLink>
          </nav>

          <div className="site-header__actions">
            {!configured && <span className="status-badge">Demo mode</span>}
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
            <h3>CareerDoc</h3>
            <p>
              Версия за кариерни консултанти, вдъхновена от Superdoc, но построена за
              срещи, профили, документи и професионално развитие.
            </p>
          </div>
          <div>
            <h4>За платформата</h4>
            <ul>
              <li>Открий консултант</li>
              <li>Резервирай сесия</li>
              <li>Качи CV и профил</li>
            </ul>
          </div>
          <div>
            <h4>Технологии</h4>
            <ul>
              <li>GitHub Pages frontend</li>
              <li>AWS Cognito + Lambda + DynamoDB + S3</li>
              <li>Terraform инфраструктура</li>
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

  return (
    <>
      <section className="hero">
        <div className="container hero__grid">
          <div className="hero__copy">
            <p className="eyebrow">Booking platform for career growth</p>
            <h1>Намери точния кариерен консултант и резервирай сесия онлайн.</h1>
            <p className="hero__lede">
              CareerDoc пренася модела на Superdoc в света на кариерното консултиране:
              публични профили, свободни часове, документи, планове и табла за работа с
              клиенти и консултанти.
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
                  placeholder="CV, интервю, career change, leadership..."
                />
              </label>
              <button className="primary-button" type="submit">
                Намери консултант
              </button>
            </form>

            <div className="hero-stats">
              <div>
                <strong>3+</strong>
                <span>готови профила в демо версията</span>
              </div>
              <div>
                <strong>2 роли</strong>
                <span>client и consultant</span>
              </div>
              <div>
                <strong>Free / Pro</strong>
                <span>подготвен модел за планове</span>
              </div>
            </div>
          </div>

          <aside className="hero__card">
            <div className="hero__card-top">
              <span className="status-badge status-badge--success">Най-ранна сесия</span>
              <strong>събота, 21 март · 10:30</strong>
              <p>Никол Славова · Portfolio review и първа силна кандидатура</p>
            </div>
            <div className="hero__consultant">
              <img src="/assets/consultant-1.jpg" alt="Анна Петрова" />
              <div>
                <strong>Анна Петрова</strong>
                <p>CV стратегия · LinkedIn · Интервю подготовка</p>
                <span>4.9 рейтинг · 214 мнения</span>
              </div>
            </div>
            <Link className="ghost-button" to="/consultants/anna-petrova">
              Виж профила
            </Link>
          </aside>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Featured consultants</p>
              <h2>Подобно на Superdoc, но за кариерни консултанти.</h2>
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
            <span className="journey-card__step">1</span>
            <h3>Откриване</h3>
            <p>Публични профили с цена, специализация, локация, езици и свободни часове.</p>
          </article>
          <article className="journey-card">
            <span className="journey-card__step">2</span>
            <h3>Профил и документи</h3>
            <p>Потребителите поддържат профил, план и качват CV документ за работа по сесиите.</p>
          </article>
          <article className="journey-card">
            <span className="journey-card__step">3</span>
            <h3>Booking flow</h3>
            <p>Избор на консултант, час, бележка за сесията и преглед на историята в таблото.</p>
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
            <p className="eyebrow">Consultants directory</p>
            <h2>Открий подходящ консултант за следващия си професионален ход.</h2>
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
              placeholder="CV, interviews, leadership..."
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
            <img className="profile-card__avatar" src={consultant.avatarUrl} alt={consultant.name} />
            <div>
              <p className="eyebrow">Career consultant</p>
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
            <span>за индивидуална сесия</span>
            <p>Следващ свободен час: {formatDate(consultant.nextAvailable)}</p>
            <img src={consultant.mapImageUrl} alt={consultant.city} />
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
            <h2>Запази сесия</h2>
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
                placeholder="Например: искам преглед на CV, позициониране за leadership роли и интервю подготовка."
              />
            </label>

            {message ? <div className="panel panel--success">{message}</div> : null}
            {error ? <div className="panel panel--error">{error}</div> : null}

            <button className="primary-button" type="submit">
              {user ? "Заяви сесия" : "Влез и заяви сесия"}
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
            <p className="eyebrow">Plans</p>
            <h2>Free и Pro нива за по-силен career workflow.</h2>
          </div>
        </div>

        <div className="pricing-grid">
          <article className="pricing-card">
            <h3>Free</h3>
            <strong>0 лв.</strong>
            <ul>
              <li>Базов профил</li>
              <li>CV документ</li>
              <li>Резервации и история</li>
            </ul>
          </article>
          <article className="pricing-card pricing-card--featured">
            <span className="status-badge">Recommended</span>
            <h3>Pro</h3>
            <strong>29 лв. / месец</strong>
            <ul>
              <li>Приоритетен onboarding</li>
              <li>Разширен profile positioning</li>
              <li>Повече документи и premium features</li>
            </ul>
          </article>
        </div>

        <div className="panel">
          Реалното картово плащане не е включено в тази първа версия. Данните за `free/pro`
          са подготвени в модела и могат да се свържат със Stripe в следващия етап.
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
    configured ? "" : "Работим в mock режим. Кодът за потвърждение е 123456."
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
          <p className="eyebrow">Account access</p>
          <h1>Вход, регистрация и onboarding за клиенти и консултанти.</h1>
          <p>
            С Cognito в production и local mock режим за development можем да работим по UX
            и таблата още преди AWS да е provisioned.
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
                    <option value="client">Client</option>
                    <option value="consultant">Consultant</option>
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
              <span className="chip chip--soft">{profile.role}</span>
              <span className="chip chip--soft">{profile.plan}</span>
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
              Headline
              <input name="headline" defaultValue={profile.headline || ""} />
            </label>
            <label>
              Bio
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
                    {booking.status}
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
                  Display name
                  <input name="displayName" defaultValue={consultantProfile.name} />
                </label>
              </div>
              <label>
                Headline
                <input
                  name="consultantHeadline"
                  defaultValue={consultantProfile.headline}
                />
              </label>
              <label>
                Bio
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
                Specializations
                <input
                  name="specializations"
                  defaultValue={consultantProfile.specializations.join(", ")}
                />
              </label>
              <label>
                Session modes
                <input name="sessionModes" defaultValue={consultantProfile.sessionModes.join(", ")} />
              </label>
              <label>
                Tags
                <input name="tags" defaultValue={consultantProfile.tags.join(", ")} />
              </label>
              <label>
                Availability (one ISO date per line)
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
      <img src={consultant.avatarUrl} alt={consultant.name} />
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
          Виж профила
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
