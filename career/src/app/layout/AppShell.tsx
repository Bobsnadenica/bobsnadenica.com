import { useEffect, useState } from "react";
import { Link, NavLink, Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { api } from "../../lib/api";
import { useAuth } from "../../lib/auth";
import {
  clearPendingBootstrap,
  clearSocialAuthIntent,
  readPendingBootstrap,
  readSocialAuthIntent
} from "../../lib/auth-flow";
import { config } from "../../lib/config";
import AboutPage from "../pages/AboutPage";
import AccountPage from "../pages/AccountPage";
import AuthPage from "../pages/AuthPage";
import ConsultantProfilePage from "../pages/ConsultantProfilePage";
import ConsultantsPage from "../pages/ConsultantsPage";
import ContactPage from "../pages/ContactPage";
import FaqPage from "../pages/FaqPage";
import HomePage from "../pages/HomePage";
import LegalPage from "../pages/LegalPage";
import NotFoundPage from "../pages/NotFoundPage";
import ProfilePage from "../pages/ProfilePage";
import UsersPage from "../pages/UsersPage";

function brandMark() {
  return (
    <span className="brand-mark" aria-hidden="true">
      <span className="brand-mark__vertical" />
      <span className="brand-mark__horizontal" />
    </span>
  );
}

const primaryNavigation = [
  { to: "/", label: "Начало" },
  { to: "/users", label: "За потребители" },
  { to: "/consultants", label: "За консултанти" }
] as const;

const footerPlatformLinks = [
  { to: "/users", label: "За потребители" },
  { to: "/consultants", label: "За консултанти" },
  { to: "/auth", label: "Вход и регистрация" },
  { to: "/dashboard", label: "Моето табло" }
] as const;

const footerCompanyLinks = [
  { to: "/about", label: "За нас" },
  { to: "/faq", label: "FAQ" },
  { to: "/contact", label: "Контакти" }
] as const;

const footerLegalLinks = [
  { to: "/legal", label: "Условия и поверителност" },
  { to: "/legal", label: "Cookies и комуникации" },
  { to: "/contact", label: "Правни запитвания" }
] as const;

const footerBottomLinks = [
  { to: "/about", label: "За нас" },
  { to: "/faq", label: "FAQ" },
  { to: "/legal", label: "Правна информация" },
  { to: "/contact", label: "Контакти" }
] as const;

function resolveDocumentTitle(pathname: string) {
  if (pathname === "/") {
    return "Начало";
  }

  if (pathname === "/users") {
    return "За потребители";
  }

  if (pathname === "/consultants") {
    return "За консултанти";
  }

  if (pathname.startsWith("/consultants/")) {
    return "Профил на консултант";
  }

  if (pathname === "/auth") {
    return "Вход и регистрация";
  }

  if (pathname === "/account" || pathname === "/dashboard") {
    return "Моето табло";
  }

  if (pathname === "/about") {
    return "За нас";
  }

  if (pathname === "/contact") {
    return "Контакти";
  }

  if (pathname === "/faq") {
    return "Често задавани въпроси";
  }

  if (pathname === "/legal") {
    return "Правна информация";
  }

  return "CareerLane";
}

function RouteExperience() {
  const location = useLocation();

  useEffect(() => {
    const title = resolveDocumentTitle(location.pathname);

    document.title =
      title === config.appName ? config.appName : `${title} | ${config.appName}`;
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [location.pathname]);

  return null;
}

export default function AppShell() {
  const { user, token, loading, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const currentYear = new Date().getFullYear();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isRouteTransitioning, setIsRouteTransitioning] = useState(false);

  useEffect(() => {
    setIsRouteTransitioning(true);

    const timeout = window.setTimeout(() => {
      setIsRouteTransitioning(false);
    }, 340);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [location.pathname]);

  useEffect(() => {
    if (loading || !user || !token) {
      return;
    }

    const socialIntent = readSocialAuthIntent();

    if (!socialIntent) {
      return;
    }

    let cancelled = false;
    let completed = false;

    async function finishSocialSignIn() {
      try {
        const pendingBootstrap = readPendingBootstrap();

        if (pendingBootstrap) {
          await api.bootstrapUser(token, {
            ...pendingBootstrap,
            name: pendingBootstrap.name.trim() || user.name,
            email: pendingBootstrap.email.trim() || user.email,
            avatarUrl: user.avatarUrl || pendingBootstrap.avatarUrl || ""
          });
          clearPendingBootstrap();
        } else {
          try {
            await api.getMyProfile(token);
          } catch (value) {
            const message = value instanceof Error ? value.message : "";

            if (!message.includes("Profile not found")) {
              throw value;
            }

            await api.bootstrapUser(token, {
              name: user.name || user.email,
              email: user.email,
              role: "client",
              plan: "free",
              avatarUrl: user.avatarUrl || ""
            });
          }
        }

        if (!cancelled) {
          completed = true;
          navigate(socialIntent.redirect || "/dashboard", { replace: true });
        }
      } catch {
        if (!cancelled) {
          const authParams = new URLSearchParams();
          authParams.set("tab", "register");
          authParams.set("social", "1");
          authParams.set("redirect", socialIntent.redirect || "/dashboard");
          navigate(`/auth?${authParams.toString()}`, { replace: true });
        }
      } finally {
        clearSocialAuthIntent();

        if (completed) {
          clearPendingBootstrap();
        }
      }
    }

    void finishSocialSignIn();

    return () => {
      cancelled = true;
    };
  }, [loading, location.key, navigate, token, user]);

  async function handleLogout() {
    if (isLoggingOut) {
      return;
    }

    setIsLoggingOut(true);

    try {
      await new Promise((resolve) => window.setTimeout(resolve, 180));
      await logout();
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <div className={`site-shell ${isLoggingOut ? "site-shell--signing-out" : ""}`}>
      <RouteExperience />
      <a className="skip-link" href="#main-content">
        Към съдържанието
      </a>
      <header className="site-header">
        <div
          className={`route-transition ${isRouteTransitioning ? "route-transition--active" : ""}`}
          aria-hidden="true"
        />
        <div className="container site-header__inner">
          <Link className="brand-link" to="/">
            {brandMark()}
            <div>
              <strong>{config.appName}</strong>
              <span>Професионална мрежа за кариерно позициониране</span>
            </div>
          </Link>

          <nav className="site-nav" aria-label="Основна навигация">
            {primaryNavigation.map((item) => (
              <NavLink key={item.to} to={item.to}>
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="site-header__actions">
            {user ? (
              <>
                <span className="user-chip">{user.name}</span>
                <Link className="ghost-button" to="/dashboard">
                  Профил
                </Link>
                <button
                  className="ghost-button"
                  type="button"
                  disabled={isLoggingOut}
                  onClick={handleLogout}
                >
                  {isLoggingOut ? "Излизаме..." : "Изход"}
                </button>
              </>
            ) : (
              <Link className="ghost-button" to="/auth">
                Вход / Регистрация
              </Link>
            )}
          </div>
        </div>
        <div className="container">
          <nav className="site-nav site-nav--mobile" aria-label="Мобилна навигация">
            {primaryNavigation.map((item) => (
              <NavLink key={item.to} to={item.to}>
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main id="main-content" className="page-main">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/consultants" element={<ConsultantsPage />} />
          <Route path="/consultants/:slug" element={<ConsultantProfilePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/faq" element={<FaqPage />} />
          <Route path="/legal" element={<LegalPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="/dashboard" element={<ProfilePage />} />
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
              {footerPlatformLinks.map((item) => (
                <li key={`${item.to}-${item.label}`}>
                  <Link to={item.to}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="footer-column">
            <h4>Компания</h4>
            <ul className="footer-links">
              {footerCompanyLinks.map((item) => (
                <li key={item.to}>
                  <Link to={item.to}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="footer-column">
            <h4>Правна информация</h4>
            <ul className="footer-links">
              {footerLegalLinks.map((item) => (
                <li key={`${item.to}-${item.label}`}>
                  <Link to={item.to}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="container footer-bottom">
          <span>
            {currentYear} {config.appName}. Всички права запазени.
          </span>
          <div className="footer-bottom__links">
            {footerBottomLinks.map((item) => (
              <Link key={`${item.to}-${item.label}`} to={item.to}>
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
