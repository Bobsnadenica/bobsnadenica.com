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
                : pathname === "/account" || pathname === "/dashboard"
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

export default function AppShell() {
  const { user, token, loading, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const currentYear = new Date().getFullYear();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

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
        <div className="container site-header__inner">
          <Link className="brand-link" to="/">
            {brandMark()}
            <div>
              <strong>{config.appName}</strong>
              <span>Професионална мрежа за кариерно позициониране</span>
            </div>
          </Link>

          <nav className="site-nav" aria-label="Основна навигация">
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
            <NavLink to="/">Начало</NavLink>
            <NavLink to="/users">За потребители</NavLink>
            <NavLink to="/consultants">За консултанти</NavLink>
          </nav>
        </div>
      </header>

      <main id="main-content">
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
                <Link to="/contact">Контакти</Link>
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
          <span>
            {currentYear} {config.appName}. Всички права запазени.
          </span>
          <div className="footer-bottom__links">
            <Link to="/about">За нас</Link>
            <Link to="/faq">FAQ</Link>
            <Link to="/legal">Правна информация</Link>
            <Link to="/contact">Контакти</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
